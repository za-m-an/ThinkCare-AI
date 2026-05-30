import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import PDFDocument from "pdfkit";
import path from "path";

// Default content to merge with DB records
const DEFAULT_CONTENT: Record<string, unknown> = {
  pitch_problem: {
    headline: "Healthcare in Bangladesh is Reactive, Not Predictive",
    body: "Millions of patients wait until symptoms are severe before seeking care. Primary healthcare is overwhelmed, diagnostic tools are inaccessible to rural populations, and language barriers prevent effective AI adoption. The result: preventable diseases go undetected, and clinical resources are wasted on late-stage interventions.",
    stats: [
      { label: "People without primary care access", value: "60M+" },
      { label: "Avoidable hospital admissions annually", value: "2.4M" },
      { label: "Rural health workers with diagnostic AI tools", value: "<1%" },
    ],
  },
  pitch_solution: {
    headline: "ThinkCare AI — Proactive Health Intelligence for Everyone",
    body: "ThinkCare AI is a bilingual (English + Bangla) clinical AI companion that lets patients describe symptoms in natural language and receive real-time risk assessments, precautionary guidance, and triage recommendations — before they need to visit a hospital. Our proprietary SLM (Small Language Model) and CatBoost classifier work together to deliver accurate, explainable predictions at low computational cost.",
    pillars: [
      "Natural language symptom parsing (EN + BN)",
      "Real-time disease risk prediction (CatBoost)",
      "Personalized health insight generation (SLM)",
      "Accessible via mobile and desktop",
    ],
  },
  pitch_why_now: {
    headline: "The Convergence is Happening Now",
    points: [
      "Affordable smartphones have reached 85% of Bangladesh's population",
      "Fine-tuned Small Language Models (SLMs) now run efficiently on CPU servers",
      "Government digital health initiatives are creating demand for AI-first tools",
      "Post-pandemic awareness has dramatically increased health-tech adoption",
    ],
  },
  pitch_market: {
    tam: "Global digital health market: $659B by 2025",
    sam: "South & Southeast Asia health-tech: $45B",
    som: "Bangladesh preventive health AI: $800M",
    growth: "32% CAGR in health AI adoption across emerging markets",
  },
  pitch_business_model: {
    headline: "Multi-Tier Revenue Model",
    tiers: [
      { name: "Free Tier", desc: "Basic symptom assessment, 10 queries/month" },
      { name: "Pro (৳299/mo)", desc: "Unlimited assessments, health reports, history" },
      { name: "Clinic License (৳4,999/mo)", desc: "Multi-user, admin dashboard, API access" },
      { name: "Enterprise / Govt", desc: "Custom integration, white-label, SLA" },
    ],
  },
  pitch_traction: {
    headline: "Early Validation",
    metrics: [
      { label: "Prototype built", value: "✓" },
      { label: "Diseases classified", value: "42" },
      { label: "Model accuracy (CatBoost)", value: "~91%" },
      { label: "Bilingual support", value: "EN + BN" },
      { label: "Hackathon submission", value: "✓" },
    ],
  },
  pitch_competition: {
    headline: "Competitive Landscape",
    competitors: [
      { name: "Ada Health", region: "Global", gap: "No Bangla, no local disease profiles" },
      { name: "Babylon Health", region: "UK/Africa", gap: "Expensive, not adapted to BD" },
      { name: "Practo", region: "India", gap: "Doctor booking, not AI triage" },
      { name: "Generic ChatGPT", region: "Global", gap: "No clinical training, no predictions" },
    ],
    advantage: "ThinkCare AI is the only bilingual, locally-trained clinical AI triage system purpose-built for Bangladesh and emerging markets.",
  },
  pitch_gtm: {
    phases: [
      { phase: "Phase 1 (0-6mo)", title: "Hackathon & University Pilot", desc: "Launch at BUET, BRAC, and medical colleges. Gather feedback, refine model." },
      { phase: "Phase 2 (6-18mo)", title: "B2C Launch", desc: "Mobile app launch, freemium model, social media growth." },
      { phase: "Phase 3 (18-36mo)", title: "B2B & Government", desc: "Clinic licensing, DGHS partnerships, rural health worker integration." },
    ],
  },
  pitch_vision: {
    headline: "A Healthier Bangladesh, Powered by AI",
    body: "We envision a future where every person in Bangladesh — urban or rural, educated or not — has access to an intelligent, trustworthy health companion in their own language. ThinkCare AI is the first step toward a preventive health infrastructure that saves lives before disease strikes.",
    mission: "Democratize clinical intelligence. Make preventive healthcare accessible to 170 million people.",
  },
  tech_overview: {
    tagline: "AI-Powered Clinical Triage & Lifestyle Intelligence Platform",
    description: "ThinkCare AI combines a fine-tuned Small Language Model (SLM) with a proprietary CatBoost disease classifier to deliver real-time health risk assessments. The platform is fully bilingual, mobile-optimized, and designed for clinical accuracy in resource-constrained environments.",
    targetUsers: ["General population (self-triage)", "Rural health workers", "Clinics and hospitals", "Medical researchers", "Healthcare administrators"],
    coreUseCases: [
      "Symptom-based disease risk prediction",
      "Personalized daily health insights",
      "Medical history tracking",
      "Clinical report generation",
      "Multilingual health Q&A",
    ],
  },
  tech_features: {
    current: [
      { name: "Bilingual Chat (EN + BN)", status: "live" },
      { name: "CatBoost Disease Classifier (42 diseases)", status: "live" },
      { name: "SLM Health Insights (Qwen2.5 fine-tune)", status: "live" },
      { name: "Patient Onboarding & Health Profile", status: "live" },
      { name: "PDF Health Report Export", status: "live" },
      { name: "Admin Dashboard & Monitoring", status: "live" },
      { name: "Real-time Assessment Logging", status: "live" },
      { name: "JWT Auth + Role-Based Access Control", status: "live" },
    ],
    upcoming: [
      { name: "Mobile App (React Native)", status: "planned" },
      { name: "Voice Input (Bangla STT)", status: "planned" },
      { name: "Telemedicine Integration", status: "planned" },
      { name: "Wearable Device Sync", status: "planned" },
    ],
  },
  tech_stack: {
    frontend: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Lucide Icons"],
    backend: ["Next.js API Routes", "Prisma ORM", "PostgreSQL (Neon)", "JWT Auth", "bcryptjs"],
    ai_slm: ["FastAPI (Python)", "Qwen2.5 (fine-tuned)", "HuggingFace Transformers", "PyTorch (CPU)"],
    ai_classifier: ["FastAPI (Python)", "CatBoost", "Scikit-learn", "Custom feature engineering"],
    infra: ["Vercel (Frontend)", "Linux Server (AI engines)", "Neon PostgreSQL", "Git (multi-repo)"],
  },
  tech_api: {
    exposed: [
      { method: "POST", path: "/api/chat", auth: "JWT (User)", desc: "Send message → get AI response + disease prediction" },
      { method: "POST", path: "/api/auth/login", auth: "None", desc: "Authenticate user, receive JWT cookie" },
      { method: "POST", path: "/api/auth/register", auth: "None", desc: "Register new user" },
      { method: "GET", path: "/api/dashboard/insight", auth: "JWT (User)", desc: "Get AI-generated daily health insight" },
      { method: "GET/POST", path: "/api/profile", auth: "JWT (User)", desc: "Read/update health profile" },
      { method: "GET", path: "/api/docs/access", auth: "None", desc: "Check if /docs is publicly accessible" },
    ],
    internal: [
      { method: "POST", path: "http://localhost:11434/api/chat", auth: "Internal", desc: "Ollama SLM chat API" },
      { method: "POST", path: "http://localhost:8001/predict", auth: "Internal", desc: "CatBoost disease classifier" },
    ],
  },
  tech_ai: {
    slm: {
      name: "ThinkCare SLM",
      base: "Qwen2.5 (fine-tuned on clinical Q&A, EN+BN)",
      role: "Natural language understanding, health insight generation, Bangla response synthesis",
      deployment: "Ollama API on VPS server, port 11434",
      latency: "~8-15s (CPU inference)",
    },
    classifier: {
      name: "ThinkCare Classifier",
      model: "CatBoost gradient boosting",
      features: "42-disease classification from 17 symptom features",
      accuracy: "~91% validation accuracy",
      deployment: "FastAPI on CPU server, port 8001",
      latency: "<500ms",
    },
    pipeline: "User input → language detection → SLM parses symptoms → CatBoost classifies disease → SLM generates response with predictions → Frontend renders structured output",
  },
  tech_security: {
    auth: "JWT tokens (HS256) stored in HttpOnly cookies, 24h expiry",
    rbac: "Two roles: USER (patient access) and ADMIN (system management). Route-level enforcement via Next.js middleware.",
    data: "Passwords hashed with bcryptjs (salt rounds: 12). No raw PII in logs.",
    compliance: "HIPAA-aligned data handling. No third-party analytics on health data.",
  },
  team: {
    name: "Team ThinkCare",
    members: [
      {
        name: "Kamruzzaman Chowdhury",
        role: "Team Lead & Full-Stack Engineer",
        email: "kamruzzaman@thinkings.tech",
        phone: "+880 01329602758",
        avatar: "/team_kamruzzaman.png",
        badge: "Team Lead",
      },
      {
        name: "Noor Mohammed Taief",
        role: "AI/ML Engineer",
        email: "taief@thinkings.tech",
        phone: "+880 01608849699",
        avatar: "/team_taief.png",
        badge: "Member",
      },
      {
        name: "Irtisum Abtahi Rahman",
        role: "Backend & Systems Engineer",
        email: "irtisum@thinkings.tech",
        phone: "+880 01819119930",
        avatar: "/team_irtisum.png",
        badge: "Member",
      },
    ],
  },
  changelog: {
    versions: [
      { version: "v1.0.0", date: "2026-05-30", notes: "Initial release — bilingual chat, CatBoost classifier, SLM integration, admin dashboard, user auth, onboarding." },
    ],
  },
};

