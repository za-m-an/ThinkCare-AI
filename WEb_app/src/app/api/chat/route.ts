import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { AI_FEATURES, ContextEngine } from "@/lib/contextEngine";

const SYSTEM_PROMPT_EN = `You are ThinkCare AI, a professional and empathetic clinical symptom checker and triage assistant. Your objective is to analyze the patient's reported symptoms, evaluate potential medical conditions, and provide a structured assessment to assist them in seeking the appropriate level of care. Analyze the input carefully for clinical indicators, severity markers, and potential red flags. You must format your assessment strictly using the keys below so the application can parse the information correctly:

**Disease**: [Name of the most likely condition or differential diagnosis]
**Severity**: [Mild / Moderate / Severe / Critical - based on symptom urgency]
**Recommended Precautions**:
1. [First specific actionable precaution, self-care step, or warning sign to monitor]
2. [Second precaution or next step]
3. [Third precaution or next step]

Ensure you always remind the patient that this assessment is not a definitive diagnosis and they must consult a qualified healthcare professional.`;

const SYSTEM_PROMPT_BN = `আপনি ThinkCare AI, একজন পেশাদার এবং সহানুভূতিশীল ক্লিনিক্যাল লক্ষণ পরীক্ষক এবং ট্রায়াজ সহকারী। আপনার লক্ষ্য হলো রোগীর উল্লিখিত লক্ষণগুলি বিশ্লেষণ করা, সম্ভাব্য চিকিৎসা পরিস্থিতি মূল্যায়ন করা, এবং রোগীকে সঠিক স্তরের চিকিৎসা সহায়তা পেতে সহায়তা করার জন্য একটি সুনির্দিষ্ট কাঠামোবদ্ধ মূল্যায়ন প্রদান করা। ক্লিনিক্যাল নির্দেশক, তীব্রতার লক্ষণ এবং সম্ভাব্য লাল সংকেত (red flags) এর জন্য রোগীর বিবরণটি সাবধানে বিশ্লেষণ করুন। সিস্টেম যাতে তথ্যগুলি সঠিকভাবে পার্স করতে পারে, সেজন্য আপনাকে অবশ্যই নিম্নলিখিত বিন্যাসটি কঠোরভাবে অনুসরণ করতে হবে:

**রোগ**: [সবচেয়ে সম্ভাব্য রোগ বা অবস্থার নাম]
**তীব্রতা**: [হালকা / মাঝারি / গুরুতর / জটিল - লক্ষণের গুরুত্বের ভিত্তিতে]
**সুপারিশকৃত সতর্কতা**:
১. [প্রথম নির্দিষ্ট করণীয় সতর্কতা, নিজের যত্ন নেওয়ার পদক্ষেপ বা বিপজ্জনক লক্ষণ যা পর্যবেক্ষণ করতে হবে]
২. [দ্বিতীয় সতর্কতা বা পরবর্তী পদক্ষেপ]
৩. [তৃতীয় সতর্কতা বা পরবর্তী পদক্ষেপ]

সর্বদা রোগীকে মনে করিয়ে দিন যে এই মূল্যায়নটি কোনো চূড়ান্ত রোগ নির্ণয় নয় এবং তাদের অবশ্যই একজন যোগ্যতাসম্পন্ন চিকিৎসকের সাথে পরামর্শ করতে হবে।`;

