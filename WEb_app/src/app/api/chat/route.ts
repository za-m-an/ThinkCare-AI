import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { AI_FEATURES, ContextEngine } from "@/lib/contextEngine";

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    // 1. Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { message, sessionId, language } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1b. Fetch or create chat session
    let session = null;
    if (sessionId) {
      session = await prisma.chatSession.findUnique({
        where: { uuid: sessionId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          userId: decoded.userId,
          title: "New Assessment",
        },
        include: { messages: true },
      });
    }

    // Save user message to database
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: "user",
        text: message,
      },
    });

    // 2. Fetch user's medical onboarding data to personalize context
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { onboarding: true },
    });

    const ob = user?.onboarding;
    const patientContext = ob
      ? `Patient Profile: Age ${new Date().getFullYear() - ob.dob.getFullYear()}, Sex ${ob.sexAtBirth}, Conditions: ${ob.conditions.join(", ")}, Medications: ${ob.medications || "None"}, Allergies: ${ob.allergies || "None"}.`
      : "No previous medical profile available.";

    // 3. Fetch Gemini API Key & Active Model Mode from SystemConfig
    const apiKeyConfig = await prisma.systemConfig.findUnique({
      where: { key: "gemini_api_key" },
    });
    const modelModeConfig = await prisma.systemConfig.findUnique({
      where: { key: "active_model_mode" },
    });

    const apiKey = apiKeyConfig?.value;
    const modelMode = modelModeConfig?.value || "catboost";
    let assistantResponse = "";
    let predictionResult: any = null;

    const pastMessages = session.messages || [];

    // 4. Call stateful python Serving Engine /chat endpoint
    let primaryUrl = "";
    let fallbackUrl = "";

    if (modelMode === "slm") {
      primaryUrl = process.env.NEXT_PUBLIC_SLM_API_URL || "http://localhost:8002";
      fallbackUrl = primaryUrl.includes("localhost") || primaryUrl.includes("127.0.0.1")
        ? "http://20.239.251.133:8002"
        : "http://localhost:8002";
    } else {
      primaryUrl = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8001";
      fallbackUrl = primaryUrl.includes("localhost") || primaryUrl.includes("127.0.0.1")
        ? "http://20.239.251.133:8001"
        : "http://localhost:8001";
    }

    const timeoutMs = modelMode === "slm" ? 90000 : 9000;

    const chatPayload = {
      message,
      session_id: session.uuid,
      history: pastMessages.map((msg) => ({
        sender: msg.sender === "user" ? "user" : "ai",
        text: msg.text,
      })),
      gemini_api_key: apiKey || null,
      mode: modelMode,
      language: language || "en",
    };

    let chatData: any = null;

    try {
      // Try primary API
      const chatResponse = await fetch(`${primaryUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatPayload),
        signal: AbortSignal.timeout(timeoutMs), // 90s for SLM CPU, 9s for CatBoost
      });

      if (chatResponse.ok) {
        chatData = await chatResponse.json();
      } else {
        throw new Error(`Primary /chat API returned status ${chatResponse.status}`);
      }
    } catch (err) {
      console.warn(`Failed to connect to primary /chat API at ${primaryUrl}:`, err);
      // Try fallback API
      try {
        console.log(`Attempting fallback to /chat API at ${fallbackUrl}...`);
        const chatResponse = await fetch(`${fallbackUrl}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chatPayload),
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (chatResponse.ok) {
          chatData = await chatResponse.json();
        } else {
          console.error("Fallback /chat predict endpoint error:", chatResponse.status);
        }
      } catch (fallbackErr) {
        console.error("Failed to connect to fallback /chat FastAPI server:", fallbackErr);
      }
    }

    if (chatData) {
      assistantResponse = chatData.response;
      if (chatData.verdict_given) {
        predictionResult = {
          top_condition: chatData.top_condition,
          top_confidence: chatData.top_confidence,
          predictions: chatData.predictions,
          precautions: chatData.precautions,
          aftermaths: chatData.aftermaths,
        };
      }
    } else {
      assistantResponse = language === "bn"
        ? "আমি আপনার উপসর্গগুলি বিশ্লেষণ করেছি, কিন্তু আমাদের ক্লিনিক্যাল ইঞ্জিন বর্তমানে অফলাইনে রয়েছে। অনুগ্রহ করে শীঘ্রই আবার চেষ্টা করুন বা আপনার স্বাস্থ্যসেবা প্রদানকারীর সাথে যোগাযোগ করুন।"
        : "I have analyzed your symptoms, but our clinical engine is currently offline. Please try again shortly or contact your care provider.";
    }

    // Save assistant response to database
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: "ai",
        text: assistantResponse,
      },
    });

    // Update session title if it's default
    if (session.title === "New Assessment" || !session.title) {
      const cleanTitle = message.trim().substring(0, 30) + (message.trim().length > 30 ? "..." : "");
      await prisma.chatSession.update({
        where: { id: session.id },
        data: { title: cleanTitle },
      });
    }

    // 7. Log assessment transaction in Database
    const latency = (Date.now() - startTime) / 1000; // in seconds
    const requestId = `req_${Math.random().toString(36).substring(2, 9)}`;

    if (predictionResult && user) {
      await prisma.assessmentLog.create({
        data: {
          userId: user.id,
          requestId,
          modelType: modelMode === "slm" ? "ThinkCare-SLM" : "CatBoost-Classifier",
          confidence: parseFloat(predictionResult.top_confidence) || 0.0,
          latency: latency,
          status: predictionResult.top_confidence > 80 ? "SUCCESS" : "WARNING",
          inputPrompt: message,
          predictedCondition: predictionResult.top_condition,
        },
      });
    }

    return NextResponse.json({
      response: assistantResponse,
      predictions: predictionResult ? predictionResult.predictions : [],
      topCondition: predictionResult ? predictionResult.top_condition : null,
      confidence: predictionResult ? predictionResult.top_confidence : null,
      precautions: predictionResult ? (predictionResult.precautions || []) : [],
      aftermaths: predictionResult ? (predictionResult.aftermaths || null) : null,
      requestId,
      sessionId: session.uuid,
    });
  } catch (error: any) {
    console.error("Chatbot API route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
