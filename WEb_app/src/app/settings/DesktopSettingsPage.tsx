"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { User, ShieldAlert, Key, Bell, Loader2, ShieldCheck, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DesktopSettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("profile");
  const { language, setLanguage, t } = useLanguage();

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

          // Load onboarding medical details for medical context
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
        // Refresh local user state to update names in layout dynamically
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
      alert("Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveMedical = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMedical(true);
    setMedicalSuccess(false);

    try {
      // Fetch current onboarding, merge, and save
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c101b] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const subTabs = [
    { id: "profile", name: t("settings", "profileSettings"), icon: User },
    { id: "medical", name: t("settings", "medicalContext"), icon: ShieldAlert },
    { id: "security", name: t("settings", "securityAccess"), icon: Key },
    { id: "notifications", name: t("settings", "notificationsTab"), icon: Bell },
    { id: "language", name: t("settings", "languageTab"), icon: Globe },
  ];

  return (
    <div className="flex min-h-screen bg-[#0c101b] text-white font-sans">
      <Sidebar activeTab="settings" userRole={currentUser?.role} />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="flex items-center justify-between border-b border-[#1e293b]/50 px-8 py-5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight font-hanken">{t("settings", "pageTitle")}</h1>
            <p className="text-xs text-slate-400 mt-1 leading-normal">
              {t("settings", "pageSubtitle")}
            </p>
          </div>
        </header>

        {/* Content columns */}
        <div className="p-8 flex gap-8 flex-col lg:flex-row">
          {/* Sub Navigation List */}
          <div className="w-full lg:w-60 shrink-0 space-y-1">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold tracking-wide text-left transition-all ${
                  activeSubTab === tab.id
                    ? "bg-[#131824] text-blue-400"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                }`}
              >
                <tab.icon className="h-4.5 w-4.5" />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Right Panels */}
          <div className="flex-1 space-y-8 max-w-3xl">
            {activeSubTab === "profile" && (
              <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-6 space-y-6">
                <div className="flex items-center gap-2 text-blue-400 border-b border-[#1e293b]/50 pb-2">
                  <User className="h-5 w-5" />
                  <span className="font-bold text-sm uppercase tracking-wider">{t("settings", "profileSettings")}</span>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-slate-800 border border-[#2e3e56] flex items-center justify-center text-blue-400 text-2xl font-bold relative group">
                      {fullName.charAt(0)}
                      <span className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        {t("common", "edit")}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-200">{fullName}</h3>
                      <p className="text-xs text-slate-400 mt-1">{email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">{t("settings", "fullName")}</label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">{t("settings", "emailAddress")}</label>
                      <input
                        type="email"
                        required
                        className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">{t("settings", "specialtyRole")}</label>
                      <input
                        type="text"
                        disabled
                        className="w-full rounded-xl border border-[#2e3e56] bg-[#0d121f] px-4 py-3 text-slate-400 cursor-not-allowed"
                        value={specialty}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    {profileSuccess && (
                      <span className="text-xs text-green-400 font-bold flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4" /> {t("settings", "changesSaved")}
                      </span>
                    )}
                    <div className="flex-1"></div>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 shadow-lg shadow-blue-500/10 transition-colors flex items-center gap-2"
                    >
                      {savingProfile ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : t("common", "saveChanges")}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeSubTab === "medical" && (
              <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-6 space-y-6">
                <div className="flex items-center gap-2 text-blue-400 border-b border-[#1e293b]/50 pb-2">
                  <ShieldAlert className="h-5 w-5" />
                  <span className="font-bold text-sm uppercase tracking-wider">{t("settings", "defaultMedicalContext")}</span>
                </div>

                <form onSubmit={handleSaveMedical} className="space-y-6">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("settings", "medicalContextDesc")}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">{t("settings", "defaultBloodType")}</label>
                      <select
                        className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
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
                      <label className="block text-xs font-semibold text-slate-400 mb-2">{t("settings", "allergiesWatchlist")}</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
                        placeholder={t("settings", "allergiesPlaceholder")}
                        value={allergiesWatchlist}
                        onChange={(e) => setAllergiesWatchlist(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/50 border border-[#2e3e56]/50 text-xs text-slate-400 flex gap-2">
                    <span className="text-yellow-500 font-bold uppercase select-none tracking-wider shrink-0 mt-0.5">{language === "bn" ? "দ্রষ্টব্য:" : "Note:"}</span>
                    <span>
                      {t("settings", "medicalNote")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    {medicalSuccess && (
                      <span className="text-xs text-green-400 font-bold flex items-center gap-1.5">
                        <ShieldCheck className="h-4.5 w-4.5" /> {t("settings", "medicalContextUpdated")}
                      </span>
                    )}
                    <div className="flex-1"></div>
                    <button
                      type="submit"
                      disabled={savingMedical}
                      className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 shadow-lg shadow-blue-500/10 transition-colors flex items-center gap-2"
                    >
                      {savingMedical ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : t("settings", "saveMedicalContext")}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeSubTab === "security" && (
              <div className="space-y-6">
                {/* 2FA Card */}
                <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">{t("settings", "twoFactorTitle")}</h3>
                    <p className="text-xs text-slate-400 mt-1">{t("settings", "twoFactorDesc")}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
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

                {/* Change Password Card */}
                <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-6 space-y-6">
                  <div className="flex items-center gap-2 text-blue-400 border-b border-[#1e293b]/50 pb-2">
                    <Key className="h-5 w-5" />
                    <span className="font-bold text-sm uppercase tracking-wider">{t("settings", "changePassword")}</span>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {passwordError && (
                      <div className="p-3 rounded-xl bg-red-955/50 text-red-400 text-xs border border-red-800/30">
                        {passwordError}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">{t("settings", "currentPassword")}</label>
                      <input
                        type="password"
                        required
                        className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">{t("settings", "newPassword")}</label>
                      <input
                        type="password"
                        required
                        className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      {passwordSuccess && (
                        <span className="text-xs text-green-400 font-bold flex items-center gap-1.5">
                          <ShieldCheck className="h-4.5 w-4.5" /> {t("settings", "passwordChanged")}
                        </span>
                      )}
                      <div className="flex-1"></div>
                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 shadow-lg shadow-blue-500/10 transition-colors flex items-center gap-2"
                      >
                        {savingPassword ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : t("settings", "updatePassword")}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeSubTab === "notifications" && (
              <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-6 space-y-6">
                <div className="flex items-center gap-2 text-blue-400 border-b border-[#1e293b]/50 pb-2">
                  <Bell className="h-5 w-5" />
                  <span className="font-bold text-sm uppercase tracking-wider">{t("settings", "notificationPreferences")}</span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-[#1e293b]/30">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{t("settings", "emailAlerts")}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{t("settings", "emailAlertsDesc")}</p>
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

                  <div className="flex justify-between items-center pb-4 border-b border-[#1e293b]/30">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{t("settings", "criticalTriggers")}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{t("settings", "criticalTriggersDesc")}</p>
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
                      <p className="text-[10px] text-slate-400 mt-1">{t("settings", "systemLogsDesc")}</p>
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
              </div>
            )}

            {activeSubTab === "language" && (
              <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-6 space-y-6">
                <div className="flex items-center gap-2 text-blue-400 border-b border-[#1e293b]/50 pb-2">
                  <Globe className="h-5 w-5" />
                  <span className="font-bold text-sm uppercase tracking-wider">{t("settings", "languageTitle")}</span>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t("settings", "languageDesc")}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* English Option */}
                    <button
                      onClick={() => setLanguage("en")}
                      className={`flex flex-col items-start text-left p-5 rounded-2xl border transition-all ${
                        language === "en"
                          ? "bg-blue-500/10 border-blue-500"
                          : "bg-[#0c101b] border-[#2e3e56] hover:border-blue-400/50"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-sm text-slate-200">{t("settings", "english")}</span>
                        {language === "en" && (
                          <span className="text-[10px] bg-blue-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                            {t("settings", "currentLanguage")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{t("settings", "englishDesc")}</p>
                    </button>

                    {/* Bangla Option */}
                    <button
                      onClick={() => setLanguage("bn")}
                      className={`flex flex-col items-start text-left p-5 rounded-2xl border transition-all ${
                        language === "bn"
                          ? "bg-blue-500/10 border-blue-500"
                          : "bg-[#0c101b] border-[#2e3e56] hover:border-blue-400/50"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-sm text-slate-200">{t("settings", "bangla")}</span>
                        {language === "bn" && (
                          <span className="text-[10px] bg-blue-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                            {t("settings", "currentLanguage")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{t("settings", "banglaDesc")}</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