export async function GET() {
  try {
    // 1. Fetch current Docs Content from DB
    const rows = await prisma.docsContent.findMany();
    const contentMap: Record<string, any> = {};

    for (const row of rows) {
      try {
        contentMap[row.section] = JSON.parse(row.content);
      } catch {
        contentMap[row.section] = row.content;
      }
    }

    // Merge missing content with defaults
    for (const [key, value] of Object.entries(DEFAULT_CONTENT)) {
      if (!(key in contentMap)) {
        contentMap[key] = value;
      }
    }

    const c = (key: string): Record<string, any> => contentMap[key] || {};
    const team = c("team");
    const members = (team.members as any[]) || [];

    // 2. Generate PDF using pdfkit
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      // Register fonts
      const fontRegularPath = path.join(process.cwd(), "public/fonts/GoogleSans-Regular.ttf");
      const fontBoldPath = path.join(process.cwd(), "public/fonts/GoogleSans-Bold.ttf");
      const fontItalicPath = path.join(process.cwd(), "public/fonts/GoogleSans-Italic.ttf");

      doc.registerFont("Google Sans", fontRegularPath);
      doc.registerFont("Google Sans-Bold", fontBoldPath);
      doc.registerFont("Google Sans-Italic", fontItalicPath);

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Header Helper
      const drawHeader = (title: string) => {
        doc.fillColor("#0f172a").rect(0, 0, 595.28, 12).fill(); // Navy top accent border
        doc.moveDown(1);
        doc.fillColor("#0f172a").fontSize(24).font("Google Sans-Bold").text("ThinkCare AI", { align: "left" });
        doc.fontSize(9).font("Google Sans-Italic").fillColor("#64748b").text("Bilingual Clinical AI Companion · Documentation & Pitch Deck", { align: "left" });
        doc.moveDown(0.5);
        doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, doc.y).lineTo(545.28, doc.y).stroke();
        doc.moveDown(1.5);
        doc.fontSize(16).font("Google Sans-Bold").fillColor("#3b82f6").text(title);
        doc.moveDown(0.8);
      };

      // Page Number Footer
      doc.on("pageAdded", () => {
        // Just empty callback - footer will be calculated on doc end or drawn at the end
      });

      // ==========================================
      // PAGE 1: COVER PAGE
      // ==========================================
      doc.fillColor("#0f172a").rect(0, 0, 595.28, 841.89).fill(); // Dark background for cover page
      
      doc.moveDown(8);
      doc.fillColor("#ffffff").fontSize(36).font("Google Sans-Bold").text("ThinkCare AI", { align: "center" });
      doc.moveDown(0.5);
      doc.fillColor("#3b82f6").fontSize(16).font("Google Sans-Bold").text("Bilingual Clinical AI Companion for Bangladesh", { align: "center" });
      doc.moveDown(1.5);
      
      doc.fillColor("#94a3b8").fontSize(11).font("Google Sans").text(
        "A state-of-the-art triage platform combining fine-tuned Small Language Models (SLMs) and CatBoost classifiers to deliver proactive healthcare diagnostics.",
        { align: "center", width: 400 }
      );

      doc.moveDown(10);
      doc.fillColor("#ffffff").fontSize(10).font("Google Sans-Bold").text("PRODUCT PITCH DECK & TECHNICAL SPECIFICATIONS", { align: "center" });
      doc.fillColor("#64748b").fontSize(9).font("Google Sans").text(`Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`, { align: "center" });
      
      // ==========================================
      // PAGE 2: PITCH DECK (BUSINESS VIEW)
      // ==========================================
      doc.addPage({ size: "A4", margin: 50 });
      drawHeader("Part 1: Executive Pitch Deck");

      // Problem
      doc.fillColor("#0f172a").fontSize(12).font("Google Sans-Bold").text("1. The Triage Problem");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#ef4444").text(c("pitch_problem").headline as string || "");
      doc.fontSize(10).font("Google Sans").fillColor("#334155").text(c("pitch_problem").body as string || "", { lineGap: 3 });
      doc.moveDown(1.5);

      // Solution
      doc.fillColor("#0f172a").fontSize(12).font("Google Sans-Bold").text("2. The ThinkCare Solution");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#10b981").text(c("pitch_solution").headline as string || "");
      doc.fontSize(10).font("Google Sans").fillColor("#334155").text(c("pitch_solution").body as string || "", { lineGap: 3 });
      doc.moveDown(1.5);

      // Market
      doc.fillColor("#0f172a").fontSize(12).font("Google Sans-Bold").text("3. Market Opportunity");
      doc.fontSize(10).font("Google Sans").fillColor("#334155").text(`• TAM: ${c("pitch_market").tam || ""}`);
      doc.text(`• SAM: ${c("pitch_market").sam || ""}`);
      doc.text(`• SOM: ${c("pitch_market").som || ""}`);
      doc.text(`• CAGR: ${c("pitch_market").growth || ""}`);
      doc.moveDown(1.5);

      // Business Model
      doc.fillColor("#0f172a").fontSize(12).font("Google Sans-Bold").text("4. Business & Monetization Model");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#334155").text(c("pitch_business_model").headline as string || "");
      const tiers = (c("pitch_business_model").tiers as any[]) || [];
      tiers.forEach(t => {
        doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text(`  • ${t.name}: `, { continued: true })
           .font("Google Sans").fillColor("#475569").text(t.desc);
      });

      // ==========================================
      // PAGE 3: PITCH DECK & TEAM
      // ==========================================
      doc.addPage({ size: "A4", margin: 50 });
      drawHeader("Part 1: Executive Pitch Deck (Cont.)");

      // Traction
      doc.fillColor("#0f172a").fontSize(12).font("Google Sans-Bold").text("5. Traction & Early Validation");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#334155").text(c("pitch_traction").headline as string || "");
      const metrics = (c("pitch_traction").metrics as any[]) || [];
      metrics.forEach(m => {
        doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text(`  • ${m.label}: `, { continued: true })
           .font("Google Sans").fillColor("#475569").text(m.value);
      });
      doc.moveDown(1.5);

      // Competition
      doc.fillColor("#0f172a").fontSize(12).font("Google Sans-Bold").text("6. Competitive Advantage");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#334155").text(c("pitch_competition").headline as string || "");
      doc.fontSize(10).font("Google Sans").fillColor("#475569").text(c("pitch_competition").advantage as string || "", { lineGap: 3 });
      doc.moveDown(1.5);

      // Team
      doc.fillColor("#0f172a").fontSize(12).font("Google Sans-Bold").text("7. Project Team");
      members.forEach(m => {
        doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text(`  • ${m.name} `, { continued: true })
           .font("Google Sans-Italic").fillColor("#2563eb").text(`(${m.role})`, { continued: true })
           .font("Google Sans").fillColor("#475569").text(` | Email: ${m.email} | Contact: ${m.phone}`);
      });
      doc.moveDown(1.5);

      // Vision
      doc.fillColor("#0f172a").fontSize(12).font("Google Sans-Bold").text("8. Core Vision");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#3b82f6").text(c("pitch_vision").headline as string || "");
      doc.fontSize(10).font("Google Sans").fillColor("#334155").text(c("pitch_vision").body as string || "", { lineGap: 3 });
      doc.moveDown(0.5);
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text("Mission: ", { continued: true })
         .font("Google Sans").fillColor("#475569").text(c("pitch_vision").mission as string || "");

      // ==========================================
      // PAGE 4: TECHNICAL DOCUMENTATION
      // ==========================================
      doc.addPage({ size: "A4", margin: 50 });
      drawHeader("Part 2: Technical Specifications");

      // Product Overview
      doc.fillColor("#0f172a").fontSize(12).font("Google Sans-Bold").text("1. Architecture Overview");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#2563eb").text(c("tech_overview").tagline as string || "");
      doc.fontSize(10).font("Google Sans").fillColor("#334155").text(c("tech_overview").description as string || "", { lineGap: 3 });
      doc.moveDown(1.5);

      // Tech Stack
      doc.fillColor("#0f172a").fontSize(12).font("Google Sans-Bold").text("2. Unified Technology Stack");
      
      const stack = c("tech_stack");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text("  • Frontend: ", { continued: true })
         .font("Google Sans").fillColor("#475569").text(((stack.frontend as string[]) || []).join(", "));
      
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text("  • Backend / APIs: ", { continued: true })
         .font("Google Sans").fillColor("#475569").text(((stack.backend as string[]) || []).join(", "));
      
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text("  • AI Engines (SLM): ", { continued: true })
         .font("Google Sans").fillColor("#475569").text(((stack.ai_slm as string[]) || []).join(", "));

      doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text("  • ML Models (Triage): ", { continued: true })
         .font("Google Sans").fillColor("#475569").text(((stack.ai_classifier as string[]) || []).join(", "));

      doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text("  • Infrastructure: ", { continued: true })
         .font("Google Sans").fillColor("#475569").text(((stack.infra as string[]) || []).join(", "));
      doc.moveDown(1.5);

      // AI Layer Specs
      doc.fillColor("#0f172a").fontSize(12).font("Google Sans-Bold").text("3. Artificial Intelligence serving Layer");
      
      const slm = c("tech_ai").slm || {};
      const cls = c("tech_ai").classifier || {};

      doc.fontSize(10).font("Google Sans-Bold").fillColor("#d97706").text("  • Small Language Model (SLM) Serving:");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text("    Base Engine: ", { continued: true })
         .font("Google Sans").fillColor("#475569").text(slm.base || "");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text("    Primary Task: ", { continued: true })
         .font("Google Sans").fillColor("#475569").text(slm.role || "");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text("    Port & Hosting: ", { continued: true })
         .font("Google Sans").fillColor("#475569").text(slm.deployment || "");

      doc.moveDown(0.5);
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#c026d3").text("  • CatBoost Classification Engine:");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text("    Classifier: ", { continued: true })
         .font("Google Sans").fillColor("#475569").text(cls.model || "");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text("    Input Features: ", { continued: true })
         .font("Google Sans").fillColor("#475569").text(cls.features || "");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text("    Accuracy: ", { continued: true })
         .font("Google Sans").fillColor("#475569").text(cls.accuracy || "");

      // ==========================================
      // PAGE 5: SECURITY & ROADMAP
      // ==========================================
      doc.addPage({ size: "A4", margin: 50 });
      drawHeader("Part 2: Technical Specifications (Cont.)");

      // Security
      doc.fillColor("#0f172a").fontSize(12).font("Google Sans-Bold").text("4. Security & Compliance Controls");
      const sec = c("tech_security");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text("  • Authentication: ", { continued: true })
         .font("Google Sans").fillColor("#475569").text(sec.auth || "");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text("  • Access Control (RBAC): ", { continued: true })
         .font("Google Sans").fillColor("#475569").text(sec.rbac || "");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text("  • Data Protection: ", { continued: true })
         .font("Google Sans").fillColor("#475569").text(sec.data || "");
      doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text("  • Standards Compliance: ", { continued: true })
         .font("Google Sans").fillColor("#475569").text(sec.compliance || "");
      doc.moveDown(1.5);

      // Exposed Endpoints
      doc.fillColor("#0f172a").fontSize(12).font("Google Sans-Bold").text("5. Exposed API Endpoints reference");
      const apis = (c("tech_api").exposed as any[]) || [];
      apis.forEach(api => {
        doc.fontSize(9).font("Google Sans-Bold").fillColor("#10b981").text(`  ${api.method} `, { continued: true })
           .font("Google Sans-Bold").fillColor("#0f172a").text(`${api.path} `, { continued: true })
           .font("Google Sans-Italic").fillColor("#2563eb").text(`(${api.auth}) — `, { continued: true })
           .font("Google Sans").fillColor("#475569").text(api.desc);
      });
      doc.moveDown(1.5);

      // Product Roadmap
      doc.fillColor("#0f172a").fontSize(12).font("Google Sans-Bold").text("6. Product Roadmap & Future Stages");
      const phases = (c("pitch_gtm").phases as any[]) || [];
      phases.forEach(p => {
        doc.fontSize(10).font("Google Sans-Bold").fillColor("#0f172a").text(`  • ${p.phase} — ${p.title}: `, { continued: true })
           .font("Google Sans").fillColor("#475569").text(p.desc);
      });

      // --- PAGE NUMBERING ---
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        
        // Draw footer (except for cover page i=0)
        if (i > 0) {
          const pageFooterY = 790;
          doc.strokeColor("#e2e8f0").lineWidth(0.5).moveTo(50, pageFooterY - 8).lineTo(545.28, pageFooterY - 8).stroke();
          doc.fontSize(8).font("Google Sans").fillColor("#94a3b8").text("ThinkCare AI · Confidential Pitch Deck & Tech Spec", 50, pageFooterY, { align: "left" });
          doc.text(`Page ${i + 1} of ${totalPages}`, 50, pageFooterY, { align: "right", width: 495.28 });
        }
      }

      doc.end();
    });

    // 3. Return compiled PDF response
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ThinkCareAI_Docs_${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF Documentation Export failed:", error);
    return NextResponse.json({ error: "Export failed.", details: error.message || String(error), stack: error.stack || "" }, { status: 500 });
  }
}
