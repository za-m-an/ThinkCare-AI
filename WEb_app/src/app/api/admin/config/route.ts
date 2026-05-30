import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const configs = await prisma.systemConfig.findMany();
    const configMap: Record<string, string> = {};
    configs.forEach((config) => {
      configMap[config.key] = config.value;
    });

    return NextResponse.json({ configs: configMap });
  } catch (error: any) {
    console.error("Admin config fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      gemini_api_key,
      model_auto_scaling,
      model_standard_fallback,
      diagnosis_actionable_threshold,
      human_review_flag_threshold,
      active_model_mode,
    } = await request.json();

    const updates = [
      { key: "gemini_api_key", value: gemini_api_key !== undefined ? gemini_api_key : "" },
      { key: "model_auto_scaling", value: model_auto_scaling !== undefined ? String(model_auto_scaling) : "true" },
      { key: "model_standard_fallback", value: model_standard_fallback !== undefined ? String(model_standard_fallback) : "false" },
      { key: "diagnosis_actionable_threshold", value: diagnosis_actionable_threshold !== undefined ? String(diagnosis_actionable_threshold) : "85" },
      { key: "human_review_flag_threshold", value: human_review_flag_threshold !== undefined ? String(human_review_flag_threshold) : "60" },
      { key: "active_model_mode", value: active_model_mode !== undefined ? String(active_model_mode) : "catboost" },
    ];

    // Update in transaction
    await prisma.$transaction(
      updates.map((update) =>
        prisma.systemConfig.upsert({
          where: { key: update.key },
          update: { value: update.value },
          create: update,
        })
      )
    );

    return NextResponse.json({ message: "Configurations saved successfully" });
  } catch (error: any) {
    console.error("Admin config update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
