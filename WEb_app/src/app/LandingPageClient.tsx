"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MessageSquare,
  Activity,
  Shield,
  Layers,
  ArrowRight,
  Globe,
  Sun,
  Moon,
  CheckCircle2,
  Cpu,
  Brain
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

// Local translation dictionary for the landing page
const tLocal = {
  heroTag: {
    en: "Next-Gen Bilingual Clinical AI Companion",
    bn: "পরবর্তী প্রজন্মের দ্বিভাষিক ক্লিনিক্যাল এআই সহচর"
  },
  heroTitle: {
    en: "Smart. Bilingual. Predictive Healthcare.",
    bn: "বুদ্ধিমান। দ্বিভাষিক। দূরদর্শী স্বাস্থ্যসেবা।"
  },
  heroDesc: {
    en: "ThinkCare AI bridges the gap in clinical triage by enabling patients to describe symptoms in natural English or Bangla, generating instant risk forecasts and personalized wellness insights.",
    bn: "ThinkCare AI রোগীদের প্রাকৃতিক ইংরেজি বা বাংলায় উপসর্গের বর্ণনা দিতে সাহায্য করে তাৎক্ষণিক ঝুঁকির পূর্বাভাস এবং ব্যক্তিগতকৃত সুস্থতা অন্তর্দৃষ্টি তৈরি করার মাধ্যমে ক্লিনিক্যাল ট্রিয়েজের দূরত্ব ঘুচিয়ে দেয়।"
  },
  getStarted: {
    en: "Get Started Now",
    bn: "এখনই শুরু করুন"
  },
  exploreDocs: {
    en: "Technical Documentation",
    bn: "প্রযুক্তিগত নথিপত্র"
  },
  capabilitiesTitle: {
    en: "Core Capabilities",
    bn: "মূল সুবিধাসমূহ"
  },
  capabilitiesSubtitle: {
    en: "State-of-the-art diagnostic and dialog serving layer purpose-built for clinical environments.",
    bn: "ক্লিনিক্যাল পরিবেশের জন্য বিশেষভাবে তৈরি অত্যাধুনিক ডায়াগনস্টিক এবং সংলাপ পরিবেশন স্তর।"
  },
  cap1Title: {
    en: "Bilingual Dialog Engine",
    bn: "দ্বিভাষিক সংলাপ ইঞ্জিন"
  },
  cap1Desc: {
    en: "Talk naturally in Bangla or English. Our Unicode parser routes inputs to dedicated prompt systems.",
    bn: "বাংলা বা ইংরেজিতে স্বাভাবিকভাবে কথা বলুন। আমাদের ইউনিকোড পার্সার ইনপুটগুলোকে ডেডিকেটেড প্রম্পট সিস্টেমে পাঠায়।"
  },
  cap2Title: {
    en: "CatBoost Triage Forecaster",
    bn: "ক্যাটবুস্ট ট্রিয়েজ ফোরকাস্টার"
  },
  cap2Desc: {
    en: "Classifies 42 primary conditions and severity levels from symptom features in under 500ms.",
    bn: " ৫০০ মিলি-সেকেন্ডের কম সময়ে উপসর্গের উপর ভিত্তি করে ৪২টি প্রাথমিক স্বাস্থ্য অবস্থা এবং তীব্রতা স্তর শ্রেণীবদ্ধ করে।"
  },
  cap3Title: {
    en: "SLM Health Coach",
    bn: "এসএলএম হেলথ কোচ"
  },
  cap3Desc: {
    en: "Generates tailored daily wellness summaries and clinical report text via fine-tuned Qwen2.5 weights.",
    bn: "ফাইন-টিউনড Qwen2.5 ওজনের মাধ্যমে ব্যক্তিগতকৃত দৈনিক সুস্থতা সারাংশ এবং ক্লিনিক্যাল রিপোর্ট তৈরি করে।"
  },
  visionTitle: {
    en: "Vision & Mission",
    bn: "রূপকল্প ও মিশন"
  },
  visionDesc: {
    en: "To democratize clinical intelligence across Bangladesh. We deploy robust AI diagnostics on lightweight consumer infrastructure, bypassing connectivity and language barriers.",
    bn: "সমগ্র বাংলাদেশে ক্লিনিক্যাল বুদ্ধিমত্তাকে সহজলভ্য করা। আমরা সংযোগ এবং ভাষার বাধা এড়িয়ে হালকা ওজনের কনজিউমার অবকাঠামোতে শক্তিশালী AI ডায়াগনস্টিক স্থাপন করি।"
  },
  interactiveDemo: {
    en: "Interactive Preview",
    bn: "ইন্টারেক্টিভ পূর্বরূপ"
  },
  demoInput: {
    en: "I have high fever and severe muscle pain for two days...",
    bn: "আমার দুই দিন ধরে তীব্র জ্বর এবং মারাত্মক পেশী ব্যথা হচ্ছে..."
  },
  demoOutputTitle: {
    en: "ThinkCare Diagnostic Analysis",
    bn: "ThinkCare ডায়াগনস্টিক বিশ্লেষণ"
  },
  demoOutputDisease: {
    en: "Potential Risk: Malaria (Moderate Severity)",
    bn: "সম্ভাব্য ঝুঁকি: ম্যালেরিয়া (মাঝারি তীব্রতা)"
  },
  demoOutputPrecaution: {
    en: "Precautions: Consult a clinician immediately, keep hydrated, use mosquito netting.",
    bn: "সতর্কতা: অবিলম্বে চিকিৎসকের পরামর্শ নিন, হাইড্রেটেড থাকুন, মশারি ব্যবহার করুন।"
  },
  footerConfidential: {
    en: "Confidential · ThinkCare AI Team 2026 · Hackathon Presentation",
    bn: "গোপনীয় · ThinkCare AI দল ২০২৬ · হ্যাকাথন উপস্থাপনা"
  },
  signIn: {
    en: "Sign In",
    bn: "সাইন ইন"
  }
};

