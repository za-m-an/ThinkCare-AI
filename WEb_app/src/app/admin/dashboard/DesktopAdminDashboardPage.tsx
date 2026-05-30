"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Users,
  Activity,
  LineChart,
  Settings,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Lock,
  Search,
  Sliders
} from "lucide-react";

interface LogEntry {
  id: string;
  modelType: string;
  confidence: number;
  latency: number;
  status: string;
  patientName: string;
  condition: string;
}

function getSparklinePath(data: number[], width = 100, height = 30) {
  if (!data || data.length < 2) return `M 0 ${height / 2} L ${width} ${height / 2}`;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  
  return data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      // Invert Y because SVG 0 is at top
      const y = height - ((val - min) / range) * (height - 10) - 5;
      return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function DesktopAdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Configurations
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [autoScaling, setAutoScaling] = useState(true);
  const [standardFallback, setStandardFallback] = useState(false);
  const [diagnosisThreshold, setDiagnosisThreshold] = useState(85);
  const [humanReviewThreshold, setHumanReviewThreshold] = useState(60);
  const [modelMode, setModelMode] = useState("catboost");
  const [searchQuery, setSearchQuery] = useState("");

  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Load configurations
        const configRes = await fetch("/api/admin/config");
        const configData = await configRes.json();
        if (configRes.ok && configData.configs) {
          const cfg = configData.configs;
          setGeminiApiKey(cfg.gemini_api_key || "");
          setAutoScaling(cfg.model_auto_scaling === "true");
          setStandardFallback(cfg.model_standard_fallback === "true");
          setDiagnosisThreshold(parseInt(cfg.diagnosis_actionable_threshold) || 85);
          setHumanReviewThreshold(parseInt(cfg.human_review_flag_threshold) || 60);
          setModelMode(cfg.active_model_mode || "catboost");
        }

        // Load stats
        const statsRes = await fetch("/api/admin/stats");
        const statsData = await statsRes.json();
        if (statsRes.ok) {
          setStats(statsData.stats);
          setLogs(statsData.logs || []);
        }
      } catch (err) {
        console.error("Admin stats failed to load", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.id.toLowerCase().includes(q) ||
      log.modelType.toLowerCase().includes(q) ||
      log.status.toLowerCase().includes(q) ||
      (log.condition && log.condition.toLowerCase().includes(q)) ||
      (log.patientName && log.patientName.toLowerCase().includes(q))
    );
  });

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setConfigSuccess(false);

    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gemini_api_key: geminiApiKey,
          model_auto_scaling: autoScaling ? "true" : "false",
          model_standard_fallback: standardFallback ? "true" : "false",
          diagnosis_actionable_threshold: String(diagnosisThreshold),
          human_review_flag_threshold: String(humanReviewThreshold),
          active_model_mode: modelMode,
        }),
      });

      if (res.ok) {
        setConfigSuccess(true);
        setTimeout(() => setConfigSuccess(false), 3000);
      } else {
        alert("Failed to save configuration settings.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving configurations.");
    } finally {
      setSavingConfig(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c101b] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  // Latency trend values
  const latencyTrend = stats?.latencyTrend || [0.8, 1.2, 0.9, 1.5, 0.7, 1.1, 0.6];

  return (
    <div className="flex min-h-screen bg-[#0c101b] text-white font-sans">
      <Sidebar activeTab="Admin Panel" userRole="ADMIN" />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#1e293b]/50 px-8 py-5 shrink-0 bg-[#0c101b]/80 backdrop-blur sticky top-0 z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Admin System Panel</h1>
            <p className="text-xs text-slate-400 mt-1">Monitor real-time AI usage, API calls, server performance, and active model toggles.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5" />
              Secure Superuser Session
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Quick Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users */}
            <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-5 flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Total Registrations</span>
                <span className="text-2xl font-extrabold text-slate-200 mt-2 block">{stats?.totalUsers || 0}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/10">
                <Users className="h-5 w-5" />
              </div>
            </div>

            {/* Total Requests */}
            <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-5 flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">AI Requests</span>
                <span className="text-2xl font-extrabold text-slate-200 mt-2 block">{stats?.totalRequests || 0}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/10">
                <Activity className="h-5 w-5" />
              </div>
            </div>

            {/* Average Latency */}
            <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-5 flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Average Latency</span>
                <span className="text-2xl font-extrabold text-slate-200 mt-2 block">
                  {stats?.avgLatency ? parseFloat(stats.avgLatency).toFixed(2) : "0.00"} <span className="text-xs text-slate-500 font-normal">sec</span>
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center border border-yellow-500/10">
                <LineChart className="h-5 w-5" />
              </div>
            </div>

            {/* Critical Alert Flags */}
            <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-5 flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Critical Flags</span>
                <span className="text-2xl font-extrabold text-red-400 mt-2 block">{stats?.criticalFlags || 0}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/10">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System config inputs form */}
            <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2 border-b border-[#1e293b]/50 pb-3">
                <Settings className="h-5 w-5 text-blue-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">System Configurations</h3>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-5">
                {/* Mode Select toggle */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Active Inference Model</label>
                  <select
                    className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
                    value={modelMode}
                    onChange={(e) => setModelMode(e.target.value)}
                  >
                    <option value="catboost">CatBoost + Gemini Clarifying (Mode 1)</option>
                    <option value="slm">Direct Bilingual Qwen2.5-SLM (Mode 2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Gemini API Key</label>
                  <div className="relative">
                    <input
                      type="password"
                      className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] pl-4 pr-10 py-3 text-xs text-white focus:border-blue-400 focus:outline-none transition-colors"
                      placeholder="AIzaSy..."
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                    />
                    <Lock className="h-4 w-4 text-slate-500 absolute right-3.5 top-3.5" />
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 block">Used for fallback predictions and summaries.</span>
                </div>

                <div className="pt-2 border-t border-[#1e293b]/40 my-4" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-300 block">Model Auto-Scaling</span>
                      <span className="text-[9px] text-slate-500">Auto-shift to CPU on CUDA memory overflow.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoScaling(!autoScaling)}
                      className={`h-6 w-11 rounded-full relative transition-colors ${
                        autoScaling ? "bg-blue-500" : "bg-[#0c101b] border border-[#2e3e56]"
                      }`}
                    >
                      <span
                        className={`h-4.5 w-4.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          autoScaling ? "right-0.5 translate-x-0" : "left-0.5 translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-300 block">Standard Fallback Mode</span>
                      <span className="text-[9px] text-slate-500">Use pre-cached responses when servers time out.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStandardFallback(!standardFallback)}
                      className={`h-6 w-11 rounded-full relative transition-colors ${
                        standardFallback ? "bg-blue-500" : "bg-[#0c101b] border border-[#2e3e56]"
                      }`}
                    >
                      <span
                        className={`h-4.5 w-4.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          standardFallback ? "right-0.5 translate-x-0" : "left-0.5 translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1e293b]/40 my-4" />

                {/* Slider values */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-1.5">
                      <span>Actionable Diagnosis Threshold</span>
                      <span className="text-blue-400 font-bold">{diagnosisThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      className="w-full h-1 bg-[#0c101b] rounded-lg appearance-none cursor-pointer accent-blue-400"
                      value={diagnosisThreshold}
                      onChange={(e) => setDiagnosisThreshold(parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-1.5">
                      <span>Human Review Flag Threshold</span>
                      <span className="text-blue-400 font-bold">{humanReviewThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="80"
                      className="w-full h-1 bg-[#0c101b] rounded-lg appearance-none cursor-pointer accent-blue-400"
                      value={humanReviewThreshold}
                      onChange={(e) => setHumanReviewThreshold(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingConfig}
                  className="w-full py-3.5 rounded-xl bg-[#9cbbf8] hover:bg-[#82a5f5] text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  {savingConfig ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    "Apply Changes"
                  )}
                </button>

                {configSuccess && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-center text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4" />
                    System configuration updated successfully.
                  </div>
                )}
              </form>
            </div>

            {/* Performance charts and diagnostic logs list */}
            <div className="lg:col-span-2 space-y-6">
              {/* Latency sparkline card */}
              <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-6 shadow-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Server Latency Trend</h4>
                  <span className="text-[10px] text-slate-500 mt-1 block">Past 10 minutes inference transactions</span>
                </div>
                <svg className="h-10 w-28 text-blue-500 overflow-visible">
                  <path
                    d={getSparklinePath(latencyTrend, 112, 35)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Real-time Diagnostics Log */}
              <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#1e293b]/50 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-blue-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Real-Time Log Stream</h3>
                  </div>

                  <div className="relative w-48">
                    <input
                      type="text"
                      className="w-full rounded-lg border border-[#2e3e56] bg-[#0c101b] pl-8 pr-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-blue-400"
                      placeholder="Search log items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#1e293b] text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                        <th className="pb-3 pl-2">Request ID</th>
                        <th className="pb-3">Patient</th>
                        <th className="pb-3">Model Type</th>
                        <th className="pb-3">Condition Detected</th>
                        <th className="pb-3">Conf %</th>
                        <th className="pb-3">Latency</th>
                        <th className="pb-3 pr-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e293b]/30">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500 leading-normal">
                            No logs matched the search queries.
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-900/10 transition-colors">
                            <td className="py-3 pl-2 font-mono text-[10px] text-slate-400">{log.id}</td>
                            <td className="py-3 font-semibold text-slate-200">{log.patientName || "--"}</td>
                            <td className="py-3 text-[10px] text-slate-500 uppercase font-semibold">{log.modelType}</td>
                            <td className="py-3 font-semibold text-blue-400">{log.condition || "Clarification needed"}</td>
                            <td className="py-3 font-bold text-slate-200">
                              {log.confidence ? `${(log.confidence).toFixed(1)}%` : "--"}
                            </td>
                            <td className="py-3 text-slate-400">{log.latency.toFixed(2)}s</td>
                            <td className="py-3 pr-2 text-right">
                              <span
                                className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold tracking-wide ${
                                  log.status === "SUCCESS"
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                }`}
                              >
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
