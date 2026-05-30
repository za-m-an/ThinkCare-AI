"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Calendar, Clock, Save, CheckCircle2,
  AlertCircle, Loader2, ExternalLink, Settings2, Users,
  ChevronLeft, ToggleLeft, ToggleRight, RefreshCw,
} from "lucide-react";

interface DocsConfig {
  id: number;
  isEnabled: boolean;
  startDate: string;
  endDate: string;
  updatedBy: string;
  updatedAt: string;
}

interface SaveState { status: "idle" | "saving" | "saved" | "error"; message?: string }

const toLocalInput = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const toISO = (local: string) => new Date(local).toISOString();

export default function AdminDocsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<DocsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [now, setNow] = useState(new Date());

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/docs/config");
      if (!r.ok) throw new Error();
      const { config: cfg } = await r.json();
      setConfig(cfg);
      setIsEnabled(cfg.isEnabled);
      setStartInput(toLocalInput(cfg.startDate));
      setEndInput(toLocalInput(cfg.endDate));
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const save = async (overrideEnabled?: boolean) => {
    setSaveState({ status: "saving" });
    try {
      const body: Record<string, unknown> = {
        isEnabled: overrideEnabled !== undefined ? overrideEnabled : isEnabled,
      };
      if (startInput) body.startDate = toISO(startInput);
      if (endInput) body.endDate = toISO(endInput);

      const r = await fetch("/api/admin/docs/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();
      await fetchConfig();
      setSaveState({ status: "saved", message: "Configuration saved." });
      setTimeout(() => setSaveState({ status: "idle" }), 3000);
    } catch {
      setSaveState({ status: "error", message: "Save failed. Try again." });
    }
  };

  const toggleEnable = async (val: boolean) => {
    setIsEnabled(val);
    await save(val);
  };

  // Compute live status
  const getStatus = (): { label: string; color: string; desc: string } => {
    if (!config) return { label: "Unknown", color: "#64748b", desc: "" };
    if (config.isEnabled) return { label: "Enabled (Always On)", color: "#00b86b", desc: "Docs are publicly accessible 24/7." };
    const start = new Date(config.startDate);
    const end = new Date(config.endDate);
    if (now < start) return { label: "Scheduled", color: "#f59e0b", desc: `Opens ${start.toLocaleString()}` };
    if (now >= start && now <= end) return { label: "Accessible (Window Active)", color: "#00b86b", desc: `Closes ${end.toLocaleString()}` };
    return { label: "Window Closed", color: "#f87171", desc: `Ended ${end.toLocaleString()}` };
  };

  const status = getStatus();

  const presetJudgingWindow = () => {
    setStartInput("2026-06-10T00:00");
    setEndInput("2026-06-14T23:59");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#9cbbf8] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c101b] text-white">
      {/* Header */}
      <div className="border-b border-[#1e293b] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="text-[#64748b] hover:text-white transition-colors flex items-center gap-1.5 text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Admin Dashboard
          </button>
          <div className="w-px h-4 bg-[#1e293b]" />
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[#9cbbf8]" />
            <span className="font-semibold">Docs Module Control</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/docs"
            target="_blank"
            className="flex items-center gap-2 text-xs text-[#64748b] hover:text-[#9cbbf8] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />Preview /docs
          </a>
          <button
            onClick={fetchConfig}
            className="text-[#64748b] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-[#131824]"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Save feedback */}
        {saveState.status !== "idle" && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
            saveState.status === "saving" ? "bg-[#131824] border border-[#1e293b] text-[#64748b]"
            : saveState.status === "saved" ? "bg-emerald-400/10 border border-emerald-400/20 text-emerald-400"
            : "bg-red-400/10 border border-red-400/20 text-red-400"
          }`}>
            {saveState.status === "saving" && <Loader2 className="w-4 h-4 animate-spin" />}
            {saveState.status === "saved" && <CheckCircle2 className="w-4 h-4" />}
            {saveState.status === "error" && <AlertCircle className="w-4 h-4" />}
            {saveState.message || "Saving..."}
          </div>
        )}

        {/* Live Status Card */}
        <div className="bg-[#131824] border border-[#1e293b] rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[#64748b] text-xs font-semibold uppercase tracking-widest mb-2">Live Status</div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: status.color }} />
                <span className="text-white font-bold text-lg">{status.label}</span>
              </div>
              <p className="text-[#64748b] text-sm">{status.desc}</p>
            </div>
            <div className="text-right">
              <div className="text-[#64748b] text-xs font-semibold uppercase tracking-widest mb-1">Current Time (BD)</div>
              <div className="text-white font-mono text-sm">
                {now.toLocaleString("en-BD", { timeZone: "Asia/Dhaka", hour12: false })}
              </div>
              {config && (
                <div className="text-[#64748b] text-xs mt-1">
                  Last updated by: <span className="text-white">{config.updatedBy}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visibility Toggle */}
        <div className="bg-[#131824] border border-[#1e293b] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-white font-bold mb-1 flex items-center gap-2">
                {isEnabled ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-[#64748b]" />}
                Always-On Toggle
              </div>
              <p className="text-[#64748b] text-sm">
                {isEnabled
                  ? "Docs are publicly accessible regardless of schedule."
                  : "Docs follow the scheduled window below. Toggle ON to make always accessible."}
              </p>
            </div>
            <button
              onClick={() => toggleEnable(!isEnabled)}
              className="flex-shrink-0 ml-4"
            >
              {isEnabled
                ? <ToggleRight className="w-12 h-12 text-emerald-400" />
                : <ToggleLeft className="w-12 h-12 text-[#64748b]" />}
            </button>
          </div>
        </div>

        {/* Scheduling */}
        <div className="bg-[#131824] border border-[#1e293b] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-4 h-4 text-[#9cbbf8]" />
            <h2 className="text-white font-bold">Availability Window</h2>
          </div>
          <p className="text-[#64748b] text-sm mb-6">
            When &ldquo;Always-On&rdquo; is OFF, docs are only accessible within this date window. All times are in your local timezone.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="text-[#64748b] text-xs font-semibold uppercase tracking-widest mb-2 block flex items-center gap-1.5">
                <Clock className="w-3 h-3" />Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                className="w-full bg-[#0c101b] border border-[#1e293b] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#9cbbf8]/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[#64748b] text-xs font-semibold uppercase tracking-widest mb-2 block flex items-center gap-1.5">
                <Clock className="w-3 h-3" />End Date & Time
              </label>
              <input
                type="datetime-local"
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
                className="w-full bg-[#0c101b] border border-[#1e293b] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#9cbbf8]/50 transition-colors"
              />
            </div>
          </div>

          {/* Quick preset */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="text-[#64748b] text-xs">Quick presets:</span>
            <button
              onClick={presetJudgingWindow}
              className="px-3 py-1.5 bg-[#9cbbf8]/10 border border-[#9cbbf8]/20 text-[#9cbbf8] rounded-lg text-xs font-medium hover:bg-[#9cbbf8]/20 transition-colors"
            >
              📅 Judging Window (June 10–14)
            </button>
          </div>

          {/* Current window display */}
          {config && (
            <div className="bg-[#0c101b] border border-[#1e293b] rounded-xl px-4 py-3 text-xs text-[#64748b] mb-6">
              <span className="text-white font-semibold">Currently saved: </span>
              {new Date(config.startDate).toLocaleString()} → {new Date(config.endDate).toLocaleString()}
            </div>
          )}

          <button
            onClick={() => save()}
            disabled={saveState.status === "saving"}
            className="flex items-center gap-2 px-6 py-3 bg-[#9cbbf8] text-[#0c101b] rounded-xl font-bold text-sm hover:bg-[#82a5f5] transition-colors disabled:opacity-50"
          >
            {saveState.status === "saving" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Configuration
          </button>
        </div>

        {/* Link to /docs */}
        <div className="bg-[#131824] border border-[#1e293b] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <ExternalLink className="w-4 h-4 text-[#9cbbf8]" />
            <h2 className="text-white font-bold">Quick Actions</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/docs"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#9cbbf8]/10 border border-[#9cbbf8]/20 text-[#9cbbf8] rounded-xl text-sm font-medium hover:bg-[#9cbbf8]/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />Open /docs in new tab
            </a>
            <a
              href="/api/docs/access"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#131824] border border-[#1e293b] text-[#64748b] rounded-xl text-sm font-medium hover:text-white hover:border-[#334155] transition-colors"
            >
              <Settings2 className="w-4 h-4" />Check access API
            </a>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-[#0c101b] border border-[#1e293b] rounded-2xl p-5 text-sm text-[#64748b]">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#9cbbf8] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-1">How visibility works</p>
              <ul className="space-y-1.5 list-none">
                <li>• <strong className="text-white">Always-On = ON</strong> → /docs is always publicly accessible</li>
                <li>• <strong className="text-white">Always-On = OFF + within window</strong> → /docs is accessible</li>
                <li>• <strong className="text-white">Always-On = OFF + outside window</strong> → /docs shows &ldquo;Not Available&rdquo; with a countdown timer</li>
                <li>• You can change settings at any time — changes take effect immediately</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
