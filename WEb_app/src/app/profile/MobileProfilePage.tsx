"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileNavBar from "@/components/MobileNavBar";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  User,
  Heart,
  Droplet,
  Settings,
  FileDown,
  Activity,
  Layers,
  Loader2,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

export default function MobileProfilePage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);

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

          // Fetch onboarding data for vitals
          const onboardingRes = await fetch("/api/onboarding");
          const onboardingData = await onboardingRes.json();
          if (onboardingRes.ok && onboardingData.onboarding) {
            setOnboardingData(onboardingData.onboarding);
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Profile load failed", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleDownloadPDF = async () => {
    setPdfGenerating(true);
    try {
      const res = await fetch("/api/profile/report");
      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ThinkCare_Health_Report_${currentUser?.fullName ? currentUser.fullName.replace(/\s+/g, "_") : "User"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert((language === "bn" ? "রিপোর্ট তৈরি করতে ত্রুটি হয়েছে: " : "Error generating report: ") + err.message);
    } finally {
      setPdfGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c101b] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const dobDate = onboardingData?.dob ? new Date(onboardingData.dob) : new Date();
  const dobFormatted = dobDate.toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", { month: "short", day: "numeric", year: "numeric" });
  const age = new Date().getFullYear() - dobDate.getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-[#0c101b] text-white font-sans pb-[68px]">
      
      {/* Mobile Top Bar */}
      <header className="flex items-center justify-between border-b border-[#1e293b]/50 px-5 py-4 bg-[#0c101b]/95 sticky top-0 z-30 shrink-0">
        <div>
          <h1 className="text-sm font-extrabold tracking-tight font-sans">{t("profile", "pageTitle")}</h1>
        </div>
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-1 p-2 rounded-xl border border-[#2e3e56] text-[10px] font-bold uppercase active:scale-95"
        >
          <Settings className="h-4 w-4" />
          {t("common", "edit")}
        </button>
      </header>

      {/* Grid Content */}
      <div className="p-4 space-y-4">
        
        {/* User Bio Card */}
        <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-5 flex flex-col items-center justify-center shadow-xl">
          <div className="relative mb-4">
            <div className="h-20 w-20 rounded-full bg-slate-800 border border-[#2e3e56] flex items-center justify-center text-blue-400 text-3xl font-black">
              {currentUser?.fullName ? currentUser.fullName.charAt(0) : "U"}
            </div>
            <div className="absolute bottom-0.5 right-0.5 h-5 w-5 rounded-full bg-green-500 border border-[#131824] flex items-center justify-center text-white">
              <CheckCircle2 className="h-3.5 w-3.5 fill-green-500 text-white" />
            </div>
          </div>
          <h3 className="text-base font-bold text-slate-100">{currentUser?.fullName}</h3>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">{t("profile", "patientId")}: {currentUser?.patientId}</span>

          <div className="w-full space-y-3.5 mt-5 border-t border-[#1e293b]/40 pt-4 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">{language === "bn" ? "জন্ম তারিখ" : "DOB"}</span>
              <span className="font-bold text-slate-200">{dobFormatted} ({age} {language === "bn" ? "বছর" : "Yrs"})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">{t("profile", "bloodType")}</span>
              <span className="font-bold text-blue-400 uppercase">{onboardingData?.bloodType || t("profile", "notSpecified")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">{t("profile", "height")}</span>
              <span className="font-bold text-slate-200">{onboardingData?.height || "--"} cm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold uppercase text-[10px]">{t("profile", "weight")}</span>
              <span className="font-bold text-slate-200">{onboardingData?.weight || "--"} kg</span>
            </div>
          </div>
        </div>

        {/* Vitals row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Heart rate card */}
          <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-4 shadow-xl">
            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-2">
              <Heart className="h-3.5 w-3.5 text-red-500" />
              {t("dashboard", "pulse")}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-100">{onboardingData?.heartRate || "72"}</span>
              <span className="text-slate-500 text-[10px]">bpm</span>
            </div>
          </div>

          {/* Blood pressure card */}
          <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-4 shadow-xl">
            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-2">
              <Droplet className="h-3.5 w-3.5 text-blue-400" />
              {t("dashboard", "bp")}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-100">
                {onboardingData?.bloodPressureSystolic || "118"}/{onboardingData?.bloodPressureDiastolic || "75"}
              </span>
              <span className="text-slate-500 text-[10px]">mmHg</span>
            </div>
          </div>
        </div>

        {/* Conditions Card */}
        <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-4 shadow-xl space-y-3">
          <div className="flex items-center gap-1.5 border-b border-[#1e293b]/40 pb-2 text-slate-200">
            <Layers className="h-4 w-4 text-blue-400" />
            <span className="font-bold text-[10px] uppercase tracking-wider">{language === "bn" ? "সক্রিয় শারীরিক অবস্থা" : "Monitored Conditions"}</span>
          </div>

          <div className="space-y-2">
            {onboardingData?.conditions && onboardingData.conditions.length > 0 ? (
              onboardingData.conditions.map((condition: string) => (
                <div
                  key={condition}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0c101b] border border-[#1e293b]"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{condition}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-bold tracking-wide">
                    {language === "bn" ? "স্থিতিশীল" : "Stable"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-slate-500 py-4">{language === "bn" ? "কোনো সক্রিয় শারীরিক অবস্থা ট্র্যাক করা নেই।" : "No active conditions logged."}</p>
            )}
          </div>
        </div>

        {/* Export Report Card */}
        <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-5 shadow-xl space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-200">{language === "bn" ? "স্বাস্থ্য রিপোর্ট এক্সপোর্ট করুন" : "Export Health Report"}</h3>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
              {language === "bn"
                ? "গুরুত্বপূর্ণ ভাইটাল এবং AI ডায়াগনস্টিক লগের বিবরণ সহ একটি পিডিএফ রিপোর্ট তৈরি করুন।"
                : "Generate a physician-facing PDF report containing vitals trends and AI diagnostic logs."}
            </p>
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfGenerating}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500 text-white font-bold py-3 text-xs shadow-lg active:scale-[0.98] transition-all"
          >
            {pdfGenerating ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <>
                <FileDown className="h-4.5 w-4.5" />
                {language === "bn" ? "পিডিএফ রিপোর্ট তৈরি করুন" : "Generate PDF Report"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <MobileNavBar />
    </div>
  );
}
