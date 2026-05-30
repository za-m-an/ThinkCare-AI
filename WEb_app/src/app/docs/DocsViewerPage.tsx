"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Menu, X, Search, Download, ChevronRight, Activity, Shield,
  Layers, Code2, Database, Brain, BarChart3, Rocket, Users,
  TrendingUp, Globe, CheckCircle2, Clock, AlertCircle, Star,
  ArrowRight, ExternalLink, Zap, Target, Award, BookOpen,
  GitBranch, Server, Cpu, Lock, LineChart, Map, FileText,
  Mail, Phone, ChevronDown, Circle
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────
interface TeamMember {
  name: string; role: string; email: string; phone: string;
  avatar: string; badge: string;
}
interface DocsContent { [key: string]: Record<string, unknown>; }

// ─── Navigation sections ─────────────────────────────────
const NAV_SECTIONS = [
  {
    group: "Pitch Deck", icon: Star,
    items: [
      { id: "cover", label: "Cover" },
      { id: "problem", label: "Problem" },
      { id: "solution", label: "Solution" },
      { id: "why-now", label: "Why Now" },
      { id: "market", label: "Market" },
      { id: "business-model", label: "Business Model" },
      { id: "traction", label: "Traction" },
      { id: "competition", label: "Competition" },
      { id: "go-to-market", label: "Go-To-Market" },
      { id: "team", label: "Team" },
      { id: "vision", label: "Vision" },
    ],
  },
  {
    group: "Technical Docs", icon: Code2,
    items: [
      { id: "product-overview", label: "Product Overview" },
      { id: "features", label: "Feature Matrix" },
      { id: "architecture", label: "Architecture" },
      { id: "data-flow", label: "Data Flow" },
      { id: "tech-stack", label: "Tech Stack" },
      { id: "api-docs", label: "API Reference" },
      { id: "ai-layer", label: "AI Layer" },
      { id: "security", label: "Security" },
      { id: "roadmap", label: "Roadmap" },
      { id: "changelog", label: "Changelog" },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    live: { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: <CheckCircle2 className="w-3 h-3" />, label: "Live" },
    planned: { color: "text-[#9cbbf8] bg-[#9cbbf8]/10 border-[#9cbbf8]/20", icon: <Clock className="w-3 h-3" />, label: "Planned" },
    beta: { color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: <AlertCircle className="w-3 h-3" />, label: "Beta" },
  };
  const s = map[status] || map.planned;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${s.color}`}>
      {s.icon}{s.label}
    </span>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle, tag }: { icon: React.ElementType; title: string; subtitle?: string; tag?: string }) => (
  <div className="mb-10">
    {tag && (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9cbbf8] uppercase tracking-widest mb-3">
        <Icon className="w-3.5 h-3.5" />{tag}
      </span>
    )}
    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">{title}</h2>
    {subtitle && <p className="text-[#64748b] text-lg leading-relaxed max-w-2xl">{subtitle}</p>}
  </div>
);

const Card = ({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`bg-[#131824] border border-[#1e293b] rounded-2xl p-6 ${className}`} style={style}>
    {children}
  </div>
);

// ─── Architecture SVG Diagram ─────────────────────────────
const ArchitectureDiagram = () => (
  <div className="overflow-x-auto">
    <svg viewBox="0 0 800 420" className="w-full max-w-3xl mx-auto" style={{ minWidth: 480 }}>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#9cbbf8" />
        </marker>
        <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e2d4a" />
          <stop offset="100%" stopColor="#131824" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* User */}
      <rect x="330" y="10" width="140" height="50" rx="12" fill="url(#boxGrad)" stroke="#9cbbf8" strokeWidth="1.5" />
      <text x="400" y="31" textAnchor="middle" fill="#9cbbf8" fontSize="11" fontWeight="600">User Browser</text>
      <text x="400" y="48" textAnchor="middle" fill="#64748b" fontSize="9">React / Next.js</text>

      {/* Arrow down */}
      <line x1="400" y1="60" x2="400" y2="100" stroke="#9cbbf8" strokeWidth="1.5" markerEnd="url(#arrow)" />

      {/* Next.js */}
      <rect x="280" y="100" width="240" height="60" rx="12" fill="url(#boxGrad)" stroke="#4f7ef8" strokeWidth="1.5" />
      <text x="400" y="125" textAnchor="middle" fill="#9cbbf8" fontSize="12" fontWeight="700">Next.js App (Port 3000)</text>
      <text x="400" y="143" textAnchor="middle" fill="#64748b" fontSize="9">Pages · API Routes · Middleware</text>

      {/* Arrows to DB and AI */}
      <line x1="310" y1="160" x2="160" y2="230" stroke="#9cbbf8" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <line x1="490" y1="160" x2="560" y2="230" stroke="#9cbbf8" strokeWidth="1.5" markerEnd="url(#arrow)" />
      <line x1="400" y1="160" x2="400" y2="230" stroke="#9cbbf8" strokeWidth="1.5" markerEnd="url(#arrow)" />

      {/* PostgreSQL */}
      <rect x="50" y="230" width="180" height="60" rx="12" fill="url(#boxGrad)" stroke="#00b86b" strokeWidth="1.5" />
      <text x="140" y="255" textAnchor="middle" fill="#00b86b" fontSize="11" fontWeight="600">PostgreSQL (Neon)</text>
      <text x="140" y="273" textAnchor="middle" fill="#64748b" fontSize="9">Prisma ORM · Users · Sessions</text>

      {/* SLM */}
      <rect x="310" y="230" width="180" height="60" rx="12" fill="url(#boxGrad)" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="400" y="255" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="600">ThinkCare SLM</text>
      <text x="400" y="273" textAnchor="middle" fill="#64748b" fontSize="9">Qwen2.5 · Ollama · Port 11434</text>

      {/* CatBoost */}
      <rect x="570" y="230" width="180" height="60" rx="12" fill="url(#boxGrad)" stroke="#e879f9" strokeWidth="1.5" />
      <text x="660" y="255" textAnchor="middle" fill="#e879f9" fontSize="11" fontWeight="600">CatBoost Classifier</text>
      <text x="660" y="273" textAnchor="middle" fill="#64748b" fontSize="9">42 Diseases · FastAPI · Port 8001</text>

      {/* Labels */}
      <text x="225" y="200" fill="#64748b" fontSize="9" textAnchor="middle">Prisma</text>
      <text x="355" y="198" fill="#64748b" fontSize="9" textAnchor="middle">HTTP/JSON</text>
      <text x="535" y="200" fill="#64748b" fontSize="9" textAnchor="middle">HTTP/JSON</text>

      {/* Flow return arrows */}
      <line x1="140" y1="290" x2="310" y2="355" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,3" />
      <line x1="400" y1="290" x2="400" y2="355" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,3" />
      <line x1="660" y1="290" x2="490" y2="355" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,3" />

      {/* Response aggregation */}
      <rect x="290" y="355" width="220" height="50" rx="12" fill="#0c101b" stroke="#1e293b" strokeWidth="1.5" />
      <text x="400" y="377" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600">Response Aggregator</text>
      <text x="400" y="393" textAnchor="middle" fill="#334155" fontSize="9">Merge · Format · Return JSON</text>
    </svg>
  </div>
);

// ─── Data Flow Diagram ────────────────────────────────────
const DataFlowDiagram = () => {
  const steps = [
    { label: "User Input", sublabel: "Symptom description\n(EN or BN)", color: "#9cbbf8", icon: "💬" },
    { label: "Language Detection", sublabel: "Unicode range check\n[\\u0980-\\u09ff]", color: "#4f7ef8", icon: "🌍" },
    { label: "SLM Processing", sublabel: "Feature extraction\n+ response draft", color: "#f59e0b", icon: "🧠" },
    { label: "CatBoost Predict", sublabel: "42-class disease\nclassification", color: "#e879f9", icon: "⚡" },
    { label: "Result Synthesis", sublabel: "Merge predictions\n+ format output", color: "#00b86b", icon: "✅" },
    { label: "User Response", sublabel: "Structured report\n+ precautions", color: "#9cbbf8", icon: "📊" },
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center justify-center py-4">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-2 min-w-[100px]">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
              style={{ background: `${step.color}15`, border: `1.5px solid ${step.color}40` }}
            >
              {step.icon}
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-white leading-tight">{step.label}</div>
              <div className="text-[10px] text-[#64748b] mt-0.5 leading-tight whitespace-pre-line">{step.sublabel}</div>
            </div>
          </div>
          {i < steps.length - 1 && (
            <ArrowRight className="w-4 h-4 text-[#1e293b] flex-shrink-0 mt-[-20px]" />
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────
export default function DocsViewerPage() {
  const [content, setContent] = useState<DocsContent>({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("cover");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load content
  useEffect(() => {
    fetch("/api/docs/content")
      .then((r) => r.json())
      .then((data) => {
        setContent(data.content || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Track active section on scroll
  useEffect(() => {
    const allItems = NAV_SECTIONS.flatMap((g) => g.items);
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    allItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [loading]);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
    setSidebarOpen(false);
  }, []);

  const handleExportPDF = () => {
    window.open("/api/docs/export", "_blank");
  };

  // Filter nav items by search
  const filteredNav = searchQuery
    ? NAV_SECTIONS.map((g) => ({
        ...g,
        items: g.items.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase())),
      })).filter((g) => g.items.length > 0)
    : NAV_SECTIONS;

  // Content shortcuts
  const c = (key: string) => (content[key] || {}) as Record<string, unknown>;
  const team = c("team");
  const members = (team.members as TeamMember[]) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c101b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#9cbbf8] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#64748b] text-sm">Loading documentation...</p>
        </div>
      </div>
    );
  }

  // ─── Sidebar ─────────────────────────────────────────────
  const renderSidebar = () => (
    <aside className="w-64 flex-shrink-0 flex flex-col h-full bg-[#0c101b] border-r border-[#1e293b]">
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-[#1e293b]">
        <div className="w-8 h-8 rounded-lg bg-[#12243d] flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20 border border-blue-500/10">
          <svg width="24" height="24" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gNavDocsSidebar" x1="0" y1="0" x2="110" y2="110" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00d4ff"/>
                <stop offset="100%" stopColor="#00ffa3"/>
              </linearGradient>
              <clipPath id="hcNavDocsSidebar">
                <path d="M55,38 C55,38 44,26 33,26 C20,26 11,36 11,48 C11,68 33,83 55,99 C77,83 99,68 99,48 C99,36 90,26 77,26 C66,26 55,38 55,38 Z"/>
              </clipPath>
            </defs>
            <circle cx="55" cy="57" r="6" fill="none" stroke="#00d4ff" strokeWidth="2" opacity="0"
              style={{ animation: "bloom 1.8s 2.6s ease-out infinite" }}/>
            <g style={{ transformOrigin: "55px 60px", animation: "heartbeat 1.8s 2.4s ease-in-out infinite" }}>
              <path d="M55,38 C55,38 44,26 33,26 C20,26 11,36 11,48 C11,68 33,83 55,99 C77,83 99,68 99,48 C99,36 90,26 77,26 C66,26 55,38 55,38 Z"
                fill="#0a1828" stroke="url(#gNavDocsSidebar)" strokeWidth="2.8"
                strokeDasharray="320" strokeDashoffset="320"
                style={{ animation: "heartDraw 1.2s cubic-bezier(.4,0,.2,1) 0.2s forwards" }}/>
            </g>
            <polyline points="11,57 28,57 36,57 42,40 48,74 53,40 59,57 99,57"
              fill="none" stroke="url(#gNavDocsSidebar)" strokeWidth="2.8"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="220" strokeDashoffset="220"
              clipPath="url(#hcNavDocsSidebar)"
              style={{ animation: "ecgIn 0.9s cubic-bezier(.4,0,.2,1) 1.5s forwards" }}/>
            <polyline points="11,57 28,57 36,57 42,40 48,74 53,40 59,57 99,57"
              fill="none" stroke="url(#gNavDocsSidebar)" strokeWidth="2.8"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="220" strokeDashoffset="220"
              clipPath="url(#hcNavDocsSidebar)" opacity="0"
              style={{ animation: "ecgLoop 1.8s 2.4s ease-in-out infinite" }}/>
          </svg>
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">ThinkCare AI</div>
          <div className="text-[#64748b] text-[10px]">Docs & Pitch Deck</div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-[#1e293b]">
        <div className="flex items-center gap-2 bg-[#131824] border border-[#1e293b] rounded-xl px-3 py-2">
          <Search className="w-3.5 h-3.5 text-[#64748b] flex-shrink-0" />
          <input
            className="bg-transparent text-white text-xs outline-none placeholder-[#64748b] w-full"
            placeholder="Search sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {filteredNav.map(({ group, icon: Icon, items }) => (
          <div key={group}>
            <div className="flex items-center gap-1.5 text-[#64748b] text-[10px] font-semibold uppercase tracking-widest mb-2 px-2">
              <Icon className="w-3 h-3" />{group}
            </div>
            <div className="space-y-0.5">
              {items.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                    activeSection === id
                      ? "bg-[#9cbbf8]/10 text-[#9cbbf8] border border-[#9cbbf8]/20"
                      : "text-[#64748b] hover:text-white hover:bg-[#131824]"
                  }`}
                >
                  {activeSection === id && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                  {activeSection !== id && <span className="w-3 h-3 flex-shrink-0" />}
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );

  // ─── Content ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0c101b] flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex sticky top-0 h-screen">
        {renderSidebar()}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 h-full flex">
            {renderSidebar()}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 z-10 text-white bg-[#131824] rounded-xl p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-40 bg-[#0c101b]/95 backdrop-blur border-b border-[#1e293b] px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-[#64748b] hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-6 h-6 rounded-md bg-[#12243d] flex items-center justify-center shadow-sm shadow-blue-500/20 border border-blue-500/10">
              <svg width="18" height="18" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gNavDocsMobile" x1="0" y1="0" x2="110" y2="110" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#00d4ff"/>
                    <stop offset="100%" stopColor="#00ffa3"/>
                  </linearGradient>
                  <clipPath id="hcNavDocsMobile">
                    <path d="M55,38 C55,38 44,26 33,26 C20,26 11,36 11,48 C11,68 33,83 55,99 C77,83 99,68 99,48 C99,36 90,26 77,26 C66,26 55,38 55,38 Z"/>
                  </clipPath>
                </defs>
                <circle cx="55" cy="57" r="6" fill="none" stroke="#00d4ff" strokeWidth="2" opacity="0"
                  style={{ animation: "bloom 1.8s 2.6s ease-out infinite" }}/>
                <g style={{ transformOrigin: "55px 60px", animation: "heartbeat 1.8s 2.4s ease-in-out infinite" }}>
                  <path d="M55,38 C55,38 44,26 33,26 C20,26 11,36 11,48 C11,68 33,83 55,99 C77,83 99,68 99,48 C99,36 90,26 77,26 C66,26 55,38 55,38 Z"
                    fill="#0a1828" stroke="url(#gNavDocsMobile)" strokeWidth="2.8"
                    strokeDasharray="320" strokeDashoffset="320"
                    style={{ animation: "heartDraw 1.2s cubic-bezier(.4,0,.2,1) 0.2s forwards" }}/>
                </g>
                <polyline points="11,57 28,57 36,57 42,40 48,74 53,40 59,57 99,57"
                  fill="none" stroke="url(#gNavDocsMobile)" strokeWidth="2.8"
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="220" strokeDashoffset="220"
                  clipPath="url(#hcNavDocsMobile)"
                  style={{ animation: "ecgIn 0.9s cubic-bezier(.4,0,.2,1) 1.5s forwards" }}/>
                <polyline points="11,57 28,57 36,57 42,40 48,74 53,40 59,57 99,57"
                  fill="none" stroke="url(#gNavDocsMobile)" strokeWidth="2.8"
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="220" strokeDashoffset="220"
                  clipPath="url(#hcNavDocsMobile)" opacity="0"
                  style={{ animation: "ecgLoop 1.8s 2.4s ease-in-out infinite" }}/>
              </svg>
            </div>
            <span className="text-white font-semibold text-sm">ThinkCare AI Docs</span>
          </div>
          <button onClick={handleExportPDF} className="text-[#64748b] hover:text-[#9cbbf8] transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 space-y-32">

          {/* ── COVER ─────────────────────────────────────────── */}
          <section id="cover" className="min-h-[60vh] flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-[#9cbbf8]/10 border border-[#9cbbf8]/20 rounded-full px-4 py-1.5 text-[#9cbbf8] text-xs font-semibold mb-8 w-fit">
              <Star className="w-3.5 h-3.5" /> Hackathon Submission · 2026
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              ThinkCare<br />
              <span className="bg-gradient-to-r from-[#9cbbf8] to-[#4f7ef8] bg-clip-text text-transparent">AI</span>
            </h1>
            <p className="text-xl text-[#64748b] leading-relaxed mb-10 max-w-2xl">
              A bilingual clinical AI companion for Bangladesh — combining a fine-tuned SLM and proprietary disease classifier to deliver real-time health risk assessment in English and Bangla.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button onClick={() => scrollTo("problem")} className="flex items-center gap-2 px-6 py-3 bg-[#9cbbf8] text-[#0c101b] rounded-xl font-bold hover:bg-[#82a5f5] transition-colors">
                See Pitch Deck <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => scrollTo("product-overview")} className="flex items-center gap-2 px-6 py-3 bg-[#131824] border border-[#1e293b] text-[#9cbbf8] rounded-xl font-bold hover:border-[#9cbbf8]/50 transition-colors">
                Technical Docs <Code2 className="w-4 h-4" />
              </button>
            </div>

            {/* Stats strip */}
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Diseases Classified", value: "42", icon: Brain },
                { label: "Model Accuracy", value: "~91%", icon: Target },
                { label: "Languages", value: "EN + BN", icon: Globe },
                { label: "AI Engines", value: "2", icon: Cpu },
              ].map(({ label, value, icon: Icon }) => (
                <Card key={label} className="text-center py-5">
                  <Icon className="w-5 h-5 text-[#9cbbf8] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-[#64748b] text-xs mt-1">{label}</div>
                </Card>
              ))}
            </div>
          </section>

          {/* ── PROBLEM ──────────────────────────────────────── */}
          <section id="problem">
            <SectionHeader icon={AlertCircle} tag="Problem" title={(c("pitch_problem").headline as string) || "The Problem"} />
            <p className="text-[#64748b] text-lg leading-relaxed mb-8">{c("pitch_problem").body as string}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {((c("pitch_problem").stats as { label: string; value: string }[]) || []).map((stat) => (
                <Card key={stat.label} className="text-center py-6">
                  <div className="text-4xl font-bold text-[#9cbbf8] mb-2">{stat.value}</div>
                  <div className="text-[#64748b] text-sm">{stat.label}</div>
                </Card>
              ))}
            </div>
          </section>

          {/* ── SOLUTION ─────────────────────────────────────── */}
          <section id="solution">
            <SectionHeader icon={Zap} tag="Solution" title={(c("pitch_solution").headline as string) || "Our Solution"} />
            <p className="text-[#64748b] text-lg leading-relaxed mb-8">{c("pitch_solution").body as string}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {((c("pitch_solution").pillars as string[]) || []).map((p) => (
                <div key={p} className="flex items-start gap-3 bg-[#131824] border border-[#1e293b] rounded-xl p-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white text-sm">{p}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── WHY NOW ──────────────────────────────────────── */}
          <section id="why-now">
            <SectionHeader icon={Clock} tag="Timing" title={(c("pitch_why_now").headline as string) || "Why Now"} />
            <div className="space-y-4">
              {((c("pitch_why_now").points as string[]) || []).map((point, i) => (
                <div key={i} className="flex items-start gap-4 bg-[#131824] border border-[#1e293b] rounded-xl p-5">
                  <div className="w-7 h-7 rounded-full bg-[#9cbbf8]/10 border border-[#9cbbf8]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#9cbbf8] text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-white text-sm leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── MARKET ───────────────────────────────────────── */}
          <section id="market">
            <SectionHeader icon={Globe} tag="Opportunity" title="Market Opportunity" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: "TAM", sublabel: "Total Addressable Market", value: c("pitch_market").tam as string, color: "#9cbbf8" },
                { label: "SAM", sublabel: "Serviceable Addressable Market", value: c("pitch_market").sam as string, color: "#4f7ef8" },
                { label: "SOM", sublabel: "Serviceable Obtainable Market", value: c("pitch_market").som as string, color: "#00b86b" },
              ].map(({ label, sublabel, value, color }) => (
                <Card key={label} className="text-center py-8">
                  <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color }}>{label}</div>
                  <div className="text-xs text-[#64748b] mb-4">{sublabel}</div>
                  <div className="text-lg font-bold text-white leading-tight">{value}</div>
                </Card>
              ))}
            </div>
            <Card className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-emerald-400 flex-shrink-0" />
              <p className="text-white font-semibold">{c("pitch_market").growth as string}</p>
            </Card>
          </section>

          {/* ── BUSINESS MODEL ───────────────────────────────── */}
          <section id="business-model">
            <SectionHeader icon={BarChart3} tag="Revenue" title={(c("pitch_business_model").headline as string) || "Business Model"} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {((c("pitch_business_model").tiers as { name: string; desc: string }[]) || []).map((tier, i) => (
                <Card key={tier.name} className={i === 1 ? "border-[#9cbbf8]/30" : ""}>
                  {i === 1 && <div className="text-[10px] text-[#9cbbf8] font-bold uppercase tracking-widest mb-2">⭐ Primary</div>}
                  <div className="text-white font-bold mb-2">{tier.name}</div>
                  <div className="text-[#64748b] text-sm">{tier.desc}</div>
                </Card>
              ))}
            </div>
          </section>

          {/* ── TRACTION ─────────────────────────────────────── */}
          <section id="traction">
            <SectionHeader icon={TrendingUp} tag="Validation" title={(c("pitch_traction").headline as string) || "Traction"} />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {((c("pitch_traction").metrics as { label: string; value: string }[]) || []).map((m) => (
                <Card key={m.label} className="text-center py-5">
                  <div className="text-xl font-bold text-emerald-400 mb-1">{m.value}</div>
                  <div className="text-[#64748b] text-xs leading-tight">{m.label}</div>
                </Card>
              ))}
            </div>
          </section>

          {/* ── COMPETITION ──────────────────────────────────── */}
          <section id="competition">
            <SectionHeader icon={Target} tag="Landscape" title={(c("pitch_competition").headline as string) || "Competition"} />
            <div className="overflow-x-auto mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e293b]">
                    <th className="text-left py-3 px-4 text-[#64748b] text-xs font-semibold uppercase tracking-widest">Competitor</th>
                    <th className="text-left py-3 px-4 text-[#64748b] text-xs font-semibold uppercase tracking-widest">Region</th>
                    <th className="text-left py-3 px-4 text-[#64748b] text-xs font-semibold uppercase tracking-widest">Gap vs ThinkCare</th>
                  </tr>
                </thead>
                <tbody>
                  {((c("pitch_competition").competitors as { name: string; region: string; gap: string }[]) || []).map((comp) => (
                    <tr key={comp.name} className="border-b border-[#1e293b] hover:bg-[#131824] transition-colors">
                      <td className="py-4 px-4 text-white text-sm font-medium">{comp.name}</td>
                      <td className="py-4 px-4 text-[#64748b] text-sm">{comp.region}</td>
                      <td className="py-4 px-4 text-[#64748b] text-sm">{comp.gap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Card className="border-[#9cbbf8]/20 bg-[#9cbbf8]/5">
              <div className="flex items-start gap-3">
                <Award className="w-6 h-6 text-[#9cbbf8] flex-shrink-0 mt-0.5" />
                <p className="text-white font-semibold leading-relaxed">{c("pitch_competition").advantage as string}</p>
              </div>
            </Card>
          </section>

          {/* ── GO TO MARKET ─────────────────────────────────── */}
          <section id="go-to-market">
            <SectionHeader icon={Map} tag="Strategy" title="Go-To-Market" />
            <div className="space-y-4">
              {((c("pitch_gtm").phases as { phase: string; title: string; desc: string }[]) || []).map((p, i) => (
                <div key={p.phase} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#9cbbf8]/10 border border-[#9cbbf8]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#9cbbf8] text-xs font-bold">{i + 1}</span>
                    </div>
                    {i < 2 && <div className="w-0.5 flex-1 bg-[#1e293b] my-2" />}
                  </div>
                  <Card className="flex-1 mb-0">
                    <div className="text-[#9cbbf8] text-xs font-semibold mb-1">{p.phase}</div>
                    <div className="text-white font-bold mb-2">{p.title}</div>
                    <div className="text-[#64748b] text-sm">{p.desc}</div>
                  </Card>
                </div>
              ))}
            </div>
          </section>

          {/* ── TEAM ─────────────────────────────────────────── */}
          <section id="team">
            <SectionHeader icon={Users} tag="Team" title={(team.name as string) || "The Team"} subtitle="Built by a passionate team solving real healthcare challenges in Bangladesh." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {members.map((member) => (
                <div
                  key={member.name}
                  className="bg-[#131824] border border-[#1e293b] rounded-2xl p-6 flex flex-col items-center text-center hover:border-[#9cbbf8]/30 transition-all group"
                >
                  {/* Avatar */}
                  <div className="relative w-20 h-20 mb-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#1e293b] group-hover:border-[#9cbbf8]/40 transition-all bg-[#0c101b]">
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    {member.badge === "Team Lead" && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#9cbbf8] flex items-center justify-center">
                        <Star className="w-3 h-3 text-[#0c101b]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className={`text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3 ${member.badge === "Team Lead" ? "bg-[#9cbbf8]/10 text-[#9cbbf8] border border-[#9cbbf8]/20" : "bg-[#1e293b] text-[#64748b] border border-[#1e293b]"}`}>
                    {member.badge}
                  </div>
                  <h3 className="text-white font-bold text-base mb-1">{member.name}</h3>
                  <p className="text-[#64748b] text-xs mb-4 leading-relaxed">{member.role}</p>

                  {/* Contact */}
                  <div className="space-y-2 w-full">
                    <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-[#64748b] hover:text-[#9cbbf8] text-xs transition-colors justify-center">
                      <Mail className="w-3 h-3" />{member.email}
                    </a>
                    <div className="flex items-center gap-2 text-[#64748b] text-xs justify-center">
                      <Phone className="w-3 h-3" />{member.phone}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── VISION ───────────────────────────────────────── */}
          <section id="vision">
            <SectionHeader icon={Rocket} tag="Mission" title={(c("pitch_vision").headline as string) || "Our Vision"} />
            <div className="bg-gradient-to-br from-[#131824] via-[#131824] to-[#1a2240] border border-[#1e293b] rounded-3xl p-10 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#9cbbf8]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <p className="text-2xl font-bold text-white leading-relaxed mb-6 relative z-10">
                &ldquo;{c("pitch_vision").body as string}&rdquo;
              </p>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-0.5 bg-[#9cbbf8]" />
                <p className="text-[#9cbbf8] font-semibold text-sm">{c("pitch_vision").mission as string}</p>
              </div>
            </div>
          </section>

          {/* ═══ TECHNICAL DOCS ══════════════════════════════ */}

          {/* Divider */}
          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 h-px bg-[#1e293b]" />
            <div className="flex items-center gap-2 bg-[#131824] border border-[#1e293b] rounded-full px-4 py-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#9cbbf8]" />
              <span className="text-[#9cbbf8] text-xs font-semibold uppercase tracking-widest">Technical Documentation</span>
            </div>
            <div className="flex-1 h-px bg-[#1e293b]" />
          </div>

          {/* ── PRODUCT OVERVIEW ─────────────────────────────── */}
          <section id="product-overview">
            <SectionHeader icon={BookOpen} tag="Overview" title="Product Overview" subtitle={(c("tech_overview").tagline as string)} />
            <p className="text-[#64748b] text-lg leading-relaxed mb-10">{c("tech_overview").description as string}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-[#9cbbf8]" />Target Users</h3>
                <ul className="space-y-2">
                  {((c("tech_overview").targetUsers as string[]) || []).map((u) => (
                    <li key={u} className="flex items-center gap-2 text-[#64748b] text-sm">
                      <Circle className="w-1.5 h-1.5 text-[#9cbbf8] fill-current" />{u}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-[#9cbbf8]" />Core Use Cases</h3>
                <ul className="space-y-2">
                  {((c("tech_overview").coreUseCases as string[]) || []).map((u) => (
                    <li key={u} className="flex items-center gap-2 text-[#64748b] text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />{u}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </section>

          {/* ── FEATURES ─────────────────────────────────────── */}
          <section id="features">
            <SectionHeader icon={Layers} tag="Features" title="Feature Matrix" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-400" />Current Features</h3>
                <div className="space-y-3">
                  {((c("tech_features").current as { name: string; status: string }[]) || []).map((f) => (
                    <div key={f.name} className="flex items-center justify-between bg-[#131824] border border-[#1e293b] rounded-xl px-4 py-3">
                      <span className="text-white text-sm">{f.name}</span>
                      <StatusBadge status={f.status} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm"><Rocket className="w-4 h-4 text-[#9cbbf8]" />Upcoming Features</h3>
                <div className="space-y-3">
                  {((c("tech_features").upcoming as { name: string; status: string }[]) || []).map((f) => (
                    <div key={f.name} className="flex items-center justify-between bg-[#131824] border border-[#1e293b] rounded-xl px-4 py-3">
                      <span className="text-[#64748b] text-sm">{f.name}</span>
                      <StatusBadge status={f.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── ARCHITECTURE ─────────────────────────────────── */}
          <section id="architecture">
            <SectionHeader icon={Server} tag="System Design" title="Architecture Diagram" subtitle="UI → Next.js API layer → dual AI engines → PostgreSQL" />
            <Card className="py-8">
              <ArchitectureDiagram />
            </Card>
          </section>

          {/* ── DATA FLOW ────────────────────────────────────── */}
          <section id="data-flow">
            <SectionHeader icon={GitBranch} tag="Pipeline" title="Data Flow" subtitle="How a user message flows through the system end-to-end" />
            <Card className="py-8">
              <DataFlowDiagram />
            </Card>
          </section>

          {/* ── TECH STACK ───────────────────────────────────── */}
          <section id="tech-stack">
            <SectionHeader icon={Layers} tag="Stack" title="Technology Stack" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { label: "Frontend", color: "#9cbbf8", items: c("tech_stack").frontend as string[] },
                { label: "Backend / API", color: "#4f7ef8", items: c("tech_stack").backend as string[] },
                { label: "AI — SLM", color: "#f59e0b", items: c("tech_stack").ai_slm as string[] },
                { label: "AI — Classifier", color: "#e879f9", items: c("tech_stack").ai_classifier as string[] },
                { label: "Infrastructure", color: "#00b86b", items: c("tech_stack").infra as string[] },
              ].map(({ label, color, items }) => (
                <Card key={label}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color }}>{label}</div>
                  <div className="flex flex-wrap gap-2">
                    {(items || []).map((item) => (
                      <span key={item} className="px-2.5 py-1 bg-[#0c101b] border border-[#1e293b] rounded-lg text-white text-xs font-medium">{item}</span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* ── API DOCS ─────────────────────────────────────── */}
          <section id="api-docs">
            <SectionHeader icon={ExternalLink} tag="Reference" title="API Reference" />
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-4 text-sm flex items-center gap-2"><Globe className="w-4 h-4 text-[#9cbbf8]" />Exposed Endpoints</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1e293b]">
                        {["Method", "Path", "Auth", "Description"].map((h) => (
                          <th key={h} className="text-left py-3 px-3 text-[#64748b] text-xs font-semibold uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {((c("tech_api").exposed as { method: string; path: string; auth: string; desc: string }[]) || []).map((ep) => (
                        <tr key={ep.path} className="border-b border-[#1e293b] hover:bg-[#131824] transition-colors">
                          <td className="py-3 px-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${ep.method === "GET" ? "bg-emerald-400/10 text-emerald-400" : "bg-[#9cbbf8]/10 text-[#9cbbf8]"}`}>{ep.method}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-white text-xs">{ep.path}</td>
                          <td className="py-3 px-3 text-[#64748b] text-xs">{ep.auth}</td>
                          <td className="py-3 px-3 text-[#64748b] text-xs">{ep.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4 text-sm flex items-center gap-2"><Server className="w-4 h-4 text-[#64748b]" />Internal Services</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1e293b]">
                        {["Method", "Endpoint", "Auth", "Description"].map((h) => (
                          <th key={h} className="text-left py-3 px-3 text-[#64748b] text-xs font-semibold uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {((c("tech_api").internal as { method: string; path: string; auth: string; desc: string }[]) || []).map((ep) => (
                        <tr key={ep.path} className="border-b border-[#1e293b] hover:bg-[#131824] transition-colors">
                          <td className="py-3 px-3">
                            <span className="text-xs font-bold px-2 py-0.5 rounded font-mono bg-[#9cbbf8]/10 text-[#9cbbf8]">{ep.method}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[#64748b] text-xs">{ep.path}</td>
                          <td className="py-3 px-3 text-[#64748b] text-xs">{ep.auth}</td>
                          <td className="py-3 px-3 text-[#64748b] text-xs">{ep.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* ── AI LAYER ─────────────────────────────────────── */}
          <section id="ai-layer">
            <SectionHeader icon={Brain} tag="Intelligence" title="AI Layer" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {[
                { key: "slm", label: "ThinkCare SLM", color: "#f59e0b", fields: ["base", "role", "deployment", "latency"] },
                { key: "classifier", label: "Disease Classifier", color: "#e879f9", fields: ["model", "features", "accuracy", "deployment", "latency"] },
              ].map(({ key, label, color, fields }) => {
                const ai = (c("tech_ai")[key] as Record<string, string>) || {};
                return (
                  <Card key={key} className="border-l-2" style={{ borderLeftColor: color }}>
                    <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color }}>{label}</div>
                    <dl className="space-y-3">
                      {fields.map((f) => ai[f] && (
                        <div key={f}>
                          <dt className="text-[#64748b] text-xs capitalize">{f}</dt>
                          <dd className="text-white text-sm mt-0.5">{ai[f]}</dd>
                        </div>
                      ))}
                    </dl>
                  </Card>
                );
              })}
            </div>
            <Card>
              <div className="text-xs font-bold uppercase tracking-widest text-[#9cbbf8] mb-3">Inference Pipeline</div>
              <p className="text-white text-sm leading-relaxed">{c("tech_ai").pipeline as string}</p>
            </Card>
          </section>

          {/* ── SECURITY ─────────────────────────────────────── */}
          <section id="security">
            <SectionHeader icon={Shield} tag="Security" title="Security & Compliance" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: "Authentication", icon: Lock, value: c("tech_security").auth as string },
                { label: "RBAC", icon: Users, value: c("tech_security").rbac as string },
                { label: "Data Protection", icon: Database, value: c("tech_security").data as string },
                { label: "Compliance", icon: Shield, value: c("tech_security").compliance as string },
              ].map(({ label, icon: Icon, value }) => (
                <Card key={label}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4 text-[#9cbbf8]" />
                    <span className="text-white font-semibold text-sm">{label}</span>
                  </div>
                  <p className="text-[#64748b] text-sm leading-relaxed">{value}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* ── ROADMAP ──────────────────────────────────────── */}
          <section id="roadmap">
            <SectionHeader icon={Rocket} tag="Future" title="Product Roadmap" />
            <div className="space-y-4">
              {((c("pitch_gtm").phases as { phase: string; title: string; desc: string }[]) || []).map((phase, i) => (
                <div key={phase.phase} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${i === 0 ? "bg-emerald-400/10 border border-emerald-400/30" : "bg-[#9cbbf8]/10 border border-[#9cbbf8]/20"}`}>
                      <span className={`text-xs font-bold ${i === 0 ? "text-emerald-400" : "text-[#9cbbf8]"}`}>{i + 1}</span>
                    </div>
                    {i < 2 && <div className="w-0.5 flex-1 bg-[#1e293b] my-2" />}
                  </div>
                  <Card className="flex-1 mb-0">
                    <div className={`text-xs font-semibold mb-1 ${i === 0 ? "text-emerald-400" : "text-[#9cbbf8]"}`}>{phase.phase}</div>
                    <div className="text-white font-bold mb-1">{phase.title}</div>
                    <div className="text-[#64748b] text-sm">{phase.desc}</div>
                  </Card>
                </div>
              ))}
            </div>
          </section>

          {/* ── CHANGELOG ────────────────────────────────────── */}
          <section id="changelog">
            <SectionHeader icon={GitBranch} tag="History" title="Changelog" />
            <div className="space-y-4">
              {((c("changelog").versions as { version: string; date: string; notes: string }[]) || []).map((v) => (
                <Card key={v.version}>
                  <div className="flex items-start gap-4">
                    <div className="bg-[#9cbbf8]/10 border border-[#9cbbf8]/20 rounded-lg px-3 py-1.5 flex-shrink-0">
                      <span className="text-[#9cbbf8] text-xs font-bold font-mono">{v.version}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-[#64748b] text-xs mb-1">{v.date}</div>
                      <p className="text-white text-sm leading-relaxed">{v.notes}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-[#1e293b] text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9cbbf8] to-[#4f7ef8] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-white font-bold">ThinkCare AI</span>
              </div>
              <p className="text-[#64748b] text-xs">
                Confidential · Hackathon Submission 2026 · ThinkCare AI Team
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
