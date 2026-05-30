import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Default content seeded on first access
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
      { method: "POST", path: "http://localhost:8002/chat", auth: "Internal", desc: "SLM inference (Qwen2.5)" },
      { method: "POST", path: "http://localhost:8001/predict", auth: "Internal", desc: "CatBoost disease classifier" },
    ],
  },
  tech_ai: {
    slm: {
      name: "ThinkCare SLM",
      base: "Qwen2.5 (fine-tuned on clinical Q&A, EN+BN)",
      role: "Natural language understanding, health insight generation, Bangla response synthesis",
      deployment: "FastAPI on CPU server, port 8002",
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
    const rows = await prisma.docsContent.findMany();
    const contentMap: Record<string, unknown> = {};

    for (const row of rows) {
      try {
        contentMap[row.section] = JSON.parse(row.content);
      } catch {
        contentMap[row.section] = row.content;
      }
    }

    // Fill in any missing sections with defaults
    for (const [key, value] of Object.entries(DEFAULT_CONTENT)) {
      if (!(key in contentMap)) {
        contentMap[key] = value;
      }
    }

    return NextResponse.json({ content: contentMap });
  } catch (error) {
    console.error("[/api/docs/content] Error:", error);
    return NextResponse.json({ error: "Failed to load content." }, { status: 500 });
  }
}
