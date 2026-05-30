import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "en";

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
      return NextResponse.json({
        insight: lang === "bn"
          ? "ব্যক্তিগতকৃত স্বাস্থ্য পরামর্শ আনলক করতে অনুগ্রহ করে আপনার ক্লিনিক্যাল অনবোর্ডিং সম্পন্ন করুন।"
          : "Please complete your clinical onboarding to unlock personalized health coaching insights.",
      });
    }

    const ob = user.onboarding;

    // Try generating dynamic insight using Gemini
    try {
      const apiKeyConfig = await prisma.systemConfig.findUnique({
        where: { key: "gemini_api_key" },
      });

      const apiKey = apiKeyConfig?.value;
      if (apiKey && apiKey.trim().length > 0) {
        const dobDate = ob.dob ? new Date(ob.dob) : new Date();
        const age = new Date().getFullYear() - dobDate.getFullYear();

        const langPrompt = lang === "bn" 
          ? "Generate the response in Bangla (বাংলা)." 
          : "Generate the response in English.";

        const prompt = `You are a clinical AI health coach. Based on the following patient health profile:
- Age: ${age}
- Sex: ${ob.sexAtBirth}
- Conditions: ${ob.conditions?.join(", ") || "None reported"}
- Vitals: Resting Heart Rate ${ob.heartRate} bpm, Blood Pressure ${ob.bloodPressureSystolic}/${ob.bloodPressureDiastolic} mmHg, SpO2 ${ob.spO2}%
- Lifestyle: Daily step goal ${ob.dailySteps}, Sleep duration ${ob.avgSleepHours} hours, Stress level ${ob.stressLevel}/10

Generate a highly specific, personalized, and actionable wellness tip or health insight (exactly 1-2 sentences). Do not use placeholders or markdown formatting (no bolding, no lists). Keep the tone encouraging, medical, and authoritative. Focus directly on the patient's lifestyle and vitals values. ${langPrompt}`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}`;
        
        const res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim().length > 0) {
            return NextResponse.json({ insight: text.trim() });
          }
        }
      }
    } catch (geminiErr) {
      console.error("Gemini failed, using fallback dashboard rules", geminiErr);
    }

    // Fallback: rule-based insights if Gemini is unavailable
    const conditions = ob.conditions || [];
    const steps = ob.dailySteps || 5000;
    const sleep = ob.avgSleepHours || 7;
    const stress = ob.stressLevel || 5;

    let insights = [];
    if (conditions.includes("Type 2 Diabetes")) {
      insights.push(lang === "bn" 
        ? "টাইপ ২ ডায়াবেটিসের জন্য জটিল কার্বোহাইড্রেটকে অগ্রাধিকার দিন এবং রক্তে শর্করার মাত্রা নিয়ন্ত্রণে রাখতে সাহায্য করুন।"
        : "Prioritize complex carbohydrates and map post-meal blood sugar response for optimal glucose levels.");
    }
    if (conditions.includes("Hypertension") || conditions.includes("Mild Hypertension")) {
      insights.push(lang === "bn"
        ? "দৈনিক সোডিয়ামের পরিমাণ ১,৫০০ মিলিগ্রামে সীমিত রাখুন। পর্যাপ্ত পানি পান করা রক্তচাপ নিয়ন্ত্রণে রাখতে গুরুত্বপূর্ণ ভূমিকা পালন করে।"
        : "Limit sodium to 1,500mg daily. Your vitals are within margin, but consistency with hydration regulates pressure.");
    }
    if (steps < 7000) {
      insights.push(lang === "bn"
        ? `আপনার দৈনন্দিন কার্যকলাপ বাড়ানোর চেষ্টা করুন। প্রতিদিন পদক্ষেপের সংখ্যা বাড়িয়ে ${steps + 2000} টি-তে নিয়ে গেলে হৃদরোগের ঝুঁকি হ্রাস পায়।`
        : `Aim to increase your daily activity. Elevating your steps toward ${steps + 2000} can reduce cardiovascular risk.`);
    } else {
      insights.push(lang === "bn"
        ? `চমৎকার শারীরিক কার্যকলাপ মেট্রিক্স। আপনার বিপাকীয় দক্ষতা বজায় রাখতে প্রতিদিন গড়ে ${steps} পদক্ষেপের হার বজায় রাখুন।`
        : `Excellent physical activity metrics. Maintain your daily average of ${steps} steps to sustain metabolic efficiency.`);
    }
    if (sleep < 7) {
      insights.push(lang === "bn"
        ? "ঘুমের সময় অতিরিক্ত ৪৫ মিনিট বৃদ্ধি করা স্নায়বিক পুনরুদ্ধার উন্নত করতে এবং সকালে রক্তচাপ স্থিতিশীল রাখতে সাহায্য করে।"
        : "Targeting an extra 45 minutes of sleep can improve neural recovery and stabilize morning blood pressure.");
    }
    if (stress > 6) {
      insights.push(lang === "bn"
        ? "বিকেলে ৫ মিনিট ফোকাসড বক্স-ব্রিথিং বা গভীর শ্বাস-প্রশ্বাসের ব্যায়ামের মাধ্যমে আপনার কর্টিসল হরমোন বা মানসিক চাপ নিয়ন্ত্রণে রাখুন।"
        : "Modulate elevated daily cortisol levels by scheduling 5 minutes of focused box-breathing in the afternoon.");
    }

    const finalInsight = insights.length > 0 ? insights[Math.floor(Math.random() * insights.length)] : (
      lang === "bn"
        ? "আপনার সমস্ত প্রাণশক্তি চিহ্ন স্থিতিশীল রয়েছে। আপনার দৈনন্দিন কার্যকলাপ এবং ঘুমের চক্র ট্র্যাক করা অব্যাহত রাখুন।"
        : "All vital parameters are stable. Continue tracking daily activity and sleep cycles."
    );

    return NextResponse.json({ insight: finalInsight });

  } catch (error: any) {
    console.error("Insight API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
