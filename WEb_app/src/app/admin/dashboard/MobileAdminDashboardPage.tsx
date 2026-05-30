"use client";

import { useEffect, useState } from "react";
import MobileNavBar from "@/components/MobileNavBar";
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
  ChevronDown,
  ChevronUp
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
      const y = height - ((val - min) / range) * (height - 10) - 5;
      return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function MobileAdminDashboardPage() {
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

  // Expandable logs
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Expandable config section on mobile
  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
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
        alert("Failed to save config.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingConfig(false);
    }
  };

  const toggleExpandLog = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c101b] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const latencyTrend = stats?.latencyTrend || [0.8, 1.2, 0.9, 1.5, 0.7, 1.1, 0.6];

  return (
    <div className="flex min-h-screen flex-col bg-[#0c101b] text-white font-sans pb-[68px]">
      
      {/* Mobile Top Bar */}
      <header className="flex items-center justify-between border-b border-[#1e293b]/50 px-5 py-4 bg-[#0c101b]/95 sticky top-0 z-30 shrink-0">
        <div>
          <h1 className="text-sm font-extrabold tracking-tight">Admin System</h1>
        </div>
        <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          Admin Session
        </span>
      </header>

      {/* Grid Content */}
      <div className="p-4 space-y-4">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#131824] rounded-xl border border-[#1e293b] p-4 flex items-center justify-between shadow-md">
            <div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Users</span>
              <span className="text-lg font-black text-slate-200 mt-1 block">{stats?.totalUsers || 0}</span>
            </div>
            <Users className="h-4.5 w-4.5 text-blue-400 shrink-0" />
          </div>

          <div className="bg-[#131824] rounded-xl border border-[#1e293b] p-4 flex items-center justify-between shadow-md">
            <div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Inferences</span>
              <span className="text-lg font-black text-slate-200 mt-1 block">{stats?.totalRequests || 0}</span>
            </div>
            <Activity className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
          </div>

          <div className="bg-[#131824] rounded-xl border border-[#1e293b] p-4 flex items-center justify-between shadow-md">
            <div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Avg Latency</span>
              <span className="text-lg font-black text-slate-200 mt-1 block">
                {stats?.avgLatency ? parseFloat(stats.avgLatency).toFixed(2) : "0.00"}s
              </span>
            </div>
            <LineChart className="h-4.5 w-4.5 text-yellow-400 shrink-0" />
          </div>

          <div className="bg-[#131824] rounded-xl border border-[#1e293b] p-4 flex items-center justify-between shadow-md">
            <div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Critical Flags</span>
              <span className="text-lg font-black text-red-400 mt-1 block">{stats?.criticalFlags || 0}</span>
            </div>
            <AlertTriangle className="h-4.5 w-4.5 text-red-400 shrink-0" />
          </div>
        </div>

        {/* Latency sparkline card */}
        <div className="bg-[#131824] rounded-xl border border-[#1e293b] p-4 flex items-center justify-between">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Server Latency trend</h4>
            <span className="text-[8px] text-slate-500">Inference transaction graph</span>
          </div>
          <svg className="h-8 w-24 text-blue-500 overflow-visible">
            <path
              d={getSparklinePath(latencyTrend, 96, 30)}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* System configurations */}
        <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-4 shadow-xl space-y-3">
          <button
            onClick={() => setConfigOpen(!configOpen)}
            className="w-full flex items-center justify-between border-b border-[#1e293b]/40 pb-2 text-slate-200"
          >
            <div className="flex items-center gap-1.5">
              <Settings className="h-4.5 w-4.5 text-blue-400" />
              <span className="font-bold text-[10px] uppercase tracking-wider">System Toggles</span>
            </div>
            {configOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {configOpen && (
            <form onSubmit={handleSaveConfig} className="space-y-4 pt-2">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 mb-1.5 uppercase">Model Mode</label>
                <select
                  className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] px-4 py-2.5 text-xs text-white"
                  value={modelMode}
                  onChange={(e) => setModelMode(e.target.value)}
                >
                  <option value="catboost">CatBoost + Gemini Mode</option>
                  <option value="slm">Direct Bilingual Qwen2.5 Mode</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 mb-1.5 uppercase">Gemini API Key</label>
                <div className="relative">
                  <input
                    type="password"
                    className="w-full rounded-xl border border-[#2e3e56] bg-[#0c101b] pl-4 pr-10 py-2.5 text-xs text-white"
                    placeholder="AIzaSy..."
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                  />
                  <Lock className="h-4 w-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                  <span>Diagnosis Action Limit</span>
                  <span className="text-blue-400">{diagnosisThreshold}%</span>
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
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                  <span>Human Review Limit</span>
                  <span className="text-blue-400">{humanReviewThreshold}%</span>
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

              <button
                type="submit"
                disabled={savingConfig}
                className="w-full py-2.5 rounded-xl bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
              >
                {savingConfig ? <Loader2 className="h-4.5 w-4.5 animate-spin mx-auto" /> : "Apply Settings"}
              </button>

              {configSuccess && (
                <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/25 text-green-400 text-center text-xs font-semibold">
                  Configs updated successfully.
                </div>
              )}
            </form>
          )}
        </div>

        {/* Real-time Diagnostics Log Stream */}
        <div className="bg-[#131824] rounded-2xl border border-[#1e293b] p-4 shadow-xl space-y-4">
          <div className="flex flex-col gap-2 border-b border-[#1e293b]/40 pb-3">
            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-200">Diagnostics Stream</span>
            
            <div className="relative w-full">
              <input
                type="text"
                className="w-full rounded-lg border border-[#2e3e56] bg-[#0c101b] pl-8 pr-3 py-1.5 text-xs text-white"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2" />
            </div>
          </div>

          {/* Cards for logs instead of table */}
          <div className="space-y-2">
            {filteredLogs.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6">No logs matched search.</p>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div
                    key={log.id}
                    onClick={() => toggleExpandLog(log.id)}
                    className="p-3.5 rounded-xl bg-[#0c101b] border border-[#1e293b] space-y-2 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-slate-500">{log.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider ${
                          log.status === "SUCCESS" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-200">{log.patientName || "Anonymous"}</span>
                      <span className="font-bold text-blue-400">{log.condition || "Symptom clarification"}</span>
                    </div>

                    {isExpanded && (
                      <div className="pt-2 border-t border-[#1e293b]/40 text-[10px] space-y-2.5 text-slate-400 leading-normal animate-in fade-in">
                        <div className="flex justify-between">
                          <span>Model Pipeline</span>
                          <span className="text-slate-200 uppercase font-semibold">{log.modelType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence Score</span>
                          <span className="text-slate-200 font-bold">{log.confidence ? `${log.confidence.toFixed(1)}%` : "--"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Inference Latency</span>
                          <span className="text-slate-200">{log.latency.toFixed(2)}s</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Navigation Tab Bar */}
      <MobileNavBar />
    </div>
  );
}
