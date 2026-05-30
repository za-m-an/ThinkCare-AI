"use client";

import React, { useEffect, useState, useRef, useCallback, Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Send,
  Bot,
  User as UserIcon,
  Loader2,
  Sparkles,
  AlertTriangle,
  Thermometer,
  MessageSquare,
  Trash2,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen
} from "lucide-react";

interface Message {
  sender: "user" | "ai";
  text: string;
}

// Simple markdown parsing helper for bold, italic, and bullet lists
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  
  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
    const cleanLine = isBullet ? line.replace(/^\s*[-*]\s+/, "") : line;
    
    const parts: React.ReactNode[] = [];
    let currentIdx = 0;
    
    const formatRegex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
    let match;
    
    while ((match = formatRegex.exec(cleanLine)) !== null) {
      const matchIndex = match.index;
      
      if (matchIndex > currentIdx) {
        parts.push(cleanLine.substring(currentIdx, matchIndex));
      }
      
      if (match[2]) {
        parts.push(
          <strong key={matchIndex} className="font-extrabold text-white">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        parts.push(
          <em key={matchIndex} className="italic text-slate-300">
            {match[3]}
          </em>
        );
      }
      
      currentIdx = formatRegex.lastIndex;
    }
    
    if (currentIdx < cleanLine.length) {
      parts.push(cleanLine.substring(currentIdx));
    }
    
    if (isBullet) {
      return (
        <li key={lineIdx} className="list-disc ml-5 mb-1 text-slate-200">
          {parts}
        </li>
      );
    }
    
    return (
      <p key={lineIdx} className="mb-1.5 last:mb-0">
        {parts}
      </p>
    );
  });
}

interface Prediction {
  condition: string;
  likelihood: number;
}

interface ChatSessionItem {
  id: number;
  uuid: string;
  title: string;
  createdAt: string;
}

