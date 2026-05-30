"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, Eye, EyeOff, Loader2, Check } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
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

      if (data.user.role !== "ADMIN") {
        throw new Error("Unauthorized access. Admin privileges required.");
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c101b] p-4 text-white">
      <div className="w-full max-w-md rounded-2xl bg-[#131824] p-8 border border-[#1e293b] shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white mb-4 shadow-lg shadow-blue-500/20">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-hanken">
            ThinkCare AI
          </h1>
          <p className="text-sm text-blue-400 font-semibold mt-2 tracking-wide text-center">
            Admin Portal Access
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/50 text-red-400 text-sm border border-red-800/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Admin ID
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <Shield className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
                placeholder="Enter your credentials"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Secure Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] pl-11 pr-12 py-3 text-white placeholder-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-slate-300"
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

          <div className="flex justify-between items-center text-xs font-medium">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-[#2e3e56] bg-[#0c101b] text-blue-500 focus:ring-0 focus:ring-offset-0"
              />
              Remember device
            </label>
            <Link href="#" className="text-blue-400 hover:text-blue-500">
              Recover Access
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center rounded-xl bg-[#9cbbf8] hover:bg-[#82a5f5] text-slate-950 font-semibold py-3.5 shadow-lg shadow-blue-500/10 transition-colors"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              "Sign In →"
            )}
          </button>
        </form>

        <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-[#2e3e56]/50 flex gap-3">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-950 text-green-400 border border-green-800/30">
            <Check className="h-3 w-3" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Two-Factor Authentication</h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              A secure token will be required upon successful credential validation.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-slate-500">
          Authorized personnel only. Activities are monitored.
        </p>
      </div>
    </div>
  );
}
