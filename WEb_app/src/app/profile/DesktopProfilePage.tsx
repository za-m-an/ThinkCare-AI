"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
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

export default function DesktopProfilePage() {
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

  // Format DOB
  const dobDate = onboardingData?.dob ? new Date(onboardingData.dob) : new Date();
  const dobFormatted = dobDate.toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", { month: "short", day: "numeric", year: "numeric" });
  
  // Calculate age
  const age = new Date().getFullYear() - dobDate.getFullYear();

  return (
    <div className="flex min-h-screen bg-[#0c101b] text-white font-sans">
      <Sidebar activeTab="profile" userRole="USER" />

      {/* Main profile content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Header bar */}
        <header className="flex items-center justify-between border-b border-[#1e293b]/50 px-8 py-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{t("profile", "pageTitle")}</h1>
            <p className="text-xs text-slate-400 mt-1">{t("profile", "pageSubtitle")}</p>
          </div>
          <button
            onClick={() => router.push("/settings")}
            className="flex items-center gap-1.5 rounded-xl border border-[#2e3e56] hover:bg-slate-900/50 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Settings className="h-4 w-4" />
            {language === "bn" ? "প্রোফাইল সম্পাদনা করুন" : "Edit Profile"}
          </button>
        </header>

        {/* Profile Grid Content */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Bio Card */}
            <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-6 flex flex-col items-center justify-center shadow-xl">
              <div className="relative mb-6">
                <div className="h-28 w-28 rounded-full bg-slate-800 border border-[#2e3e56] flex items-center justify-center text-blue-400 text-4xl font-bold">
                  {currentUser?.fullName ? currentUser.fullName.charAt(0) : "U"}
                </div>
                <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-[#131824] flex items-center justify-center text-white shadow-md">
                  <CheckCircle2 className="h-4.5 w-4.5 fill-green-500 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-100">{currentUser?.fullName}</h3>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">
                {t("profile", "patientId")}: {currentUser?.patientId}
              </p>

              <div className="w-full space-y-4 mt-8 border-t border-[#1e293b]/50 pt-6 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold uppercase text-xs tracking-wider">{language === "bn" ? "জন্ম তারিখ" : "DOB"}</span>
                  <span className="font-bold text-slate-200">{dobFormatted} ({age} {language === "bn" ? "বছর" : "Yrs"})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold uppercase text-xs tracking-wider">{t("profile", "bloodType")}</span>
                  <span className="font-bold text-blue-400 uppercase">{onboardingData?.bloodType || t("profile", "notSpecified")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold uppercase text-xs tracking-wider">{t("profile", "height")}</span>
                  <span className="font-bold text-slate-200">{onboardingData?.height || "--"} cm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold uppercase text-xs tracking-wider">{t("profile", "weight")}</span>
                  <span className="font-bold text-slate-200">{onboardingData?.weight || "--"} kg</span>
                </div>
              </div>
            </div>

            {/* Right Metrics & Conditions Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Vitals row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Heart rate card */}
                <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-5 shadow-xl relative">
                  <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">
                    <span className="flex items-center gap-1.5">
                      <Heart className="h-4.5 w-4.5 text-red-500" />
                      {t("dashboard", "restingHeartRate")}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal lowercase">{language === "bn" ? "২ ঘণ্টা আগে" : "2h ago"}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-slate-100">{onboardingData?.heartRate || "72"}</span>
                    <span className="text-slate-500 text-xs">bpm</span>
                  </div>
                  <div className="w-full bg-[#0c101b] h-1.5 rounded-full mt-4 overflow-hidden border border-[#1e293b]">
                    <div className="bg-green-500 h-full rounded-full w-[72%]"></div>
                  </div>
                  <span className="text-[10px] font-bold text-green-400 tracking-wide uppercase mt-2.5 block">{language === "bn" ? "স্বাভাবিক সীমা" : "Normal range"}</span>
                </div>

                {/* Blood pressure card */}
                <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-5 shadow-xl relative">
                  <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">
                    <span className="flex items-center gap-1.5">
                      <Droplet className="h-4.5 w-4.5 text-blue-400" />
                      {t("dashboard", "bloodPressure")}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal lowercase">{language === "bn" ? "১ দিন আগে" : "1d ago"}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-slate-100">
                      {onboardingData?.bloodPressureSystolic || "118"}/{onboardingData?.bloodPressureDiastolic || "75"}
                    </span>
                    <span className="text-slate-500 text-xs">mmHg</span>
                  </div>
                  <div className="w-full bg-[#0c101b] h-1.5 rounded-full mt-4 overflow-hidden border border-[#1e293b]">
                    <div className="bg-green-500 h-full rounded-full w-[80%]"></div>
                  </div>
                  <span className="text-[10px] font-bold text-green-400 tracking-wide uppercase mt-2.5 block">{language === "bn" ? "সর্বোত্তম" : "Optimal"}</span>
                </div>
              </div>

              {/* Conditions Card */}
              <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-[#1e293b]/50 pb-3 text-slate-200">
                  <Layers className="h-5 w-5 text-blue-400" />
                  <span className="font-bold text-sm uppercase tracking-wider">{language === "bn" ? "সক্রিয় শারীরিক অবস্থা এবং ট্র্যাকিং" : "Active Conditions & Tracking"}</span>
                </div>

                <div className="space-y-3">
                  {onboardingData?.conditions && onboardingData.conditions.length > 0 ? (
                    onboardingData.conditions.map((condition: string) => (
                      <div
                        key={condition}
                        className="flex items-center justify-between p-4 rounded-xl bg-[#0c101b] border border-[#1e293b] hover:border-slate-700 transition-colors cursor-pointer group"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">{condition}</h4>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider leading-none">
                            {language === "bn" ? "বর্তমানে পর্যবেক্ষণ এবং ট্র্যাক করা হচ্ছে" : "Currently monitored and tracked"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/25 text-[10px] font-bold tracking-wide">
                            {language === "bn" ? "স্থিতিশীল" : "Stable"}
                          </span>
                          <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 rounded-xl bg-[#0c101b] text-center border border-[#1e293b] text-xs text-slate-400 leading-normal">
                      {language === "bn" ? "কোনো সক্রিয় শারীরিক অবস্থা ট্র্যাক করা নেই।" : "No active medical conditions tracked."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Export Report Card */}
          <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-200">{language === "bn" ? "স্বাস্থ্য রিপোর্ট এক্সপোর্ট করুন" : "Export Health Report"}</h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-lg leading-relaxed">
                {language === "bn"
                  ? "আপনার প্রাথমিক চিকিৎসা প্রদানকারীর জন্য আপনার চিকিৎসার ইতিহাস, সাম্প্রতিক AI মূল্যায়ন এবং গুরুত্বপূর্ণ ভাইটাল ট্রেন্ডের একটি বিস্তৃত PDF বা JSON এক্সপোর্ট তৈরি করুন।"
                  : "Generate a comprehensive PDF or JSON export of your medical history, recent AI assessments, and vital trends for your primary care physician."}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={() => router.push("/settings")}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl border border-[#2e3e56] hover:bg-slate-800/10 px-5 py-3.5 text-xs font-bold text-slate-200 transition-colors"
              >
                <Settings className="h-4.5 w-4.5" />
                {language === "bn" ? "ডেটা সেটিংস" : "Data Settings"}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={pdfGenerating}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-[#9cbbf8] hover:bg-[#82a5f5] text-slate-950 font-bold px-5 py-3.5 shadow-lg shadow-blue-500/10 transition-colors"
              >
                {pdfGenerating ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <>
                    <FileDown className="h-4.5 w-4.5" />
                    {language === "bn" ? "পিডিএফ তৈরি করুন" : "Generate PDF"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
