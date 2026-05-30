"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, ArrowLeft, ArrowRight, ShieldCheck, User, Activity } from "lucide-react";

export default function MobileOnboardingPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  // Form states
  // Step 1: Personal & Biometrics
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [sexAtBirth, setSexAtBirth] = useState("Not Specified");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // Step 2: Clinical Details
  const [bloodType, setBloodType] = useState("Not Specified");
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");

  // Step 3: Lifestyle Vitals
  const [avgSleepHours, setAvgSleepHours] = useState(7.5);
  const [fastFoodMealsPerWeek, setFastFoodMealsPerWeek] = useState(2);
  const [waterCupsPerDay, setWaterCupsPerDay] = useState(8);
  const [dailySteps, setDailySteps] = useState(6000);
  const [stressLevel, setStressLevel] = useState(5);
  const [smokingPacksPerWeek, setSmokingPacksPerWeek] = useState(0);
  const [alcoholDrinksPerWeek, setAlcoholDrinksPerWeek] = useState(1);

  // Health Vitals
  const [heartRate, setHeartRate] = useState(72);
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState(120);
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState(80);
  const [spO2, setSpO2] = useState(98);

  const conditionsList = [
    "Hypertension",
    "Type 2 Diabetes",
    "Asthma",
    "High Cholesterol",
    "Arthritis",
    "Heart Disease",
    "Anxiety / Depression"
  ];

  const getConditionLabel = (condition: string) => {
    if (language !== "bn") return condition;
    const mapping: Record<string, string> = {
      "Hypertension": "উচ্চ রক্তচাপ",
      "Type 2 Diabetes": "টাইপ ২ ডায়াবেটিস",
      "Asthma": "অ্যাজমা / হাঁপানি",
      "High Cholesterol": "উচ্চ কোলেস্টেরল",
      "Arthritis": "আর্থ্রাইটিস / বাত ব্যথা",
      "Heart Disease": "হৃদরোগ",
      "Anxiety / Depression": "দুশ্চিন্তা / বিষণ্নতা"
    };
    return mapping[condition] || condition;
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok && data.user.isOnboarded) {
          router.push("/dashboard");
        } else {
          setCheckingUser(false);
        }
      } catch (err) {
        setCheckingUser(false);
      }
    };
    checkUser();
  }, [router]);

  const toggleCondition = (condition: string) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== condition));
    } else {
      setSelectedConditions([...selectedConditions, condition]);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          dob,
          sexAtBirth,
          bloodType,
          height,
          weight,
          heartRate,
          bloodPressureSystolic,
          bloodPressureDiastolic,
          spO2,
          avgSleepHours,
          fastFoodMealsPerWeek,
          waterCupsPerDay,
          dailySteps,
          stressLevel,
          smokingPacksPerWeek,
          alcoholDrinksPerWeek,
          conditions: selectedConditions,
          medications,
          allergies,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to complete onboarding");
      }
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  if (checkingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c101b] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0c101b] text-white font-sans">
      <header className="flex items-center justify-between border-b border-[#1e293b]/50 px-5 py-4 bg-[#0c101b]/95 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold tracking-tight">ThinkCare AI</span>
        </div>
      </header>

      <main className="flex-1 p-4 flex flex-col justify-center">
        <div className="w-full bg-[#131824] rounded-2xl border border-[#1e293b] p-5 shadow-xl">
          
          {/* Stepper progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center text-[10px] text-slate-500 mb-2 font-bold uppercase tracking-wider">
              <span>{t("onboarding", "step")} {step} {t("onboarding", "of")} 3</span>
              <span>
                {step === 1 && t("onboarding", "personalInfo")}
                {step === 2 && t("onboarding", "vitalSigns")}
                {step === 3 && t("onboarding", "lifestyle")}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <div className={`h-1 rounded-full ${step >= 1 ? "bg-blue-400" : "bg-[#1e293b]"}`}></div>
              <div className={`h-1 rounded-full ${step >= 2 ? "bg-blue-400" : "bg-[#1e293b]"}`}></div>
              <div className={`h-1 rounded-full ${step >= 3 ? "bg-blue-400" : "bg-[#1e293b]"}`}></div>
            </div>
          </div>

          <h2 className="text-lg font-black tracking-tight mb-1">
            {step === 1 && (language === "bn" ? "আপনার প্রোফাইল তৈরি করুন" : "Build Your Profile")}
            {step === 2 && (language === "bn" ? "চিকিৎসা ইতিহাস" : "Clinical History")}
            {step === 3 && (language === "bn" ? "দৈনিক জীবনধারা ও অভ্যাস" : "Lifestyle Habits")}
          </h2>
          <p className="text-[11px] text-slate-500 mb-5 leading-normal">
            {step === 1 && (language === "bn" ? "আপনার ক্লিনিক্যাল রেকর্ড তৈরি করতে মৌলিক তথ্য।" : "Basic details to establish your clinical record.")}
            {step === 2 && (language === "bn" ? "আমাদের এআই ঝুঁকি ইঞ্জিনের জন্য ক্লিনিক্যাল তথ্য।" : "Clinical details to feed AI risk engines.")}
            {step === 3 && (language === "bn" ? "বিপাকীয় স্বাস্থ্যের সূচকগুলিকে প্রভাবিতকারী অভ্যাস।" : "Habits affecting metabolic health markers.")}
          </p>

          <div className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{t("onboarding", "firstName")}</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-xs text-white"
                      placeholder="Alex"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{t("onboarding", "lastName")}</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-xs text-white"
                      placeholder="Mercer"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{t("onboarding", "dateOfBirth")}</label>
                    <input
                      type="date"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-xs text-white"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{t("onboarding", "sexAtBirth")}</label>
                    <select
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-xs text-white"
                      value={sexAtBirth}
                      onChange={(e) => setSexAtBirth(e.target.value)}
                    >
                      <option value="Male">{language === "bn" ? "পুরুষ" : "Male"}</option>
                      <option value="Female">{language === "bn" ? "নারী" : "Female"}</option>
                      <option value="Other">{language === "bn" ? "অন্যান্য" : "Other"}</option>
                      <option value="Not Specified">{language === "bn" ? "নির্দিষ্ট করা হয়নি" : "Not Specified"}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{language === "bn" ? "উচ্চতা (সেমি)" : "Height (cm)"}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-xs text-white text-center"
                      placeholder="180"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{language === "bn" ? "ওজন (কেজি)" : "Weight (kg)"}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-xs text-white text-center"
                      placeholder="75"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{language === "bn" ? "রক্তের গ্রুপ (ঐচ্ছিক)" : "Blood Type"}</label>
                  <select
                    className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-xs text-white"
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                  >
                    <option value="Not Specified">{language === "bn" ? "রক্তের গ্রুপ নির্বাচন করুন" : "Select blood type"}</option>
                    <option value="O-Positive">O-Positive (O+)</option>
                    <option value="O-Negative">O-Negative (O-)</option>
                    <option value="A-Positive">A-Positive (A+)</option>
                    <option value="A-Negative">A-Negative (A-)</option>
                    <option value="B-Positive">B-Positive (B+)</option>
                    <option value="B-Negative">B-Negative (B-)</option>
                    <option value="AB-Positive">AB-Positive (AB+)</option>
                    <option value="AB-Negative">AB-Negative (AB-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase font-sans">{language === "bn" ? "বিদ্যমান শারীরিক অবস্থা" : "Diagnosed Conditions"}</label>
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {conditionsList.map((condition) => (
                      <button
                        type="button"
                        key={condition}
                        onClick={() => toggleCondition(condition)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                          selectedConditions.includes(condition)
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                            : "bg-[#0c101b] text-slate-400 border-[#2e3e56]"
                        }`}
                      >
                        {getConditionLabel(condition)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{language === "bn" ? "বর্তমান ওষুধসমূহ" : "Medications"}</label>
                    <textarea
                      rows={2}
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-xs text-white placeholder-slate-600"
                      placeholder={language === "bn" ? "ওষুধের তালিকা (যেমন লিসিনোপ্রিল ১০ মিগ্রা)" : "Medication list (e.g. Lisinopril 10mg)"}
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{language === "bn" ? "পরিচিত অ্যালার্জি" : "Allergies"}</label>
                    <textarea
                      rows={2}
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-xs text-white placeholder-slate-600"
                      placeholder={language === "bn" ? "ওষুধ/খাবারে অ্যালার্জি (যেমন পেনিসিলিন)" : "Drug/food allergies (e.g. Penicillin)"}
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase text-center">{t("profile", "heartRate")} (bpm)</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2 text-center text-xs font-bold"
                      value={heartRate}
                      onChange={(e) => setHeartRate(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase text-center">{language === "bn" ? "এসপিও২ (%)" : "SpO2 (%)"}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2 text-center text-xs font-bold"
                      value={spO2}
                      onChange={(e) => setSpO2(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{language === "bn" ? "ঘুম (ঘণ্টা)" : "Sleep (hrs)"}</label>
                    <input
                      type="number"
                      step="0.5"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2 text-xs font-bold"
                      value={avgSleepHours}
                      onChange={(e) => setAvgSleepHours(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{language === "bn" ? "পদক্ষেপ/দিন" : "Steps/Day"}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2 text-xs font-bold"
                      value={dailySteps}
                      onChange={(e) => setDailySteps(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{language === "bn" ? "ফাস্ট ফুড/সপ্তাহ" : "Fast Food/wk"}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2 text-xs font-bold"
                      value={fastFoodMealsPerWeek}
                      onChange={(e) => setFastFoodMealsPerWeek(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{language === "bn" ? "পানি (কাপ/দিন)" : "Water cups/day"}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2 text-xs font-bold"
                      value={waterCupsPerDay}
                      onChange={(e) => setWaterCupsPerDay(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1.5">
                    <span>{language === "bn" ? "মানসিক চাপ" : "Stress Level"}</span>
                    <span className="text-blue-400">{stressLevel}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    className="w-full h-1 bg-[#0c101b] rounded-lg appearance-none cursor-pointer accent-blue-400"
                    value={stressLevel}
                    onChange={(e) => setStressLevel(parseInt(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{language === "bn" ? "ধূমপান/সপ্তাহ" : "Smoking/wk"}</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2 text-xs font-bold"
                      value={smokingPacksPerWeek}
                      onChange={(e) => setSmokingPacksPerWeek(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{language === "bn" ? "অ্যালকোহল/সপ্তাহ" : "Drinks/wk"}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2 text-xs font-bold"
                      value={alcoholDrinksPerWeek}
                      onChange={(e) => setAlcoholDrinksPerWeek(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stepper actions */}
          <div className="mt-8 pt-4 border-t border-[#1e293b]/50 flex justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold border transition-colors ${
                step === 1 ? "border-[#2e3e56] text-slate-600" : "border-[#2e3e56] text-slate-300"
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("common", "back")}
            </button>

            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-blue-500 text-white font-bold px-4 py-2.5 text-xs shadow-lg"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {step === 3 ? (language === "bn" ? "নিবন্ধন" : "Register") : (language === "bn" ? "চালিয়ে যান" : "Continue")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-slate-500 text-[10px]">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
            {language === "bn" ? "HIPAA সম্মত।" : "HIPAA Compliant."}
          </div>
        </div>
      </main>
    </div>
  );
}