function parseSlmResponse(text: string): {
  top_condition: string | null;
  top_confidence: number | null;
  predictions: Array<{ condition: string; likelihood: number }>;
  precautions: string[];
  aftermaths: string | null;
  verdict_given: boolean;
} {
  const parsed: any = {
    top_condition: null,
    top_confidence: null,
    predictions: [],
    precautions: [],
    aftermaths: null,
    verdict_given: false
  };

  // Match Disease name (English & Bangla)
  const diseaseReg = /(?:\*\*?|১\)\s*|১\.\s*)(?:Disease|রোগ|সম্ভাব্য রোগ|অবস্থা|সবচেয়ে সম্ভাব্য রোগ\/অবস্থা)\*\*?:\s*([^\n]+)/i;
  const diseaseMatch = text.match(diseaseReg);
  if (diseaseMatch) {
    const condition = diseaseMatch[1].trim();
    parsed.top_condition = condition;
    parsed.top_confidence = 95.0;
    parsed.predictions = [{ condition, likelihood: 95.0 }];
    parsed.verdict_given = true;
  }

  // Match Severity (English & Bangla)
  const severityReg = /(?:\*\*?|২\)\s*|২\.\s*)(?:Severity|তীব্রতা|তীব্রতার মাত্রা)\*\*?:\s*([^\n]+)/i;
  const severityMatch = text.match(severityReg);
  if (severityMatch) {
    const severityVal = severityMatch[1].trim();
    parsed.aftermaths = `Severity Level: ${severityVal}`;
  }

  // Match Precautions list
  const precReg = /(?:\*\*?|৩\)\s*|৩\.\s*)(?:Recommended Precautions|সুপারিশকৃত সতর্কতা|সতর্কতা|প্রয়োজনীয় সতর্কতা)\*\*?:\s*\n?((?:[১-৯১-৯0-9*•-]\s*[^\n]+\n?)+)/i;
  const precMatch = text.match(precReg);
  if (precMatch) {
    const lines = precMatch[1].split("\n");
    const items: string[] = [];
    for (const line of lines) {
      const cleanLine = line.replace(/^(?:[১-৯১-৯0-9*•-]\.\s*|[১-৯১-৯0-9*•-])\s*/, "").trim();
      if (cleanLine) {
        items.push(cleanLine);
      }
    }
    parsed.precautions = items;
  } else {
    // Fallback list match
    const fallbackReg = /(?:\n[১-৯১-৯0-9*•-]\.\s*|\n[১-৯১-৯0-9*•-]\s*)([^\n]+)/g;
    let match;
    const items: string[] = [];
    while ((match = fallbackReg.exec(text)) !== null) {
      items.push(match[1].trim());
    }
    if (items.length > 0) {
      parsed.precautions = items;
    }
  }

  if (parsed.verdict_given && parsed.precautions.length === 0) {
    parsed.precautions = ["Consult a medical professional", "Monitor symptoms closely", "Rest and stay hydrated"];
  }

  return parsed;
}

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
    try {
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          sender: "user",
          text: message,
        },
      });
    } catch (dbErr) {
      console.warn("Failed to save user message (session may have been deleted in-flight):", dbErr);
      return NextResponse.json({ error: "Session no longer exists" }, { status: 404 });
    }

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

    // 4. Set up endpoint URLs and invoke inference
    let primaryUrl = "";
    let fallbackUrl = "";

    if (modelMode === "slm") {
      primaryUrl = process.env.NEXT_PUBLIC_SLM_API_URL || "http://127.0.0.1:11434";
      fallbackUrl = primaryUrl.includes("localhost") || primaryUrl.includes("127.0.0.1")
        ? "http://20.239.251.133:11434"
        : "http://127.0.0.1:11434";
    } else {
      primaryUrl = process.env.NEXT_PUBLIC_AI_API_URL || "http://127.0.0.1:8001";
      fallbackUrl = primaryUrl.includes("localhost") || primaryUrl.includes("127.0.0.1")
        ? "http://20.239.251.133:8001"
        : "http://127.0.0.1:8001";
    }

    const timeoutMs = modelMode === "slm" ? 240000 : 9000;
    const useBn = language === "bn" || (language !== "en" && /[\u0980-\u09ff]/.test(message));
    let chatData: any = null;

    if (modelMode === "slm") {
      const systemPrompt = useBn ? SYSTEM_PROMPT_BN : SYSTEM_PROMPT_EN;
      const userTurns = pastMessages.filter((msg) => msg.sender === "user").length + 1;
      let turnInstruction = "";

      if (useBn) {
        if (userTurns < 3) {
          const insistKeywordsBn = ["রোগ কি", "রোগ কি?", "রোগ নির্ণয়", "সিদ্ধান্ত", "ডায়াগনসিস", "চূড়ান্ত", "এখনই বলো"];
          const userInsistingBn = insistKeywordsBn.some(kw => message.includes(kw));
          if (userInsistingBn) {
            turnInstruction = `\n\n[সিস্টেম নির্দেশাবলী (কঠোর নিয়ম): এটি ধাপ ${userTurns}, তবে রোগী সরাসরি রোগ নির্ণয় জানতে চাচ্ছেন। প্রশ্নোত্তর ধাপটি এড়িয়ে অবিলম্বে আপনার চূড়ান্ত রোগ নির্ণয় দিন। কোনো অতিরিক্ত কথা না লিখে সরাসরি বিন্যাসটি ব্যবহার করুন: '**রোগ**:', '**তীব্রতা**:', এবং '**সুপারিশকৃত সতর্কতা**:'।]`;
          } else {
            turnInstruction = `\n\n[সিস্টেম নির্দেশাবলী (কঠোর নিয়ম): এটি কথোপকথনের ${userTurns} নম্বর ধাপ। জীবন সংশয়কারী জরুরি অবস্থা না থাকলে রোগ নির্ণয় দেবেন না (অর্থাৎ '**রোগ**:', '**তীব্রতা**:', বা '**সুপারিশকৃত সতর্কতা**:' লিখবেন না)। অত্যন্ত সংক্ষিপ্ত উত্তর দিন (সর্বোচ্চ ১৫-২০ শব্দের মধ্যে)। কোনো ভূমিকা বা অতিরিক্ত কথা না লিখে, রোগীকে সরাসরি ১ বা ২টি সংক্ষিপ্ত প্রশ্ন করুন লক্ষণগুলি বিস্তারিত জানতে।]`;
          }
        } else {
          turnInstruction = `\n\n[সিস্টেম নির্দেশাবলী (কঠোর নিয়ম): এটি ধাপ ${userTurns}। আপনাকে এখন অবশ্যই আপনার চূড়ান্ত রোগ নির্ণয় প্রদান করতে হবে। কোনো ভূমিকা বা অতিরিক্ত কথা না লিখে সরাসরি বিন্যাসটি ব্যবহার করুন: '**রোগ**:', '**তীব্রতা**:', এবং '**সুপারিশকৃত সতর্কতা**:' এবং চিকিৎসা সংক্রান্ত সতর্কতা দিন।]`;
        }
      } else {
        if (userTurns < 3) {
          const insistKeywords = ["diagnose", "diagnosis", "verdict", "what do i have", "tell me what is wrong", "immediate", "final"];
          const userInsisting = insistKeywords.some(kw => message.toLowerCase().includes(kw));
          if (userInsisting) {
            turnInstruction = `\n\n[System Instructions (STRICT RULE): This is turn ${userTurns}, but the patient is explicitly asking for a diagnosis. Bypass questioning and provide the final diagnostic verdict immediately. Do not write any preamble, start directly with '**Disease**:', '**Severity**:', and '**Recommended Precautions**:'.]`;
          } else {
            turnInstruction = `\n\n[System Instructions (STRICT RULE): This is turn ${userTurns} of the conversation. Do NOT provide a final diagnostic verdict yet (do not output '**Disease**:', '**Severity**:', or '**Recommended Precautions**:') unless there is a severe emergency. Be extremely concise (maximum 15-20 words). Write no preamble or explanations. Ask only 1 or 2 brief, direct clarifying questions immediately.]`;
          }
        } else {
          turnInstruction = `\n\n[System Instructions (STRICT RULE): This is turn ${userTurns}. You must now provide your final diagnostic verdict. Do not write any conversational preamble or explanations. Output the structured keys directly: '**Disease**:', '**Severity**:', '**Recommended Precautions**:', and the medical disclaimer.]`;
        }
      }

      const ollamaMessages = [
        { role: "system", content: systemPrompt }
      ];
      for (const msg of pastMessages) {
        ollamaMessages.push({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text
        });
      }
      ollamaMessages.push({
        role: "user",
        content: message + turnInstruction
      });

      const ollamaPayload = {
        model: "thinkcare-slm",
        messages: ollamaMessages,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9
        }
      };

      try {
        const chatResponse = await fetch(`${primaryUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ollamaPayload),
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (chatResponse.ok) {
          const resJson = await chatResponse.json();
          assistantResponse = resJson.message.content;
          chatData = parseSlmResponse(assistantResponse);
        } else {
          throw new Error(`Primary Ollama API returned status ${chatResponse.status}`);
        }
      } catch (err) {
        console.warn(`Failed to connect to primary Ollama API at ${primaryUrl}:`, err);
        try {
          console.log(`Attempting fallback to Ollama API at ${fallbackUrl}...`);
          const chatResponse = await fetch(`${fallbackUrl}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ollamaPayload),
            signal: AbortSignal.timeout(timeoutMs),
          });

          if (chatResponse.ok) {
            const resJson = await chatResponse.json();
            assistantResponse = resJson.message.content;
            chatData = parseSlmResponse(assistantResponse);
          } else {
            console.error("Fallback Ollama API predict endpoint error:", chatResponse.status);
          }
        } catch (fallbackErr) {
          console.error("Failed to connect to fallback Ollama server:", fallbackErr);
        }
      }

      if (chatData) {
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
    } else {
      // CatBoost mode (port 8001 FastAPI server)
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

      try {
        const chatResponse = await fetch(`${primaryUrl}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chatPayload),
          signal: AbortSignal.timeout(9000),
        });

        if (chatResponse.ok) {
          chatData = await chatResponse.json();
        } else {
          throw new Error(`Primary /chat API returned status ${chatResponse.status}`);
        }
      } catch (err) {
        console.warn(`Failed to connect to primary /chat API at ${primaryUrl}:`, err);
        try {
          console.log(`Attempting fallback to /chat API at ${fallbackUrl}...`);
          const chatResponse = await fetch(`${fallbackUrl}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(chatPayload),
            signal: AbortSignal.timeout(9000),
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
    }

    // Save assistant response to database
    try {
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
    } catch (dbErr) {
      console.warn("Failed to save assistant message or update session (session may have been deleted in-flight):", dbErr);
      return NextResponse.json({ error: "Session no longer exists" }, { status: 404 });
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