export default function LandingPageClient() {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [demoStep, setDemoStep] = useState<"input" | "output">("input");

  const l = (key: keyof typeof tLocal) => tLocal[key][language as "en" | "bn"] || tLocal[key]["en"];

  return (
    <div className="min-h-screen flex flex-col bg-[#0c101b] text-white font-sans overflow-x-hidden">
      
      {/* ─── HEADER ───────────────────────────────────────────── */}
      <header className="border-b border-[#1e293b]/50 bg-[#0c101b]/95 sticky top-0 z-50 px-6 py-4 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 shrink-0 bg-[#12243d] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10 border border-blue-500/10">
              <svg width="26" height="26" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gNavLandingHeader" x1="0" y1="0" x2="110" y2="110" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#00d4ff"/>
                    <stop offset="100%" stopColor="#00ffa3"/>
                  </linearGradient>
                  <clipPath id="hcNavLandingHeader">
                    <path d="M55,38 C55,38 44,26 33,26 C20,26 11,36 11,48 C11,68 33,83 55,99 C77,83 99,68 99,48 C99,36 90,26 77,26 C66,26 55,38 55,38 Z"/>
                  </clipPath>
                </defs>
                <circle cx="55" cy="57" r="6" fill="none" stroke="#00d4ff" strokeWidth="2" opacity="0"
                  style={{ animation: "bloom 1.8s 2.6s ease-out infinite" }}/>
                <g style={{ transformOrigin: "55px 60px", animation: "heartbeat 1.8s 2.4s ease-in-out infinite" }}>
                  <path d="M55,38 C55,38 44,26 33,26 C20,26 11,36 11,48 C11,68 33,83 55,99 C77,83 99,68 99,48 C99,36 90,26 77,26 C66,26 55,38 55,38 Z"
                    fill="#0a1828" stroke="url(#gNavLandingHeader)" strokeWidth="2.8"
                    strokeDasharray="320" strokeDashoffset="320"
                    style={{ animation: "heartDraw 1.2s cubic-bezier(.4,0,.2,1) 0.2s forwards" }}/>
                </g>
                <polyline points="11,57 28,57 36,57 42,40 48,74 53,40 59,57 99,57"
                  fill="none" stroke="url(#gNavLandingHeader)" strokeWidth="2.8"
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="220" strokeDashoffset="220"
                  clipPath="url(#hcNavLandingHeader)"
                  style={{ animation: "ecgIn 0.9s cubic-bezier(.4,0,.2,1) 1.5s forwards" }}/>
                <polyline points="11,57 28,57 36,57 42,40 48,74 53,40 59,57 99,57"
                  fill="none" stroke="url(#gNavLandingHeader)" strokeWidth="2.8"
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="220" strokeDashoffset="220"
                  clipPath="url(#hcNavLandingHeader)" opacity="0"
                  style={{ animation: "ecgLoop 1.8s 2.4s ease-in-out infinite" }}/>
              </svg>
            </div>
            <div>
              <span className="text-white font-extrabold text-sm tracking-wide font-sans block">ThinkCare AI</span>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-widest leading-none mt-0.5">Clinical Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === "en" ? "bn" : "en")}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-[#2e3e56] hover:border-blue-400/50 text-slate-400 hover:text-blue-400 text-xs font-bold transition-all cursor-pointer bg-[#0c101b]/50"
            >
              <Globe className="h-4 w-4" />
              <span>{language === "en" ? "বাংলা" : "English"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2.5 rounded-xl border border-[#2e3e56] hover:border-blue-400/50 text-slate-400 hover:text-blue-400 transition-all cursor-pointer bg-[#0c101b]/50"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-400" />
              )}
            </button>

            {/* Sign In button */}
            <Link
              href="/login"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-blue-500/10 transition-colors"
            >
              {l("signIn")}
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─────────────────────────────────────── */}
      <section className="flex-1 max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center justify-center text-center relative z-10">
        
        {/* Glow Background Gradient */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full filter blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-[#9cbbf8] mb-6 animate-pulse">
          <Cpu className="w-3.5 h-3.5" />
          <span>{l("heroTag")}</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mb-6">
          {l("heroTitle")}
        </h1>

        <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl mb-10 font-sans">
          {l("heroDesc")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
          <Link
            href="/register"
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all"
          >
            <span>{l("getStarted")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/docs"
            className="flex-1 flex items-center justify-center py-4 px-6 rounded-xl border border-[#2e3e56] hover:border-slate-400 text-slate-400 hover:text-white font-bold text-sm bg-slate-900/10 transition-colors"
          >
            {l("exploreDocs")}
          </Link>
        </div>
      </section>

      {/* ─── CAPABILITIES SECTION ─────────────────────────────── */}
      <section className="bg-[#131824]/40 border-t border-b border-[#1e293b]/50 py-16 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">
              {l("capabilitiesTitle")}
            </h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto leading-normal">
              {l("capabilitiesSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Capability 1 */}
            <div className="bg-[#131824] border border-[#1e293b] rounded-2xl p-6 hover:border-blue-400/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold text-base mb-2">{l("cap1Title")}</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">{l("cap1Desc")}</p>
            </div>

            {/* Capability 2 */}
            <div className="bg-[#131824] border border-[#1e293b] rounded-2xl p-6 hover:border-emerald-400/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold text-base mb-2">{l("cap2Title")}</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">{l("cap2Desc")}</p>
            </div>

            {/* Capability 3 */}
            <div className="bg-[#131824] border border-[#1e293b] rounded-2xl p-6 hover:border-amber-400/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold text-base mb-2">{l("cap3Title")}</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">{l("cap3Desc")}</p>
            </div>
          </div>

        </div>
      </section>

      {/* ─── INTERACTIVE PREVIEW ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16 w-full relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">
            {l("interactiveDemo")}
          </h2>
        </div>

        <div className="max-w-xl mx-auto bg-[#131824] border border-[#1e293b] rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1e293b]/50 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Inference Pipe Mockup</span>
          </div>

          {demoStep === "input" ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-[#0c101b] border border-[#2e3e56] rounded-xl p-4 text-slate-300 text-xs leading-relaxed font-sans min-y-[60px]">
                {l("demoInput")}
              </div>
              <button
                onClick={() => setDemoStep("output")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Run Prediction</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-[#0c101b] border border-blue-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                  <Shield className="w-4 h-4" />
                  <span>{l("demoOutputTitle")}</span>
                </div>
                <p className="text-white text-xs font-bold font-sans">{l("demoOutputDisease")}</p>
                <p className="text-slate-400 text-[10px] leading-relaxed font-sans">{l("demoOutputPrecaution")}</p>
              </div>
              <button
                onClick={() => setDemoStep("input")}
                className="w-full border border-[#2e3e56] hover:border-slate-400 text-slate-400 hover:text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors"
              >
                Reset Demo
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ─── VISION & MISSION ─────────────────────────────────── */}
      <section className="bg-[#131824]/20 border-t border-[#1e293b]/50 py-16 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5.5 h-5.5 text-blue-400" />
              <span>{l("visionTitle")}</span>
            </h2>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-xl font-sans">
              {l("visionDesc")}
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center justify-center p-8 bg-[#131824] border border-[#1e293b] rounded-2xl shadow-xl w-full md:w-80">
            <div className="space-y-3 text-center">
              <CheckCircle2 className="w-12 h-12 text-[#00b86b] mx-auto" />
              <div className="text-white font-bold text-sm">HIPAA Aligned Platform</div>
              <div className="text-slate-500 text-[10px] leading-normal font-sans">All health metadata processed on localized secure server models.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-[#1e293b]/50 bg-[#0c101b] py-8 text-center px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#12243d] flex items-center justify-center border border-blue-500/10">
              <svg width="18" height="18" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gNavLandingFooter" x1="0" y1="0" x2="110" y2="110" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#00d4ff"/>
                    <stop offset="100%" stopColor="#00ffa3"/>
                  </linearGradient>
                  <clipPath id="hcNavLandingFooter">
                    <path d="M55,38 C55,38 44,26 33,26 C20,26 11,36 11,48 C11,68 33,83 55,99 C77,83 99,68 99,48 C99,36 90,26 77,26 C66,26 55,38 55,38 Z"/>
                  </clipPath>
                </defs>
                <circle cx="55" cy="57" r="6" fill="none" stroke="#00d4ff" strokeWidth="2" opacity="0"
                  style={{ animation: "bloom 1.8s 2.6s ease-out infinite" }}/>
                <g style={{ transformOrigin: "55px 60px", animation: "heartbeat 1.8s 2.4s ease-in-out infinite" }}>
                  <path d="M55,38 C55,38 44,26 33,26 C20,26 11,36 11,48 C11,68 33,83 55,99 C77,83 99,68 99,48 C99,36 90,26 77,26 C66,26 55,38 55,38 Z"
                    fill="#0a1828" stroke="url(#gNavLandingFooter)" strokeWidth="2.8"
                    strokeDasharray="320" strokeDashoffset="320"
                    style={{ animation: "heartDraw 1.2s cubic-bezier(.4,0,.2,1) 0.2s forwards" }}/>
                </g>
                <polyline points="11,57 28,57 36,57 42,40 48,74 53,40 59,57 99,57"
                  fill="none" stroke="url(#gNavLandingFooter)" strokeWidth="2.8"
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="220" strokeDashoffset="220"
                  clipPath="url(#hcNavLandingFooter)"
                  style={{ animation: "ecgIn 0.9s cubic-bezier(.4,0,.2,1) 1.5s forwards" }}/>
                <polyline points="11,57 28,57 36,57 42,40 48,74 53,40 59,57 99,57"
                  fill="none" stroke="url(#gNavLandingFooter)" strokeWidth="2.8"
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="220" strokeDashoffset="220"
                  clipPath="url(#hcNavLandingFooter)" opacity="0"
                  style={{ animation: "ecgLoop 1.8s 2.4s ease-in-out infinite" }}/>
              </svg>
            </div>
            <span className="text-white font-bold text-xs">ThinkCare AI</span>
          </div>
          <p className="text-[#64748b] text-[10px] font-sans">
            {l("footerConfidential")}
          </p>
        </div>
      </footer>

    </div>
  );
}
