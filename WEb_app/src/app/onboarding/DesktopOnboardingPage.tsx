"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, ArrowLeft, ArrowRight, ShieldCheck, Heart, User, Activity } from "lucide-react";

export default function DesktopOnboardingPage() {
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
      {/* Header bar */}
      <header className="flex items-center justify-between border-b border-[#1e293b] px-8 py-4 bg-[#0c101b]/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white shadow-md shadow-blue-500/20">
            <svg
              className="h-4.5 w-4.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 114 0v2m-4 0h4m-4 5v5m14-5v5"
              ></path>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">ThinkCare AI</span>
        </div>
      </header>

      {/* Main Form container */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-2xl bg-[#131824] rounded-2xl border border-[#1e293b] p-8 shadow-2xl relative overflow-hidden">
          {/* Stepper bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">
              <span>{t("onboarding", "step")} {step} {t("onboarding", "of")} 3</span>
              <span>
                {step === 1 && t("onboarding", "personalInfo")}
                {step === 2 && t("onboarding", "vitalSigns")}
                {step === 3 && t("onboarding", "lifestyle")}
              </span>
            </div>
            {/* Progress lines */}
            <div className="grid grid-cols-3 gap-2">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step >= 1 ? "bg-blue-400" : "bg-[#1e293b]"
                }`}
              ></div>
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step >= 2 ? "bg-blue-400" : "bg-[#1e293b]"
                }`}
              ></div>
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step >= 3 ? "bg-blue-400" : "bg-[#1e293b]"
                }`}
              ></div>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            {step === 1 && (language === "bn" ? "আপনার স্বাস্থ্য প্রোফাইল তৈরি করুন" : "Build Your Health Profile")}
            {step === 2 && (language === "bn" ? "চিকিৎসা ও স্বাস্থ্য ইতিহাস" : "Medical & Health History")}
            {step === 3 && (language === "bn" ? "দৈনিক জীবনধারা ও অভ্যাস" : "Daily Lifestyle Habits")}
          </h2>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed">
            {step === 1 && (language === "bn" ? "আপনার রেকর্ড তৈরি করতে আপনার মৌলিক জীবনবৃত্তান্ত বিবরণ প্রদান করুন।" : "Provide your basic biographical details to establish your record.")}
            {step === 2 && (language === "bn" ? "আপনার ক্লিনিক্যাল তথ্য আমাদের ইঞ্জিনের জন্য ডায়াগনস্টিক নির্ভুলতা নিশ্চিত করে।" : "Your clinical information ensures diagnostic precision for our engines.")}
            {step === 3 && (language === "bn" ? "দৈনিক জীবনধারা পছন্দগুলি পূর্বাভাসের ঝুঁকি ধরণগুলিকে উল্লেখযোগ্যভাবে প্রভাবিত করে।" : "Daily lifestyle choices significantly affect predicted risk patterns.")}
          </p>

          {/* Form Content */}
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-[#1e293b]/50 pb-2 text-blue-400">
                  <User className="h-5 w-5" />
                  <span className="font-bold text-sm tracking-wide uppercase">{language === "bn" ? "মৌলিক তথ্য" : "Basic Information"}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">{t("onboarding", "firstName")}</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
                      placeholder="Alex"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">{t("onboarding", "lastName")}</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
                      placeholder="Mercer"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">{t("onboarding", "dateOfBirth")}</label>
                    <input
                      type="date"
                      required
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">{t("onboarding", "sexAtBirth")}</label>
                    <select
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
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

                <div className="flex items-center gap-2 border-b border-[#1e293b]/50 pb-2 pt-4 text-blue-400">
                  <Activity className="h-5 w-5" />
                  <span className="font-bold text-sm tracking-wide uppercase">{language === "bn" ? "শারীরিক পরিমাপ" : "Biometrics"}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">{language === "bn" ? "উচ্চতা (সেমি)" : "Height (cm)"}</label>
                    <input
                      type="number"
                      required
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
                      placeholder="180"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">{language === "bn" ? "ওজন (কেজি)" : "Weight (kg)"}</label>
                    <input
                      type="number"
                      required
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
                      placeholder="75"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">{language === "bn" ? "রক্তের গ্রুপ (ঐচ্ছিক)" : "Blood Type (Optional)"}</label>
                  <select
                    className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
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
                  <label className="block text-xs font-semibold text-slate-400 mb-2">{language === "bn" ? "বিদ্যমান শারীরিক অবস্থা" : "Existing Conditions"}</label>
                  <p className="text-xs text-slate-500 mb-3">{language === "bn" ? "আপনার নির্ণয় করা বা পরিচালনা করা যেকোনো অবস্থা নির্বাচন করুন:" : "Select any conditions you have been diagnosed with or manage:"}</p>
                  <div className="flex flex-wrap gap-2.5">
                    {conditionsList.map((condition) => (
                      <button
                        type="button"
                        key={condition}
                        onClick={() => toggleCondition(condition)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                          selectedConditions.includes(condition)
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                            : "bg-[#0c101b] text-slate-400 border-[#2e3e56] hover:bg-slate-800/10"
                        }`}
                      >
                        {getConditionLabel(condition)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">{language === "bn" ? "বর্তমান ওষুধসমূহ" : "Current Medications"}</label>
                    <textarea
                      rows={3}
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors text-sm placeholder-slate-600"
                      placeholder={language === "bn" ? "ওষুধ এবং ডোজ তালিকাভুক্ত করুন (যেমন লিসিনোপ্রিল ১০ মিগ্রা দৈনিক)" : "List medications and dosages (e.g. Lisinopril 10mg daily)"}
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">{language === "bn" ? "পরিচিত অ্যালার্জি" : "Known Allergies"}</label>
                    <textarea
                      rows={3}
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors text-sm placeholder-slate-600"
                      placeholder={language === "bn" ? "ওষুধ বা তীব্র খাবার অ্যালার্জি তালিকাভুক্ত করুন (যেমন পেনিসিলিন, চিনাবাদাম)" : "List drug or severe food allergies (e.g. Penicillin, Peanuts)"}
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 border-b border-[#1e293b]/50 pb-2 pt-4 text-blue-400">
                  <Activity className="h-5 w-5" />
                  <span className="font-bold text-sm tracking-wide uppercase">{language === "bn" ? "ভাইটাল নমুনা (ঐচ্ছিক)" : "Mock Vitals (Optional)"}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t("profile", "heartRate")}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-center text-sm font-semibold"
                      value={heartRate}
                      onChange={(e) => setHeartRate(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{language === "bn" ? "রক্তচাপ (সিস)" : "BP (Sys)"}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-center text-sm font-semibold"
                      value={bloodPressureSystolic}
                      onChange={(e) => setBloodPressureSystolic(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{language === "bn" ? "রক্তচাপ (ডায়া)" : "BP (Dia)"}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-center text-sm font-semibold"
                      value={bloodPressureDiastolic}
                      onChange={(e) => setBloodPressureDiastolic(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{language === "bn" ? "এসপিও২ (%)" : "SpO2 (%)"}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-center text-sm font-semibold"
                      value={spO2}
                      onChange={(e) => setSpO2(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">{language === "bn" ? "ঘুমের সময়কাল (ঘণ্টা/রাত)" : "Sleep Duration (Hours/Night)"}</label>
                    <input
                      type="number"
                      step="0.5"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3"
                      value={avgSleepHours}
                      onChange={(e) => setAvgSleepHours(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">{language === "bn" ? "দৈনিক পদক্ষেপ (গড়)" : "Daily Steps (Average)"}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3"
                      value={dailySteps}
                      onChange={(e) => setDailySteps(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">{language === "bn" ? "ফাস্ট ফুড গ্রহণ (সপ্তাহে)" : "Fast Food Meals per Week"}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3"
                      value={fastFoodMealsPerWeek}
                      onChange={(e) => setFastFoodMealsPerWeek(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">{language === "bn" ? "পানি পান (কাপ/দিন)" : "Water Intake (Cups/Day)"}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3"
                      value={waterCupsPerDay}
                      onChange={(e) => setWaterCupsPerDay(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
                    <span>{language === "bn" ? "মানসিক চাপ" : "Stress Level"}</span>
                    <span className="text-blue-400 font-bold">{stressLevel} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    className="w-full h-1.5 bg-[#0c101b] rounded-lg appearance-none cursor-pointer accent-blue-400"
                    value={stressLevel}
                    onChange={(e) => setStressLevel(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                    <span>{language === "bn" ? "কম চাপ" : "Low Stress"}</span>
                    <span>{language === "bn" ? "উচ্চ চাপ" : "High Stress"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">{language === "bn" ? "ধূমপান (প্যাক/সপ্তাহ)" : "Smoking (Packs/Week)"}</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3"
                      value={smokingPacksPerWeek}
                      onChange={(e) => setSmokingPacksPerWeek(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">{language === "bn" ? "অ্যালকোহল (পানীয়/সপ্তাহ)" : "Alcohol (Drinks/Week)"}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3"
                      value={alcoholDrinksPerWeek}
                      onChange={(e) => setAlcoholDrinksPerWeek(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Action Buttons */}
          <div className="mt-12 pt-6 border-t border-[#1e293b]/50 flex justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 border font-semibold transition-colors ${
                step === 1
                  ? "border-[#2e3e56] text-slate-600 cursor-not-allowed"
                  : "border-[#2e3e56] text-slate-300 hover:bg-slate-800/10 cursor-pointer"
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              {t("common", "back")}
            </button>

            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#9cbbf8] hover:bg-[#82a5f5] text-slate-950 font-bold px-6 py-3 shadow-lg shadow-blue-500/10 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {step === 3 ? (language === "bn" ? "নিবন্ধন সম্পূর্ণ করুন" : "Complete Registration") : (language === "bn" ? "চালিয়ে যান" : "Continue")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Verification badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-xs">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            {language === "bn" ? "আপনার তথ্য এন্ড-টু-এন্ড এনক্রিপ্ট করা এবং HIPAA সম্মত।" : "Your data is end-to-end encrypted and HIPAA compliant."}
          </div>
        </div>
      </main>
    </div>
  );
}
