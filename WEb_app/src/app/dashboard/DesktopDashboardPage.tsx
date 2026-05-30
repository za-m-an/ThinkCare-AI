"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import Sidebar from "@/components/Sidebar";
import {
  Heart,
  Droplet,
  Wind,
  ArrowUp,
  Bell,
  Sparkles,
  Loader2,
  User,
  Settings,
  LogOut,
  ChevronDown,
  X,
  Activity,
  Award
} from "lucide-react";

interface Notification {
  id: number;
  text: string;
  unread: boolean;
}

export default function DesktopDashboardPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Vitals states (wearable integration disabled)
  const [healthScore, setHealthScore] = useState(95);

  // Clinical Analytics states
  const [medications, setMedications] = useState<string[]>([]);
  const [precautions, setPrecautions] = useState<string[]>([]);
  const [riskProbability, setRiskProbability] = useState<Array<{ condition: string; probability: number }>>([]);
  const [scoreHistory, setScoreHistory] = useState<number[]>([100, 100, 100, 100, 100, 100, 100]);

  // Interactivity states
  const [trendType, setTrendType] = useState<"week" | "month">("week");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState("Clinical engine analyzing onboarding data to formulate personalized insights...");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Click outside references
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();
        if (userRes.ok) {
          setCurrentUser(userData.user);

          if (!userData.user.isOnboarded) {
            router.push("/onboarding");
            return;
          }

          // Fetch onboarding data
          const onboardingRes = await fetch("/api/onboarding");
          const onboardingData = await onboardingRes.json();
          if (onboardingRes.ok && onboardingData.onboarding) {
            const ob = onboardingData.onboarding;
            setOnboardingData(ob);
            // Dynamic notifications will be loaded from insightRes below
          }

          // Fetch dynamic AI analytics
          try {
            const insightRes = await fetch(`/api/dashboard/insight?lang=${language}`);
            if (insightRes.ok) {
              const data = await insightRes.json();
              setAiInsight(data.insight);
              setHealthScore(data.healthScore || 95);
              setScoreHistory(data.scoreHistory || [100, 100, 100, 100, 100, 100, 100]);
              setMedications(data.medications || []);
              setPrecautions(data.precautions || []);
              setRiskProbability(data.riskProbability || []);
              if (data.notifications) {
                setNotifications(data.notifications);
              }
            }
          } catch (insightErr) {
            console.error("Failed to load AI health insight", insightErr);
          }

        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router, language]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleDismissNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const getStepsData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const todayDay = new Date().getDay();
    const todayIndex = todayDay === 0 ? 6 : todayDay - 1; // Mon=0, Sun=6
    
    return days.map((day, idx) => {
      const scoreVal = scoreHistory[idx] !== undefined ? scoreHistory[idx] : 100;
      return {
        label: day,
        steps: scoreVal, // Mapping to steps to reuse existing flex-rendering properties
        active: idx === todayIndex
      };
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c101b] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" };
  const currentDateString = new Date().toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", options);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return t("dashboard", "goodMorning");
    if (hours < 18) return t("dashboard", "goodAfternoon");
    return t("dashboard", "goodEvening");
  };

  const stepsData = getStepsData();
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="flex min-h-screen bg-[#0c101b] text-white font-sans">
      <Sidebar activeTab="dashboard" userRole="USER" />

      {/* Main dashboard content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Top header bar */}
        <header className="flex items-center justify-between border-b border-[#1e293b]/50 px-8 py-5 shrink-0 z-10 bg-[#0c101b]/80 backdrop-blur sticky top-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-sans">
              {getGreeting()}, {currentUser?.fullName ? currentUser.fullName.split(" ")[0] : "Alex"}.
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              {t("dashboard", "dailySummary")} {currentDateString}.
            </p>
          </div>
          <div className="flex items-center gap-4 relative">
            
            {/* Notification Bell with Badge */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl border border-[#2e3e56] hover:bg-[#1e293b]/50 text-slate-300 relative transition-all cursor-pointer hover:border-slate-500 active:scale-95"
                title={t("common", "notifications")}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-blue-500 border border-[#0c101b] text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Card */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-[#1e293b] bg-[#131824]/95 backdrop-blur-xl p-4 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-[#1e293b]/50 pb-2 mb-3">
                    <span className="text-xs font-bold text-slate-200 font-sans">{t("common", "notifications")}</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider cursor-pointer"
                      >
                        {t("common", "markAllRead")}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-[10px] text-slate-500 py-6 font-sans">{t("common", "noNotifications")}</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-3 rounded-xl border border-[#1e293b]/40 text-[11px] leading-relaxed flex items-start gap-2.5 relative transition-all ${
                            n.unread ? "bg-blue-500/5 text-slate-200 border-blue-500/20" : "bg-[#0c101b]/40 text-slate-400"
                          }`}
                        >
                          <div className="flex-1 font-sans">{n.text}</div>
                          <button 
                            onClick={(e) => handleDismissNotification(n.id, e)}
                            className="text-slate-500 hover:text-red-400 transition-colors p-0.5 rounded cursor-pointer shrink-0 mt-0.5"
                            title="Dismiss"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Trigger */}
            <div className="relative" ref={profileMenuRef}>
              <div 
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-[#131824] border border-[#2e3e56] hover:border-blue-400 transition-all cursor-pointer select-none active:scale-[0.98]"
              >
                <div className="h-7 w-7 rounded-full bg-slate-800 border border-[#2e3e56] flex items-center justify-center text-blue-400 font-bold text-xs">
                  {currentUser?.fullName ? currentUser.fullName.charAt(0) : "U"}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </div>

              {/* Profile Context Dropdown */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-[#1e293b] bg-[#131824]/95 backdrop-blur-xl p-4 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-3 border-b border-[#1e293b]/50 pb-3.5 mb-3">
                    <div className="h-10 w-10 rounded-full bg-slate-800 border border-[#2e3e56] flex items-center justify-center text-blue-400 font-extrabold text-sm shrink-0">
                      {currentUser?.fullName ? currentUser.fullName.charAt(0) : "U"}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-200 truncate font-sans">{currentUser?.fullName}</p>
                      <span className="text-[10px] text-slate-500 font-semibold block truncate uppercase tracking-widest font-sans mt-0.5">{currentUser?.role}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <button 
                      onClick={() => { router.push("/dashboard"); setProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-blue-400 hover:bg-[#0c101b]/60 transition-colors text-left cursor-pointer font-sans"
                    >
                      <Activity className="h-4 w-4 shrink-0" />
                      {t("dashboard", "myHealthDashboard")}
                    </button>
                    <button 
                      onClick={() => { router.push("/profile"); setProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-blue-400 hover:bg-[#0c101b]/60 transition-colors text-left cursor-pointer font-sans"
                    >
                      <User className="h-4 w-4 shrink-0" />
                      {t("dashboard", "profileReports")}
                    </button>
                    <button 
                      onClick={() => { router.push("/settings"); setProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-blue-400 hover:bg-[#0c101b]/60 transition-colors text-left cursor-pointer font-sans"
                    >
                      <Settings className="h-4 w-4 shrink-0" />
                      {t("nav", "settings")}
                    </button>
                    
                    <div className="border-t border-[#1e293b]/40 my-2 pt-1" />
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-955/10 transition-colors text-left cursor-pointer font-sans"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      {t("dashboard", "logOut")}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Dashboard Grid Content */}
        <div className="p-8 space-y-6">
          
          {/* Top row cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Health Score Card */}
            <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">{t("dashboard", "overallHealthScore")}</span>
                <div className="h-8 w-8 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center">
                  <Award className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="my-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-black text-green-400 tracking-tight font-sans">{healthScore.toLocaleString(language === "bn" ? "bn-BD" : "en-US")}</span>
                  <span className="text-slate-500 text-sm font-semibold">/ {language === "bn" ? "১০০" : "100"}</span>
                </div>
                <p className="text-xs text-green-400 font-bold flex items-center mt-2.5 font-sans">
                  <ArrowUp className="h-3.5 w-3.5 mr-1" />
                  {t("dashboard", "pointsSinceLastWeek")}
                </p>
              </div>
              <div className="border-t border-[#1e293b]/50 pt-4 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">{t("dashboard", "statusOptimal")}</span>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="lg:col-span-2 bg-[#131824] rounded-2xl border border-[#1e293b] p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-[#1e293b]/50 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-sans">{t("dashboard", "aiHealthInsight")}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold tracking-wide flex items-center gap-1.5 font-sans">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
                  {t("dashboard", "highConfidence")}
                </span>
              </div>

              <div className="my-5 relative flex items-start gap-4">
                <span className="text-5xl font-serif text-slate-600 leading-none select-none">“</span>
                <p className="text-xs text-slate-300 leading-relaxed pt-2 font-sans">
                  {aiInsight}
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider font-sans">
                <span>{t("dashboard", "generatedFrom")}</span>
                <button
                  onClick={() => router.push("/chat")}
                  className="flex items-center gap-1.5 text-blue-400 hover:text-blue-500 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {t("dashboard", "discussInsight")}
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Medications, Precautions, and Risk Probability Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Medications Panel */}
            <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-6 shadow-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-sans">
                {language === "bn" ? "ওষুধ ও নির্দেশনা" : "Medication & Guidelines"}
              </span>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pt-1">
                {medications.length === 0 ? (
                  <p className="text-xs text-slate-500 font-sans leading-normal">
                    {language === "bn" ? "কোনো ওষুধ সুপারিশ করা হয়নি।" : "No medications active or discussed."}
                  </p>
                ) : (
                  medications.map((med, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 px-3.5 py-2.5 bg-blue-500/5 border border-blue-500/10 rounded-xl text-xs text-slate-300 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                      <span className="truncate">{med}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Precautions Panel */}
            <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-6 shadow-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-sans">
                {language === "bn" ? "প্রয়োজনীয় সতর্কতা" : "Clinical Precautions"}
              </span>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pt-1">
                {precautions.length === 0 ? (
                  <p className="text-xs text-slate-500 font-sans leading-normal">
                    {language === "bn" ? "কোনো সতর্কতা নেই।" : "No critical active warnings."}
                  </p>
                ) : (
                  precautions.map((prec, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 px-3.5 py-2.5 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-xs text-slate-300 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0 mt-1.5"></span>
                      <span>{prec}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Risk Probability Panel */}
            <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-6 shadow-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-sans">
                {language === "bn" ? "রোগের ঝুঁকির সম্ভাবনা" : "Clinical Risk Assessment"}
              </span>
              <div className="space-y-3.5 max-h-48 overflow-y-auto pt-1">
                {riskProbability.length === 0 ? (
                  <p className="text-xs text-slate-500 font-sans leading-normal">
                    {language === "bn" ? "কোনো ঝুঁকি চিহ্নিত করা হয়নি।" : "No specific risks detected."}
                  </p>
                ) : (
                  riskProbability.map((risk, idx) => (
                    <div key={idx} className="space-y-1.5 font-sans">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300 truncate max-w-[70%]">{risk.condition}</span>
                        <span className="text-blue-400 font-bold">{risk.probability}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0c101b] rounded-full overflow-hidden border border-[#1e293b]/40">
                        <div 
                          style={{ width: `${risk.probability}%` }}
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Health Score Trend Chart */}
          <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-200 font-sans">
                  {language === "bn" ? "স্বাস্থ্য স্কোরের প্রবণতা" : "Physiological Health Score Trend"}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal font-sans">
                  {language === "bn"
                    ? "সাপ্তাহিক উপসর্গ বিশ্লেষণ এবং ক্লিনিক্যাল স্ট্যাটাস ট্র্যাক"
                    : "Weekly clinical symptom analysis and wellness tracking status"}
                </p>
              </div>
            </div>

            {/* Custom Bar Chart using CSS Flexbox */}
            <div className="pt-6">
              <div className="flex items-end justify-between h-48 border-b border-[#1e293b] pb-2 px-4 relative">
                <div className="absolute left-0 right-0 border-t border-[#1e293b]/50 top-[0%] pointer-events-none">
                  <span className="absolute -top-3 left-0 text-[8px] font-bold tracking-widest text-slate-600 font-sans">100%</span>
                </div>
                <div className="absolute left-0 right-0 border-t border-[#1e293b]/50 top-[50%] pointer-events-none">
                  <span className="absolute -top-3 left-0 text-[8px] font-bold tracking-widest text-slate-600 font-sans">50%</span>
                </div>
                <span className="absolute bottom-2 left-0 text-[8px] font-bold tracking-widest text-slate-600 font-sans">0%</span>

                {stepsData.map((d, index) => {
                  const percentageHeight = d.steps; // steps holds scoreVal (0-100)
                  return (
                    <div 
                      key={index} 
                      className="flex flex-col justify-end items-center h-full group z-10 w-12"
                    >
                      <span className="text-[10px] font-bold text-slate-200 bg-slate-950 px-2 py-1 rounded border border-[#2e3e56] opacity-0 group-hover:opacity-100 transition-opacity mb-2 select-none pointer-events-none absolute -translate-y-8 shadow-xl z-50 whitespace-nowrap font-sans">
                        {d.label}: {d.steps.toLocaleString(language === "bn" ? "bn-BD" : "en-US")}%
                      </span>
                      <div
                        style={{ height: `${percentageHeight}%` }}
                        className={`w-full rounded-md transition-all duration-500 cursor-pointer ${
                          d.active
                            ? "bg-blue-500 shadow-md shadow-blue-500/20 hover:bg-blue-400"
                            : "bg-slate-700/60 hover:bg-slate-600"
                        }`}
                      ></div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between px-4 pt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">
                {stepsData.map((d, idx) => (
                  <span key={idx} className={`w-12 text-center ${d.active ? "text-blue-400 font-extrabold" : ""}`}>
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="p-4 rounded-xl bg-slate-900/10 border border-[#1e293b]/30 text-xs text-slate-500 leading-normal flex items-start gap-3">
            <svg className="h-4.5 w-4.5 text-slate-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-sans">
              {t("common", "disclaimer")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
