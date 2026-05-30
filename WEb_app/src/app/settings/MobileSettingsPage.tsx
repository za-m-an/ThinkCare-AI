"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileNavBar from "@/components/MobileNavBar";
import { User, ShieldAlert, Key, Bell, Loader2, ShieldCheck, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MobileSettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { language, setLanguage, t } = useLanguage();

  // Collapsible sections
  const [expandedSection, setExpandedSection] = useState<string | null>("profile");

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("Patient");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Medical Context States
  const [bloodType, setBloodType] = useState("Not Specified");
  const [allergiesWatchlist, setAllergiesWatchlist] = useState("");
  const [savingMedical, setSavingMedical] = useState(false);
  const [medicalSuccess, setMedicalSuccess] = useState(false);

  // Notification Preference States
  const [twoFactor, setTwoFactor] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalTriggers, setCriticalTriggers] = useState(true);
  const [systemLogs, setSystemLogs] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();
        if (userRes.ok) {
          setCurrentUser(userData.user);
          setFullName(userData.user.fullName || "");
          setEmail(userData.user.email || "");
          setSpecialty(userData.user.role === "ADMIN" ? "Cardiology Specialist" : "Patient");

          // Load preferences
          setTwoFactor(userData.user.twoFactorEnabled !== false);
          setEmailAlerts(userData.user.emailAlerts !== false);
          setCriticalTriggers(userData.user.criticalTriggers !== false);
          setSystemLogs(userData.user.systemLogs === true);

          // Load onboarding medical details
          const onboardingRes = await fetch("/api/onboarding");
          const onboardingData = await onboardingRes.json();
          if (onboardingRes.ok && onboardingData.onboarding) {
            setBloodType(onboardingData.onboarding.bloodType || "Not Specified");
            setAllergiesWatchlist(onboardingData.onboarding.allergies || "");
          }
        }
      } catch (err) {
        console.error("Failed to load settings data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "profile",
          fullName,
          email,
        }),
      });

      if (response.ok) {
        setProfileSuccess(true);
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData.user);
        }
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save profile");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveMedical = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMedical(true);
    setMedicalSuccess(false);

    try {
      const getRes = await fetch("/api/onboarding");
      const getData = await getRes.json();
      const currentOnboarding = getRes.ok ? getData.onboarding : {};

      const saveRes = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentOnboarding,
          firstName: currentOnboarding.firstName || fullName.split(" ")[0] || "User",
          lastName: currentOnboarding.lastName || fullName.split(" ")[1] || "Name",
          dob: currentOnboarding.dob || new Date("1990-01-01"),
          sexAtBirth: currentOnboarding.sexAtBirth || "Not Specified",
          height: currentOnboarding.height || 170,
          weight: currentOnboarding.weight || 70,
          bloodType: bloodType,
          allergies: allergiesWatchlist,
        }),
      });

      if (saveRes.ok) {
        setMedicalSuccess(true);
        setTimeout(() => setMedicalSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingMedical(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordSuccess(false);
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      setSavingPassword(false);
      return;
    }

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "security",
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        const data = await response.json();
        setPasswordError(data.error || "Failed to update password");
      }
    } catch (err) {
      console.error(err);
      setPasswordError("Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleTogglePreference = async (field: string, value: boolean) => {
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "notifications",
          [field]: value,
        }),
      });
    } catch (err) {
      console.error("Failed to toggle preference", err);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
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
      <header className="flex items-center justify-between border-b border-[#1e293b]/50 px-5 py-4 bg-[#0c101b]/95 sticky top-0 z-30 shrink-0">
        <h1 className="text-sm font-extrabold tracking-tight">{t("settings", "pageTitle")}</h1>
      </header>

      {/* Grid Content */}
      <div className="p-4 space-y-3.5">
        
        {/* 1. Profile Settings Section */}
        <div className="bg-[#131824] rounded-2xl border border-[#1e293b] overflow-hidden">
          <button
            onClick={() => toggleSection("profile")}
            className="w-full flex items-center justify-between p-4 text-left font-bold text-xs uppercase tracking-wide text-slate-200 border-b border-[#1e293b]/30"
          >
            <span className="flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-blue-400" />
              {t("settings", "profileSettings")}
            </span>
            {expandedSection === "profile" ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
          </button>

          {expandedSection === "profile" && (
            <form onSubmit={handleSaveProfile} className="p-4 space-y-4 animate-in fade-in">
              <div className="flex items-center gap-4 border-b border-[#1e293b]/35 pb-4">
                <div className="h-14 w-14 rounded-full bg-slate-800 border border-[#2e3e56] flex items-center justify-center text-blue-400 text-xl font-bold">
                  {fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-200 leading-tight">{fullName}</h3>
                  <p className="text-[10px] text-slate-500 mt-1">{email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{t("settings", "fullName")}</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-xs text-white"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{t("settings", "email")}</label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-xs text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{t("settings", "specialtyRole")}</label>
                  <input
                    type="text"
                    disabled
                    className="w-full rounded-xl border border-[#2e3e56] bg-[#0d121f] px-4 py-2.5 text-xs text-slate-500"
                    value={specialty}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                {profileSuccess && (
                  <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> {t("settings", "saved")}
                  </span>
                )}
                <div className="flex-1"></div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-xl bg-blue-500 text-white font-bold px-4 py-2.5 text-xs shadow-md"
                >
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common", "save")}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 2. Medical Context Section */}
        <div className="bg-[#131824] rounded-2xl border border-[#1e293b] overflow-hidden">
          <button
            onClick={() => toggleSection("medical")}
            className="w-full flex items-center justify-between p-4 text-left font-bold text-xs uppercase tracking-wide text-slate-200 border-b border-[#1e293b]/30"
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-blue-400" />
              {t("settings", "medicalContext")}
            </span>
            {expandedSection === "medical" ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
          </button>

          {expandedSection === "medical" && (
            <form onSubmit={handleSaveMedical} className="p-4 space-y-4 animate-in fade-in">
              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                {t("settings", "medicalContextDescMobile")}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{t("settings", "defaultBloodTypeMobile")}</label>
                  <select
                    className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-xs text-white"
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                  >
                    <option value="Not Specified">{language === "bn" ? "নির্দিষ্ট করা হয়নি" : "Not Specified"}</option>
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
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{t("settings", "allergiesWatchlistMobile")}</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-xs text-white"
                    placeholder={t("settings", "allergiesPlaceholder")}
                    value={allergiesWatchlist}
                    onChange={(e) => setAllergiesWatchlist(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                {medicalSuccess && (
                  <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> {t("settings", "saved")}
                  </span>
                )}
                <div className="flex-1"></div>
                <button
                  type="submit"
                  disabled={savingMedical}
                  className="rounded-xl bg-blue-500 text-white font-bold px-4 py-2.5 text-xs shadow-md"
                >
                  {savingMedical ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common", "save")}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 3. Security & Access Section */}
        <div className="bg-[#131824] rounded-2xl border border-[#1e293b] overflow-hidden">
          <button
            onClick={() => toggleSection("security")}
            className="w-full flex items-center justify-between p-4 text-left font-bold text-xs uppercase tracking-wide text-slate-200 border-b border-[#1e293b]/30"
          >
            <span className="flex items-center gap-2">
              <Key className="h-4.5 w-4.5 text-blue-400" />
              {t("settings", "securityPassword")}
            </span>
            {expandedSection === "security" ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
          </button>

          {expandedSection === "security" && (
            <div className="p-4 space-y-5 animate-in fade-in">
              <div className="flex justify-between items-center bg-[#0c101b] rounded-xl border border-[#1e293b] p-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 leading-none">{t("settings", "twoFactorToggle")}</h4>
                  <span className="text-[9px] text-slate-500 block mt-1 leading-tight">{t("settings", "twoFactorToggleDesc")}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={twoFactor}
                    onChange={(e) => {
                      const newVal = e.target.checked;
                      setTwoFactor(newVal);
                      handleTogglePreference("twoFactorEnabled", newVal);
                    }}
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block border-b border-[#1e293b]/40 pb-2">{t("settings", "changePassword")}</span>
                
                {passwordError && (
                  <div className="p-2.5 rounded-xl bg-red-955/40 text-red-400 text-[10px] border border-red-800/35">
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{t("settings", "currentPassword")}</label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-xs text-white"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{t("settings", "newPassword")}</label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-xs text-white"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  {passwordSuccess && (
                    <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> {t("settings", "passwordUpdated")}
                    </span>
                  )}
                  <div className="flex-1"></div>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="rounded-xl bg-blue-500 text-white font-bold px-4 py-2.5 text-xs shadow-md"
                  >
                    {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common", "update")}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* 4. Notification Preferences Section */}
        <div className="bg-[#131824] rounded-2xl border border-[#1e293b] overflow-hidden">
          <button
            onClick={() => toggleSection("notifications")}
            className="w-full flex items-center justify-between p-4 text-left font-bold text-xs uppercase tracking-wide text-slate-200 border-b border-[#1e293b]/30"
          >
            <span className="flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-blue-400" />
              {t("settings", "notificationsTab")}
            </span>
            {expandedSection === "notifications" ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
          </button>

          {expandedSection === "notifications" && (
            <div className="p-4 space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center pb-3 border-b border-[#1e293b]/30">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{t("settings", "emailAlerts")}</h4>
                  <span className="text-[9px] text-slate-500 block leading-tight">{t("settings", "emailAlertsDescMobile")}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={emailAlerts}
                    onChange={(e) => {
                      const newVal = e.target.checked;
                      setEmailAlerts(newVal);
                      handleTogglePreference("emailAlerts", newVal);
                    }}
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-[#1e293b]/30">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{t("settings", "criticalTriggersMobile")}</h4>
                  <span className="text-[9px] text-slate-500 block leading-tight">{t("settings", "criticalTriggersDescMobile")}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={criticalTriggers}
                    onChange={(e) => {
                      const newVal = e.target.checked;
                      setCriticalTriggers(newVal);
                      handleTogglePreference("criticalTriggers", newVal);
                    }}
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{t("settings", "systemLogs")}</h4>
                  <span className="text-[9px] text-slate-500 block leading-tight">{t("settings", "systemLogsDescMobile")}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={systemLogs}
                    onChange={(e) => {
                      const newVal = e.target.checked;
                      setSystemLogs(newVal);
                      handleTogglePreference("systemLogs", newVal);
                    }}
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 5. Language Section */}
        <div className="bg-[#131824] rounded-2xl border border-[#1e293b] overflow-hidden">
          <button
            onClick={() => toggleSection("language")}
            className="w-full flex items-center justify-between p-4 text-left font-bold text-xs uppercase tracking-wide text-slate-200 border-b border-[#1e293b]/30"
          >
            <span className="flex items-center gap-2">
              <Globe className="h-4.5 w-4.5 text-blue-400" />
              {t("settings", "languageTab")}
            </span>
            {expandedSection === "language" ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
          </button>

          {expandedSection === "language" && (
            <div className="p-4 space-y-4 animate-in fade-in">
              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                {t("settings", "languageDesc")}
              </p>

              <div className="space-y-3">
                {/* English Option */}
                <button
                  onClick={() => setLanguage("en")}
                  className={`w-full flex flex-col items-start text-left p-4 rounded-xl border transition-all ${
                    language === "en"
                      ? "bg-blue-500/10 border-blue-500"
                      : "bg-[#0c101b] border-[#2e3e56]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs text-slate-200">{t("settings", "english")}</span>
                    {language === "en" && (
                      <span className="text-[9px] bg-blue-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                        {t("settings", "currentLanguage")}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{t("settings", "englishDesc")}</p>
                </button>

                {/* Bangla Option */}
                <button
                  onClick={() => setLanguage("bn")}
                  className={`w-full flex flex-col items-start text-left p-4 rounded-xl border transition-all ${
                    language === "bn"
                      ? "bg-blue-500/10 border-blue-500"
                      : "bg-[#0c101b] border-[#2e3e56]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs text-slate-200">{t("settings", "bangla")}</span>
                    {language === "bn" && (
                      <span className="text-[9px] bg-blue-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                        {t("settings", "currentLanguage")}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{t("settings", "banglaDesc")}</p>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Navigation Tab Bar */}
      <MobileNavBar />
    </div>
  );
}

