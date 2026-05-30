"use client";

import React, { useEffect, useState, useRef, useCallback, Suspense } from "react";
import MobileNavBar from "@/components/MobileNavBar";
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
  X,
  History,
  Activity
} from "lucide-react";

interface Message {
  sender: "user" | "ai";
  text: string;
}

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
        <li key={lineIdx} className="list-disc ml-4 mb-1 text-slate-200">
          {parts}
        </li>
      );
    }
    
    return (
      <p key={lineIdx} className="mb-1 last:mb-0">
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

function MobileChatContent() {
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

  // Mobile sheets state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);

  // Predictions states
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [topCondition, setTopCondition] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [precautions, setPrecautions] = useState<string[]>([]);
  const [aftermaths, setAftermaths] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const welcomeMessage: Message = {
    sender: "ai",
    text: t("chat", "welcomeMessageMobile")
  };

  const suggestionChips = [
    t("chat", "chip1"),
    t("chat", "chip2"),
    t("chat", "chip3"),
    t("chat", "chip4")
  ];

  // Load user
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

  // Handle new assessment parameters
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      handleNewSession();
      router.replace("/chat");
    }
  }, [searchParams, router]);

  // Fetch sessions list
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

  // Load a session
  const loadSession = useCallback(async (uuid: string) => {
    setActiveSessionId(uuid);
    setHistoryOpen(false);
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
        const sessionMessages = data.session.messages.map((m: any) => ({
          sender: m.sender,
          text: m.text,
        }));
        setMessages(sessionMessages.length === 0 ? [welcomeMessage] : [welcomeMessage, ...sessionMessages]);
      }
    } catch (err) {
      console.error("Failed to load session", err);
      setMessages([welcomeMessage]);
    }
  }, []);

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
      if (!response.ok) throw new Error(data.error || "Query failed");
      setMessages((prev) => [...prev, { sender: "ai", text: data.response }]);

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
        // Automatically slide in diagnostics on phone after a result is returned
        setDiagnosticsOpen(true);
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, { sender: "ai", text: `Error: ${err.message}` }]);
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
    <div className="flex min-h-screen flex-col bg-[#0c101b] text-white font-sans pb-[68px]">
      {/* Mobile Top Bar */}
      <header className="border-b border-[#1e293b]/50 px-5 py-4 flex items-center justify-between bg-[#0c101b]/90 backdrop-blur sticky top-0 z-40 shrink-0">
        <button
          onClick={() => {
            setHistoryOpen(true);
            setDiagnosticsOpen(false);
          }}
          className="p-2 rounded-xl border border-[#2e3e56] text-slate-300 active:scale-95"
          title="Session history"
        >
          <History className="h-4.5 w-4.5" />
        </button>

        <div className="text-center">
          <h1 className="text-sm font-extrabold tracking-tight text-slate-100 flex items-center justify-center gap-1.5 font-sans">
            <Bot className="h-4.5 w-4.5 text-blue-400" />
            {t("chat", "headerTitleMobile")}
          </h1>
        </div>

        <button
          onClick={() => {
            setDiagnosticsOpen(true);
            setHistoryOpen(false);
          }}
          className={`p-2 rounded-xl border border-[#2e3e56] text-slate-300 active:scale-95 relative ${topCondition ? "border-blue-500/50 bg-blue-500/5" : ""}`}
          title="Diagnostics panel"
        >
          <Sparkles className="h-4.5 w-4.5 text-blue-400" />
          {topCondition && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>
          )}
        </button>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/10">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-[90%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            <div
              className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center border font-bold text-[10px] ${
                msg.sender === "user" ? "bg-blue-600 text-white border-blue-500" : "bg-[#131824] text-blue-400 border-[#2e3e56]"
              }`}
            >
              {msg.sender === "user" ? <UserIcon className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div
              className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.sender === "user" ? "bg-blue-600 text-white" : "bg-[#131824] text-slate-200 border border-[#1e293b]"
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
          <div className="flex gap-3 max-w-[90%] mr-auto">
            <div className="h-7 w-7 rounded-full bg-[#131824] text-blue-400 border border-[#2e3e56] flex items-center justify-center font-bold">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="bg-[#131824] rounded-2xl p-3 border border-[#1e293b] flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
              {t("chat", "analyzingMobile")}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions Chips */}
      {messages.length <= 1 && (
        <div className="px-4 py-3 bg-[#0c101b] border-t border-[#1e293b]/20 shrink-0">
          <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block mb-2">{t("chat", "trySampleMobile")}</span>
          <div className="flex flex-col gap-1.5">
            {suggestionChips.slice(0, 3).map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="px-3.5 py-2.5 rounded-xl border border-[#2e3e56] bg-transparent text-slate-400 active:text-slate-200 text-[10px] font-semibold transition-all text-left cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form at Bottom */}
      <div className="p-4 bg-[#0c101b] border-t border-[#1e293b]/50 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            disabled={sending}
            className="flex-1 rounded-xl border border-[#2e3e56] bg-[#131824] px-4.5 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 text-xs"
            placeholder={t("chat", "inputPlaceholderMobile")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className={`flex items-center justify-center rounded-xl px-4.5 transition-colors ${
              input.trim() && !sending ? "bg-blue-500 text-white cursor-pointer" : "bg-[#1e293b] text-slate-500"
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* ═══ SLIDING SHEET 1: Recent Sessions (History) ═══ */}
      {historyOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300 animate-in fade-in">
          <div className="fixed bottom-0 left-0 right-0 max-h-[80vh] rounded-t-3xl border-t border-[#1e293b] bg-[#131824] p-5 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center pb-3 border-b border-[#1e293b]/50">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <History className="h-4.5 w-4.5 text-blue-400" />
                {t("chat", "selectSession")}
              </h3>
              <button
                onClick={() => setHistoryOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-200 bg-slate-900/50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2 max-h-[50vh]">
              <button
                onClick={() => {
                  handleNewSession();
                  setHistoryOpen(false);
                }}
                className="w-full text-left py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs text-center"
              >
                {t("chat", "startNewAssessment")}
              </button>
              {loadingSessions ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-6">{t("chat", "noSessionsMobile")}</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.uuid}
                    onClick={() => loadSession(session.uuid)}
                    className={`flex items-start justify-between px-4 py-3 rounded-xl text-xs transition-all ${
                      activeSessionId === session.uuid ? "bg-[#0c101b] text-blue-400 border border-blue-500/20" : "text-slate-400 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                      <MessageSquare className="h-4 w-4 shrink-0 text-slate-500" />
                      <span className="font-bold truncate">{session.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(session.uuid, e)}
                      className="text-slate-500 hover:text-red-400 p-0.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ SLIDING SHEET 2: Diagnostics Report ═══ */}
      {diagnosticsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300 animate-in fade-in">
          <div className="fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl border-t border-[#1e293b] bg-[#131824] p-5 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center pb-3 border-b border-[#1e293b]/50">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-blue-400" />
                  {t("chat", "clinicalPredictions")}
                </h3>
              </div>
              <button
                onClick={() => setDiagnosticsOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-200 bg-slate-900/50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-5 max-h-[65vh]">
              {topCondition ? (
                <>
                  <div className="bg-[#0c101b] rounded-2xl border border-[#1e293b] p-4">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">{t("chat", "topCondition")}</span>
                    <h4 className="text-base font-extrabold text-blue-400 mt-1">{topCondition}</h4>
                    <div className="flex items-baseline gap-1 mt-2.5">
                      <span className="text-3xl font-black text-slate-100">{confidence}</span>
                      <span className="text-slate-500 text-xs font-semibold">{t("chat", "likelihood")}</span>
                    </div>
                  </div>

                  {precautions.length > 0 && (
                    <div className="bg-[#0c101b] rounded-2xl border border-[#1e293b] p-4">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">{t("chat", "precautions")}</span>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-slate-300">
                        {precautions.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aftermaths && (
                    <div className="bg-[#0c101b] rounded-2xl border border-[#1e293b] p-4">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">{t("chat", "outlook")}</span>
                      <p className="text-xs text-slate-300 leading-relaxed">{aftermaths}</p>
                    </div>
                  )}

                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3.5">{t("chat", "alternativeMatches")}</h5>
                    <div className="space-y-3.5">
                      {predictions.map((pred, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400">
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

                  <div className="pt-4 border-t border-[#1e293b]/40 text-[9px] text-slate-500 leading-normal flex gap-2">
                    <AlertTriangle className="h-4.5 w-4.5 text-yellow-600 shrink-0" />
                    <span>{t("chat", "predictionDisclaimerMobile")}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <Thermometer className="h-8 w-8 text-slate-600 mx-auto mb-3 animate-pulse" />
                  <p className="text-xs text-slate-400">{t("chat", "noAssessmentActive")}</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
                    {t("chat", "noAssessmentDescMobile")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tab Bar */}
      <MobileNavBar />
    </div>
  );
}

export default function MobileChatPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0c101b] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    }>
      <MobileChatContent />
    </Suspense>
  );
}
