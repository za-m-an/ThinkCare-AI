"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import MobileNavBar from "@/components/MobileNavBar";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Heart,
  Droplet,
  Wind,
  Bell,
  Sparkles,
  Loader2,
  X,
  Activity,
  Award,
  ChevronDown
} from "lucide-react";

interface Notification {
  id: number;
  text: string;
  unread: boolean;
}

export default function MobileDashboardPage() {
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

  // States
  const [trendType, setTrendType] = useState<"week" | "month">("week");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState("Clinical engine analyzing onboarding data to formulate insights...");
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

          // Fetch onboarding
          const onboardingRes = await fetch("/api/onboarding");
          const onboardingData = await onboardingRes.json();
          if (onboardingRes.ok && onboardingData.onboarding) {
            const ob = onboardingData.onboarding;
            setOnboardingData(ob);

            // Dynamic notifications will be loaded from insightRes below
          }

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
          } catch (err) {
            console.error(err);
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router, language]);

  const handleDismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const getStepsData = () => {
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const todayDay = new Date().getDay();
    const todayIndex = todayDay === 0 ? 6 : todayDay - 1;
    
    return days.map((day, idx) => {
      const scoreVal = scoreHistory[idx] !== undefined ? scoreHistory[idx] : 100;
      return { label: day, steps: scoreVal, active: idx === todayIndex };
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c101b] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const stepsData = getStepsData();
  const unreadCount = notifications.filter(n => n.unread).length;
  const firstNameStr = currentUser?.fullName ? currentUser.fullName.split(" ")[0] : "User";

  return (
    <div className="flex min-h-screen flex-col bg-[#0c101b] text-white font-sans pb-[68px]">
      
      {/* Mobile Header */}
      <header className="flex items-center justify-between border-b border-[#1e293b]/50 px-5 py-4 bg-[#0c101b]/95 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-[#2e3e56] flex items-center justify-center text-blue-400 font-extrabold text-xs">
            {currentUser?.fullName ? currentUser.fullName.charAt(0) : "U"}
          </div>
          <div>
            <h2 className="text-xs font-bold leading-tight">{t("dashboard", "hi")} {firstNameStr}</h2>
            <span className="text-[9px] text-slate-500 block uppercase font-semibold">{t("dashboard", "companionDashboard")}</span>
          </div>
        </div>

        <button
          onClick={() => setNotificationsOpen(true)}
          className="p-2 rounded-xl border border-[#2e3e56] text-slate-300 relative active:scale-95 cursor-pointer"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full bg-blue-500 text-[8px] font-black text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      {/* Grid Content */}
      <div className="p-4 space-y-4">
        
        {/* Health Score Summary Card */}
        <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">{t("dashboard", "overallHealthScore")}</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-4xl font-black text-green-400 tracking-tight font-sans">{healthScore}</span>
              <span className="text-slate-500 text-xs font-semibold">/100</span>
            </div>
            <span className="text-[9px] text-green-400 font-bold block mt-1 uppercase tracking-wide">{t("dashboard", "statusOptimal")}</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-1.5 border-b border-[#1e293b]/40 pb-2">
            <Sparkles className="h-4.5 w-4.5 text-blue-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200 font-sans">{t("dashboard", "aiInsight")}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            "{aiInsight}"
          </p>
        </div>

        {/* Medications, Precautions, and Risk Probability Cards */}
        <div className="space-y-3">
          {/* Medications Panel */}
          <div className="bg-[#131824] rounded-xl border border-[#1e293b] p-4 shadow-md space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
              {language === "bn" ? "ওষুধ ও নির্দেশনা" : "Medication & Guidelines"}
            </span>
            <div className="space-y-2 max-h-36 overflow-y-auto pt-0.5">
              {medications.length === 0 ? (
                <p className="text-[10px] text-slate-500 font-sans leading-normal">
                  {language === "bn" ? "কোনো ওষুধ সুপারিশ করা হয়নি।" : "No medications active or discussed."}
                </p>
              ) : (
                medications.map((med, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-2.5 py-2 bg-blue-500/5 border border-blue-500/10 rounded-lg text-[11px] text-slate-300 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                    <span className="truncate">{med}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Precautions Panel */}
          <div className="bg-[#131824] rounded-xl border border-[#1e293b] p-4 shadow-md space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
              {language === "bn" ? "প্রয়োজনীয় সতর্কতা" : "Clinical Precautions"}
            </span>
            <div className="space-y-2 max-h-36 overflow-y-auto pt-0.5">
              {precautions.length === 0 ? (
                <p className="text-[10px] text-slate-500 font-sans leading-normal">
                  {language === "bn" ? "কোনো সতর্কতা নেই।" : "No critical active warnings."}
                </p>
              ) : (
                precautions.map((prec, idx) => (
                  <div key={idx} className="flex items-start gap-2 px-2.5 py-2 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-[11px] text-slate-300 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0 mt-1.5"></span>
                    <span>{prec}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Risk Probability Panel */}
          <div className="bg-[#131824] rounded-xl border border-[#1e293b] p-4 shadow-md space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
              {language === "bn" ? "রোগের ঝুঁকির সম্ভাবনা" : "Clinical Risk Assessment"}
            </span>
            <div className="space-y-2.5 max-h-36 overflow-y-auto pt-0.5">
              {riskProbability.length === 0 ? (
                <p className="text-[10px] text-slate-500 font-sans leading-normal">
                  {language === "bn" ? "কোনো ঝুঁকি চিহ্নিত করা হয়নি।" : "No specific risks detected."}
                </p>
              ) : (
                riskProbability.map((risk, idx) => (
                  <div key={idx} className="space-y-1 font-sans">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-slate-300 truncate max-w-[75%]">{risk.condition}</span>
                      <span className="text-blue-400 font-bold">{risk.probability}%</span>
                    </div>
                    <div className="w-full h-1 bg-[#0c101b] rounded-full overflow-hidden border border-[#1e293b]/40">
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

        {/* Health Score trend */}
        <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-4 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-200 font-sans">
                {language === "bn" ? "স্বাস্থ্য স্কোরের প্রবণতা" : "Health Score Trend"}
              </h3>
              <span className="text-[9px] text-slate-500 font-semibold block uppercase">
                {language === "bn" ? "সাপ্তাহিক উপসর্গ বিশ্লেষণ ট্র্যাক" : "Weekly Clinical Tracking Status"}
              </span>
            </div>
          </div>

          {/* flex chart for mobile */}
          <div className="pt-2">
            <div className="flex items-end justify-between h-36 border-b border-[#1e293b] pb-2 px-1 relative">
              <div className="absolute left-0 right-0 border-t border-[#1e293b]/50 top-[0%] pointer-events-none">
                <span className="absolute -top-2 left-0 text-[7px] font-bold text-slate-600 font-sans">100%</span>
              </div>
              <div className="absolute left-0 right-0 border-t border-[#1e293b]/50 top-[50%] pointer-events-none">
                <span className="absolute -top-2 left-0 text-[7px] font-bold text-slate-600 font-sans">50%</span>
              </div>

              {stepsData.map((d, index) => {
                const percentageHeight = d.steps; // steps holds scoreVal (0-100)
                return (
                  <div key={index} className="flex-1 flex flex-col justify-end items-center h-full mx-0.5">
                    <div
                      style={{ height: `${percentageHeight}%` }}
                      className={`w-full rounded-[3px] transition-all duration-300 ${d.active ? "bg-blue-500" : "bg-slate-700"}`}
                    ></div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between px-1 pt-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest font-sans">
              {stepsData.map((d, idx) => <span key={idx} className="flex-1 text-center">{d.label}</span>)}
            </div>
          </div>
        </div>

        {/* Disclaimer Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/10 border border-[#1e293b]/30 text-[10px] text-slate-500 leading-relaxed font-sans">
          {t("common", "disclaimerShort")}
        </div>
      </div>

      {/* Notifications Drawer Modal */}
      {notificationsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300 animate-in fade-in">
          <div className="fixed bottom-0 left-0 right-0 max-h-[75vh] rounded-t-3xl border-t border-[#1e293b] bg-[#131824] p-5 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center pb-3 border-b border-[#1e293b]/50">
              <span className="text-xs font-bold text-slate-200 font-sans">{t("common", "notifications")}</span>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider cursor-pointer"
                  >
                    {t("common", "markRead")}
                  </button>
                )}
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-200 bg-slate-900/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2 max-h-[50vh]">
              {notifications.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-6 font-sans">{t("common", "noNotifications")}</p>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-3 rounded-xl border border-[#1e293b]/40 text-[11px] leading-relaxed flex items-start justify-between gap-2.5 transition-all ${
                      n.unread ? "bg-blue-500/5 text-slate-200 border-blue-500/20" : "bg-[#0c101b]/40 text-slate-400"
                    }`}
                  >
                    <span className="font-sans flex-1">{n.text}</span>
                    <button 
                      onClick={() => handleDismissNotification(n.id)}
                      className="text-slate-500 hover:text-red-400 p-0.5 rounded cursor-pointer shrink-0 mt-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
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