function ChatPageContent() {
  const { language, t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);

  // Session management
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Navigation & Search Params
  const searchParams = useSearchParams();
  const router = useRouter();

  // Panel collapse states
  const [sessionsOpen, setSessionsOpen] = useState(true);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(true);

  // Predictions states
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [topCondition, setTopCondition] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [precautions, setPrecautions] = useState<string[]>([]);
  const [aftermaths, setAftermaths] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    t("chat", "chip1"),
    t("chat", "chip2"),
    t("chat", "chip3"),
    t("chat", "chip4")
  ];

  const welcomeMessage: Message = {
    sender: "ai",
    text: t("chat", "welcomeMessage")
  };

  // Load user on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  // Handle new assessment route parameters
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      handleNewSession();
      // Clear parameter to avoid infinite trigger on subsequent inputs
      router.replace("/chat");
    }
  }, [searchParams, router]);

  // Load sessions list
  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/chat/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Failed to load sessions", err);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && currentUser) {
      fetchSessions();
    }
  }, [loading, currentUser, fetchSessions]);

  // Load a specific session's messages
  const loadSession = useCallback(async (uuid: string) => {
    setActiveSessionId(uuid);
    setPredictions([]);
    setTopCondition(null);
    setConfidence(null);
    setRequestId(null);
    setPrecautions([]);
    setAftermaths(null);

    try {
      const res = await fetch(`/api/chat/sessions/${uuid}`);
      if (res.ok) {
        const data = await res.json();
        const sessionMessages: Message[] = data.session.messages.map((m: any) => ({
          sender: m.sender as "user" | "ai",
          text: m.text,
        }));

        if (sessionMessages.length === 0) {
          setMessages([welcomeMessage]);
        } else {
          setMessages([welcomeMessage, ...sessionMessages]);
        }
      }
    } catch (err) {
      console.error("Failed to load session", err);
      setMessages([welcomeMessage]);
    }
  }, []);

  // Start new session
  const handleNewSession = async () => {
    setActiveSessionId(null);
    setMessages([welcomeMessage]);
    setPredictions([]);
    setTopCondition(null);
    setConfidence(null);
    setRequestId(null);
    setPrecautions([]);
    setAftermaths(null);
  };

  // Delete a session
  const handleDeleteSession = async (uuid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chat/sessions/${uuid}`, { method: "DELETE" });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.uuid !== uuid));
        if (activeSessionId === uuid) {
          handleNewSession();
        }
      }
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || sending) return;

    const userMsg = textToSend;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          sessionId: activeSessionId,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to query assistant");
      }

      setMessages((prev) => [...prev, { sender: "ai", text: data.response }]);

      // If a new session was created server-side, track its id
      if (data.sessionId && data.sessionId !== activeSessionId) {
        setActiveSessionId(data.sessionId);
        fetchSessions();
      }

      if (data.predictions && data.predictions.length > 0) {
        setPredictions(data.predictions.slice(0, 5));
        setTopCondition(data.topCondition);
        setConfidence(data.confidence);
        setRequestId(data.requestId);
        setPrecautions(data.precautions || []);
        setAftermaths(data.aftermaths || null);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: `Error: ${err.message}. Please check if the FastAPI AI server is running.` }
      ]);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c101b] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0c101b] text-white font-sans">
      <Sidebar activeTab="chat" userRole={currentUser?.role} />

      <div className="flex-1 flex h-screen relative">

        {/* ═══ LEFT: Sessions Panel (collapsible) ═══ */}
        <div
          className={`bg-[#0a0e17] border-r border-[#1e293b]/50 flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
            sessionsOpen ? "w-60" : "w-0"
          }`}
        >
          <div className="w-60 flex flex-col h-full">
            {/* Sessions header */}
            <div className="px-4 pt-4 pb-3 border-b border-[#1e293b]/50 flex items-center justify-between">
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block">
                {t("chat", "recentSessions")}
              </span>
              <button
                onClick={() => setSessionsOpen(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-900/50 transition-colors cursor-pointer"
                title="Collapse sessions"
              >
                <PanelLeftClose className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Sessions list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1" style={{ maxHeight: "calc(100vh - 52px)" }}>
              {loadingSessions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center text-[10px] text-slate-500 py-8 px-4 leading-relaxed">
                  {t("chat", "noSessions")}
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.uuid}
                    onClick={() => loadSession(session.uuid)}
                    className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all group cursor-pointer ${
                      activeSessionId === session.uuid
                        ? "bg-[#131824] text-blue-400 border border-blue-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent"
                    }`}
                  >
                    <MessageSquare className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${activeSessionId === session.uuid ? "text-blue-400" : "text-slate-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate leading-tight">{session.title}</p>
                      <span className="text-[9px] text-slate-500 flex items-center gap-1 mt-1 font-sans">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(session.createdAt).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(session.uuid, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-0.5 rounded cursor-pointer"
                      title="Delete session"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ═══ CENTER: Chat Thread ═══ */}
        <div className="flex-1 flex flex-col h-full min-w-0 relative">
          {/* Floating trigger button to open sessions when collapsed */}
          {!sessionsOpen && (
            <button
              onClick={() => setSessionsOpen(true)}
              className="absolute left-0 top-6 z-30 bg-[#0a0e17] border-y border-r border-[#1e293b]/50 text-slate-400 hover:text-white px-1.5 py-4 rounded-r-xl shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="Show recent sessions"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}

          {/* Floating trigger button to open diagnostics when collapsed */}
          {!diagnosticsOpen && (
            <button
              type="button"
              onClick={() => setDiagnosticsOpen(true)}
              className="absolute right-0 top-6 z-30 bg-[#131824] border-y border-l border-[#1e293b]/50 text-slate-400 hover:text-white px-1.5 py-4 rounded-l-xl shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="Show live diagnostics"
            >
              <PanelRightOpen className="h-4 w-4" />
            </button>
          )}

          {/* Header */}
          <header className="border-b border-[#1e293b]/50 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2 font-sans">
                  <Bot className="h-5 w-5 text-blue-400" />
                  {t("chat", "headerTitle")}
                </h1>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-sans">
                  {t("chat", "headerSubtitle")}
                </p>
              </div>
            </div>
          </header>

          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/10">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 max-w-2xl ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`h-9 w-9 rounded-full shrink-0 flex items-center justify-center border font-bold text-xs ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-[#131824] text-blue-400 border-[#2e3e56]"
                  }`}
                >
                  {msg.sender === "user" ? <UserIcon className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
                </div>
                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
                      : "bg-[#131824] text-slate-200 border border-[#1e293b]"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <p className="whitespace-pre-line">{msg.text}</p>
                  ) : (
                    <div className="space-y-1">{renderMarkdown(msg.text)}</div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-4 max-w-2xl mr-auto">
                <div className="h-9 w-9 rounded-full bg-[#131824] text-blue-400 border border-[#2e3e56] flex items-center justify-center font-bold">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="bg-[#131824] rounded-2xl p-4 border border-[#1e293b] flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  {t("chat", "analyzing")}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions area */}
          {messages.length <= 1 && (
            <div className="px-6 py-3 bg-[#0c101b] border-t border-[#1e293b]/20">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-2">{t("chat", "trySample")}</span>
              <div className="flex flex-wrap gap-2">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip)}
                    className="px-3.5 py-2 rounded-full border border-[#2e3e56] hover:border-slate-400 bg-transparent text-slate-400 hover:text-slate-200 text-[10px] font-semibold transition-all text-left cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input form */}
          <div className="p-6 bg-[#0c101b] border-t border-[#1e293b]/50 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="flex gap-3"
            >
              <input
                type="text"
                disabled={sending}
                className="flex-1 rounded-xl border border-[#2e3e56] bg-[#131824] px-4 py-3.5 text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none transition-colors text-xs"
                placeholder={t("chat", "inputPlaceholder")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className={`flex items-center justify-center rounded-xl px-5 transition-colors ${
                  input.trim() && !sending
                    ? "bg-[#9cbbf8] hover:bg-[#82a5f5] text-slate-950 cursor-pointer shadow-lg shadow-blue-500/15"
                    : "bg-[#1e293b] text-slate-500 cursor-not-allowed"
                }`}
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        </div>

        {/* ═══ RIGHT: Live Diagnostics Panel (collapsible) ═══ */}
        <div
          className={`bg-[#131824] border-l border-[#1e293b]/50 flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
            diagnosticsOpen ? "w-80" : "w-0 border-l-0"
          }`}
        >
          <div className="w-80 p-6 flex flex-col h-full overflow-y-auto">
            <div className="border-b border-[#1e293b]/50 pb-4 mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-blue-400" />
                  {t("chat", "liveDiagnosis")}
                </h3>
                <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                  {t("chat", "proprietaryClassifier")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDiagnosticsOpen(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-955/50 transition-colors cursor-pointer ml-2 shrink-0"
                title="Collapse diagnostics"
              >
                <PanelRightClose className="h-3.5 w-3.5" />
              </button>
            </div>

            {topCondition ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Top Prediction Card */}
                  <div className="bg-[#0c101b] rounded-xl border border-[#1e293b] p-5 relative overflow-hidden">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">{t("chat", "topPredictedDisease")}</span>
                    <h4 className="text-lg font-bold text-blue-400 mt-2">{topCondition}</h4>

                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="text-4xl font-extrabold text-slate-100">{confidence}</span>
                      <span className="text-slate-500 text-xs">{t("chat", "likelihood")}</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1e293b]/30 flex justify-between text-[9px] text-slate-500 font-semibold uppercase tracking-wide">
                      <span>{t("chat", "statusLogged")}</span>
                      <span>{requestId}</span>
                    </div>
                  </div>

                  {/* Precautions & Aftermaths */}
                  {precautions.length > 0 && (
                    <div className="bg-[#0c101b] rounded-xl border border-[#1e293b] p-5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2.5">{t("chat", "recommendedPrecautions")}</span>
                      <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-slate-300">
                        {precautions.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aftermaths && (
                    <div className="bg-[#0c101b] rounded-xl border border-[#1e293b] p-5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">{t("chat", "outlookAftermath")}</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{aftermaths}</p>
                    </div>
                  )}

                  {/* Score list */}
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3.5">{t("chat", "alternativeMatches")}</h5>
                    <div className="space-y-4">
                      {predictions.map((pred, index) => (
                        <div key={index} className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-semibold text-slate-300">
                            <span>{pred.condition}</span>
                            <span>{pred.likelihood}%</span>
                          </div>
                          <div className="w-full bg-[#0c101b] h-1.5 rounded-full overflow-hidden border border-[#1e293b]">
                            <div
                                style={{ width: `${pred.likelihood}%` }}
                                className="bg-blue-500 h-full rounded-full"
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Disclaimer badge */}
                <div className="pt-6 border-t border-[#1e293b]/40 text-[9px] text-slate-500 leading-normal flex gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-yellow-600 shrink-0 mt-0.5" />
                  <span>
                    {t("chat", "predictionDisclaimer")}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 px-4">
                <Thermometer className="h-10 w-10 text-[#2e3e56] mb-4 animate-pulse" />
                <h4 className="text-xs font-bold text-slate-400">{t("chat", "noAssessmentActive")}</h4>
                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                  {t("chat", "noAssessmentDesc")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DesktopChatPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0c101b] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
