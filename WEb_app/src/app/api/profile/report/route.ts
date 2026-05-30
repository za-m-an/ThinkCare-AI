import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import PDFDocument from "pdfkit";
import path from "path";

// Helper to generate AI clinical summary from chat history via Gemini
async function generateClinicalSummary(
  chatLog: string,
  patientName: string
): Promise<string> {
  try {
    const apiKeyConfig = await prisma.systemConfig.findUnique({
      where: { key: "gemini_api_key" },
    });

    const apiKey = apiKeyConfig?.value;
    if (!apiKey || apiKey.trim().length === 0) {
      return "";
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const prompt = `You are a clinical documentation specialist summarizing an AI-assisted patient interaction for a physician.

Patient Name: ${patientName}

The following is the full conversation log between the patient and the ThinkCare AI Medical Assistant:

${chatLog}

Write a concise 3-5 sentence clinical context summary for the attending physician. Include:
- Chief complaints and reported symptoms
- Any notable risk factors or lifestyle concerns mentioned
- The AI engine's top predicted condition(s) if discussed

Write in a professional, third-person medical note style. Do not include any markdown formatting, headers, or bullet points. Return only the plain text paragraph.`;

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return text.trim();
    }
  } catch (err) {
    console.error("Gemini clinical summary generation error:", err);
  }
  return "";
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "USER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { onboarding: true },
    });

    if (!user || !user.onboarding) {
      return NextResponse.json(
        { error: "Clinical onboarding data not found" },
        { status: 404 }
      );
    }

    const ob = user.onboarding;

    // Fetch chat sessions with messages for AI summary
    const chatSessions = await prisma.chatSession.findMany({
      where: { userId: user.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 10, // last 10 sessions
    });

    // Build conversation log text
    let chatLog = "";
    for (const session of chatSessions) {
      if (session.messages.length === 0) continue;
      chatLog += `--- Session: ${session.title} (${session.createdAt.toLocaleDateString("en-US")}) ---\n`;
      for (const msg of session.messages) {
        chatLog += `${msg.sender === "user" ? "Patient" : "AI Assistant"}: ${msg.text}\n`;
      }
      chatLog += "\n";
    }

    // Generate AI clinical summary if chat data exists
    let clinicalSummary = "";
    if (chatLog.trim().length > 0) {
      clinicalSummary = await generateClinicalSummary(chatLog, user.fullName);
    }

    // Compile PDF buffer using pdfkit
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      // Register custom fonts to bypass Helvetica.afm dependency issues on Next.js
      const fontRegularPath = path.join(process.cwd(), "src/assets/fonts/GoogleSans-Regular.ttf");
      const fontBoldPath = path.join(process.cwd(), "src/assets/fonts/GoogleSans-Bold.ttf");
      const fontItalicPath = path.join(process.cwd(), "src/assets/fonts/GoogleSans-Italic.ttf");

      doc.registerFont("Google Sans", fontRegularPath);
      doc.registerFont("Google Sans-Bold", fontBoldPath);
      doc.registerFont("Google Sans-Italic", fontItalicPath);

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // --- BRAND HEADER ---
      doc.fillColor("#1e293b").rect(0, 0, 595.28, 12).fill(); // Navy top accent border

      doc.moveDown(1.5);
      doc.fillColor("#0f172a").fontSize(26).font("Google Sans-Bold").text("ThinkCare AI", { align: "left" });
      doc.fontSize(10).font("Google Sans-Italic").fillColor("#64748b").text("Expert Medical Companion Assessment Report", { align: "left" });
      
      doc.moveDown(0.5);
      doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(50, doc.y).lineTo(545.28, doc.y).stroke();
      doc.moveDown(1.5);

      // --- PATIENT METADATA SECTION ---
      doc.fillColor("#0f172a").fontSize(14).font("Google Sans-Bold").text("Patient Information");
      doc.moveDown(0.5);

      const dobString = ob.dob.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const age = new Date().getFullYear() - ob.dob.getFullYear();

      // Table layout for metadata
      const leftColX = 50;
      const rightColX = 300;
      let currentY = doc.y;

      doc.fontSize(10).font("Google Sans-Bold").fillColor("#475569").text("Full Name:", leftColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(user.fullName, leftColX + 80, currentY);

      doc.font("Google Sans-Bold").fillColor("#475569").text("Patient ID:", rightColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(user.patientId || "--", rightColX + 80, currentY);

      currentY += 20;
      doc.font("Google Sans-Bold").fillColor("#475569").text("Date of Birth:", leftColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(`${dobString} (${age} Yrs)`, leftColX + 80, currentY);

      doc.font("Google Sans-Bold").fillColor("#475569").text("Sex at Birth:", rightColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(ob.sexAtBirth, rightColX + 80, currentY);

      currentY += 20;
      doc.font("Google Sans-Bold").fillColor("#475569").text("Height:", leftColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(`${ob.height} cm`, leftColX + 80, currentY);

      doc.font("Google Sans-Bold").fillColor("#475569").text("Weight:", rightColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(`${ob.weight} kg`, rightColX + 80, currentY);

      currentY += 20;
      doc.font("Google Sans-Bold").fillColor("#475569").text("Blood Type:", leftColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(ob.bloodType || "Not Specified", leftColX + 80, currentY);

      doc.font("Google Sans-Bold").fillColor("#475569").text("Created Date:", rightColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(new Date().toLocaleDateString("en-US"), rightColX + 80, currentY);

      doc.moveDown(2);
      doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(50, doc.y).lineTo(545.28, doc.y).stroke();
      doc.moveDown(1.5);

      // --- SECTION 1: CLINICAL VITALS ---
      doc.fillColor("#0f172a").fontSize(14).font("Google Sans-Bold").text("Recorded Clinical Vitals", 50);
      doc.moveDown(0.5);

      currentY = doc.y;
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#475569").text("Resting Heart Rate:", leftColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(`${ob.heartRate || "72"} bpm`, leftColX + 130, currentY);

      doc.font("Google Sans-Bold").fillColor("#475569").text("Blood Oxygen (SpO2):", rightColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(`${ob.spO2 || "99"} %`, rightColX + 130, currentY);

      currentY += 20;
      doc.font("Google Sans-Bold").fillColor("#475569").text("Blood Pressure:", leftColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(
        ob.bloodPressureSystolic && ob.bloodPressureDiastolic
          ? `${ob.bloodPressureSystolic}/${ob.bloodPressureDiastolic} mmHg`
          : "118/75 mmHg",
        leftColX + 130,
        currentY
      );

      doc.moveDown(2);
      doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(50, doc.y).lineTo(545.28, doc.y).stroke();
      doc.moveDown(1.5);

      // --- SECTION 2: LIFESTYLE SUMMARY ---
      doc.fillColor("#0f172a").fontSize(14).font("Google Sans-Bold").text("Habits & Lifestyle Profile", 50);
      doc.moveDown(0.5);

      currentY = doc.y;
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#475569").text("Average Sleep:", leftColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(`${ob.avgSleepHours} Hours / Night`, leftColX + 130, currentY);

      doc.font("Google Sans-Bold").fillColor("#475569").text("Daily Step Count:", rightColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(`${ob.dailySteps.toLocaleString()} Steps`, rightColX + 130, currentY);

      currentY += 20;
      doc.font("Google Sans-Bold").fillColor("#475569").text("Fast Food Meals:", leftColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(`${ob.fastFoodMealsPerWeek} Meals / Week`, leftColX + 130, currentY);

      doc.font("Google Sans-Bold").fillColor("#475569").text("Water Intake:", rightColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(`${ob.waterCupsPerDay} Cups / Day`, rightColX + 130, currentY);

      currentY += 20;
      doc.font("Google Sans-Bold").fillColor("#475569").text("Stress Index:", leftColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(`${ob.stressLevel} / 10`, leftColX + 130, currentY);

      doc.font("Google Sans-Bold").fillColor("#475569").text("Smoking / Alcohol:", rightColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(`${ob.smokingPacksPerWeek} packs / ${ob.alcoholDrinksPerWeek} drinks`, rightColX + 130, currentY);

      doc.moveDown(2.5);
      doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(50, doc.y).lineTo(545.28, doc.y).stroke();
      doc.moveDown(1.5);

      // --- SECTION 3: CONDITIONS & ALLERGIES ---
      doc.fillColor("#0f172a").fontSize(14).font("Google Sans-Bold").text("Documented Conditions, Medications & Allergies", 50);
      doc.moveDown(0.5);

      currentY = doc.y;
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#475569").text("Active Conditions:", leftColX, currentY);
      const conditionsText = ob.conditions.length > 0 ? ob.conditions.join(", ") : "None";
      doc.font("Google Sans").fillColor("#0f172a").text(conditionsText, leftColX + 110, currentY, { width: 380 });

      doc.moveDown(0.5);
      currentY = doc.y;
      doc.font("Google Sans-Bold").fillColor("#475569").text("Medications List:", leftColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(ob.medications || "None", leftColX + 110, currentY, { width: 380 });

      doc.moveDown(0.5);
      currentY = doc.y;
      doc.font("Google Sans-Bold").fillColor("#475569").text("Allergy Panel:", leftColX, currentY);
      doc.font("Google Sans").fillColor("#0f172a").text(ob.allergies || "None", leftColX + 110, currentY, { width: 380 });

      // --- SECTION 4: AI CONVERSATION & SYMPTOM SUMMARY ---
      if (clinicalSummary) {
        doc.moveDown(1.5);
        doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(50, doc.y).lineTo(545.28, doc.y).stroke();
        doc.moveDown(1.5);

        doc.fillColor("#0f172a").fontSize(14).font("Google Sans-Bold").text("AI Conversation & Symptom Summary (Clinical Context)", 50);
        doc.moveDown(0.5);

        doc.fontSize(9).font("Google Sans-Italic").fillColor("#475569").text(
          `Generated from ${chatSessions.filter(s => s.messages.length > 0).length} assessment session(s) via ThinkCare AI Clinical Engine.`,
          50
        );
        doc.moveDown(0.5);

        doc.fontSize(10).font("Google Sans").fillColor("#0f172a").text(
          clinicalSummary,
          50,
          doc.y,
          { width: 495.28, lineGap: 3 }
        );
      }

      // --- FOOTER NOTE ---
      const footerY = 740;
      doc.strokeColor("#cbd5e1").lineWidth(0.5).moveTo(50, footerY - 10).lineTo(545.28, footerY - 10).stroke();
      doc.fontSize(7).font("Google Sans").fillColor("#94a3b8").text(
        "ThinkCare AI provides health assessments based on model outputs and user-provided inputs. This document does not constitute professional medical advice, prescription, or clinical diagnosis. Confidential document for medical sharing.",
        50,
        footerY,
        { align: "center", width: 495.28 }
      );

      doc.end();
    });

    // Send PDF response
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=ThinkCare_Health_Report_${user.fullName.replace(/\s+/g, "_")}.pdf`,
      },
    });
  } catch (error: any) {
    console.error("PDF generation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
