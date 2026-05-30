import { NextResponse } from "next/server";

// Simple text-based PDF export (no pdfkit stream issues in Edge runtime)
export async function GET() {
  try {
    // Fetch the docs content
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let content: Record<string, unknown> = {};
    try {
      const r = await fetch(`${baseUrl}/api/docs/content`, { cache: "no-store" });
      const data = await r.json();
      content = data.content || {};
    } catch {
      // use empty content
    }

    const c = (key: string): Record<string, unknown> => (content[key] as Record<string, unknown>) || {};
    const team = c("team");
    const members = (team.members as { name: string; role: string; email: string; phone: string }[]) || [];

    // Build plain-text representation for PDF
    const lines: string[] = [
      "ThinkCare AI — Documentation & Pitch Deck",
      "==========================================",
      `Exported: ${new Date().toLocaleString()}`,
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "PITCH DECK",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "PROBLEM",
      "-------",
      (c("pitch_problem").headline as string) || "",
      (c("pitch_problem").body as string) || "",
      "",
      "SOLUTION",
      "--------",
      (c("pitch_solution").headline as string) || "",
      (c("pitch_solution").body as string) || "",
      "",
      "WHY NOW",
      "-------",
      (c("pitch_why_now").headline as string) || "",
      ...((c("pitch_why_now").points as string[]) || []).map((p, i) => `${i + 1}. ${p}`),
      "",
      "MARKET OPPORTUNITY",
      "------------------",
      `TAM: ${c("pitch_market").tam || ""}`,
      `SAM: ${c("pitch_market").sam || ""}`,
      `SOM: ${c("pitch_market").som || ""}`,
      `Growth: ${c("pitch_market").growth || ""}`,
      "",
      "BUSINESS MODEL",
      "--------------",
      (c("pitch_business_model").headline as string) || "",
      ...((c("pitch_business_model").tiers as { name: string; desc: string }[]) || []).map((t) => `• ${t.name}: ${t.desc}`),
      "",
      "TRACTION",
      "--------",
      (c("pitch_traction").headline as string) || "",
      ...((c("pitch_traction").metrics as { label: string; value: string }[]) || []).map((m) => `• ${m.label}: ${m.value}`),
      "",
      "TEAM",
      "----",
      (team.name as string) || "Team ThinkCare",
      ...members.map((m) => `• ${m.name} — ${m.role} | ${m.email} | ${m.phone}`),
      "",
      "VISION",
      "------",
      (c("pitch_vision").headline as string) || "",
      (c("pitch_vision").body as string) || "",
      (c("pitch_vision").mission as string) || "",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "TECHNICAL DOCUMENTATION",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "PRODUCT OVERVIEW",
      "----------------",
      (c("tech_overview").tagline as string) || "",
      (c("tech_overview").description as string) || "",
      "",
      "TECHNOLOGY STACK",
      "----------------",
      `Frontend: ${((c("tech_stack").frontend as string[]) || []).join(", ")}`,
      `Backend:  ${((c("tech_stack").backend as string[]) || []).join(", ")}`,
      `AI (SLM): ${((c("tech_stack").ai_slm as string[]) || []).join(", ")}`,
      `AI (ML):  ${((c("tech_stack").ai_classifier as string[]) || []).join(", ")}`,
      `Infra:    ${((c("tech_stack").infra as string[]) || []).join(", ")}`,
      "",
      "AI LAYER",
      "--------",
      "SLM: ThinkCare SLM (Qwen2.5 fine-tuned)",
      `  Base: ${(c("tech_ai").slm as Record<string, string>)?.base || ""}`,
      `  Role: ${(c("tech_ai").slm as Record<string, string>)?.role || ""}`,
      "Classifier: CatBoost Disease Classifier",
      `  Features: ${(c("tech_ai").classifier as Record<string, string>)?.features || ""}`,
      `  Accuracy: ${(c("tech_ai").classifier as Record<string, string>)?.accuracy || ""}`,
      "",
      "SECURITY",
      "--------",
      `Auth: ${c("tech_security").auth || ""}`,
      `RBAC: ${c("tech_security").rbac || ""}`,
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "Confidential — ThinkCare AI Team — 2026",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    ];

    const textContent = lines.join("\n");

    return new NextResponse(textContent, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="ThinkCareAI_Docs_${new Date().toISOString().split("T")[0]}.txt"`,
      },
    });
  } catch (error) {
    console.error("[/api/docs/export]", error);
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}
