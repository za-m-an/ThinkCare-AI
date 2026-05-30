"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function UserLoginPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Check role
      if (data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        if (data.user.isOnboarded) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-50 via-slate-100 to-blue-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-100 relative">
        {/* Language Toggle */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setLanguage(language === "en" ? "bn" : "en")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-500 text-[10px] font-bold transition-all cursor-pointer bg-white"
          >
            <span>{language === "en" ? "বাংলা" : "English"}</span>
          </button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white mb-4 shadow-md">
            <svg
              className="h-6 w-6"
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
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight font-hanken">
            {t("login", "title")}
          </h1>
          <p className="text-sm text-slate-500 mt-2 text-center">
            {t("login", "subtitle")}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {t("login", "emailLabel")}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-xs"
                placeholder={t("login", "emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("login", "passwordLabel")}
              </label>
              <Link
                href="#"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                {t("login", "forgotPassword")}
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 py-3 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors text-xs"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 shadow-md shadow-blue-200 transition-colors text-xs"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              t("login", "signIn")
            )}
          </button>
        </form>

        {/* Google OAuth Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative bg-white px-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            {t("common", "or")}
          </span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => {
            window.location.href = "/api/auth/google";
          }}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 text-xs transition-colors shadow-sm cursor-pointer"
        >
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {t("login", "signInWithGoogle")}
        </button>

        <p className="mt-8 text-center text-sm text-slate-600">
          {t("login", "noAccount")}{" "}
          <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700">
            {t("login", "register")}
          </Link>
        </p>

        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col items-center">
          <div className="flex items-center text-slate-400 text-xs mb-2">
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              ></path>
            </svg>
            {t("common", "secureEnvironment")}
          </div>
          <p className="text-[10px] text-slate-400 text-center max-w-[280px]">
            {t("common", "termsAgreement")}
          </p>
        </div>
      </div>
    </div>
  );
}
