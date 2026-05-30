"use client";

import { useEffect, useState } from "react";
import { Lock, Clock, Calendar, ArrowRight } from "lucide-react";

interface Props {
  message?: string;
  futureStart?: string;
  endDate?: string;
}

function Countdown({ target }: { target: string }) {
  const [diff, setDiff] = useState(0);

  useEffect(() => {
    const t = new Date(target).getTime();
    const update = () => setDiff(Math.max(0, t - Date.now()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target]);

  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex gap-3 mt-6 justify-center flex-wrap">
      {[
        { label: "Days", value: days },
        { label: "Hours", value: hrs },
        { label: "Minutes", value: mins },
        { label: "Seconds", value: secs },
      ].map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center bg-[#131824] border border-[#1e293b] rounded-2xl px-5 py-4 min-w-[72px]">
          <span className="text-3xl font-bold text-[#9cbbf8] tabular-nums">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-xs text-[#64748b] mt-1 font-medium uppercase tracking-widest">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function DocsUnavailablePage({ message, futureStart, endDate }: Props) {
  const formatDate = (iso?: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Dhaka",
    });
  };

  return (
    <div className="min-h-screen bg-[#0c101b] flex items-center justify-center p-6">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#9cbbf8 1px, transparent 1px), linear-gradient(90deg, #9cbbf8 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-xl w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="h-10 w-10 shrink-0 bg-[#12243d] rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-500/10">
            <svg width="28" height="28" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="gNavDocsUnavailable" x1="0" y1="0" x2="110" y2="110" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#00d4ff"/>
                  <stop offset="100%" stopColor="#00ffa3"/>
                </linearGradient>
                <clipPath id="hcNavDocsUnavailable">
                  <path d="M55,38 C55,38 44,26 33,26 C20,26 11,36 11,48 C11,68 33,83 55,99 C77,83 99,68 99,48 C99,36 90,26 77,26 C66,26 55,38 55,38 Z"/>
                </clipPath>
              </defs>
              <circle cx="55" cy="57" r="6" fill="none" stroke="#00d4ff" strokeWidth="2" opacity="0"
                style={{ animation: "bloom 1.8s 2.6s ease-out infinite" }}/>
              <g style={{ transformOrigin: "55px 60px", animation: "heartbeat 1.8s 2.4s ease-in-out infinite" }}>
                <path d="M55,38 C55,38 44,26 33,26 C20,26 11,36 11,48 C11,68 33,83 55,99 C77,83 99,68 99,48 C99,36 90,26 77,26 C66,26 55,38 55,38 Z"
                  fill="#0a1828" stroke="url(#gNavDocsUnavailable)" strokeWidth="2.8"
                  strokeDasharray="320" strokeDashoffset="320"
                  style={{ animation: "heartDraw 1.2s cubic-bezier(.4,0,.2,1) 0.2s forwards" }}/>
              </g>
              <polyline points="11,57 28,57 36,57 42,40 48,74 53,40 59,57 99,57"
                fill="none" stroke="url(#gNavDocsUnavailable)" strokeWidth="2.8"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="220" strokeDashoffset="220"
                clipPath="url(#hcNavDocsUnavailable)"
                style={{ animation: "ecgIn 0.9s cubic-bezier(.4,0,.2,1) 1.5s forwards" }}/>
              <polyline points="11,57 28,57 36,57 42,40 48,74 53,40 59,57 99,57"
                fill="none" stroke="url(#gNavDocsUnavailable)" strokeWidth="2.8"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="220" strokeDashoffset="220"
                clipPath="url(#hcNavDocsUnavailable)" opacity="0"
                style={{ animation: "ecgLoop 1.8s 2.4s ease-in-out infinite" }}/>
            </svg>
          </div>
          <span className="text-white font-bold text-xl">ThinkCare AI</span>
        </div>

        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-[#131824] border border-[#1e293b] flex items-center justify-center mx-auto mb-6">
          <Lock className="w-9 h-9 text-[#9cbbf8]" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Documentation Unavailable</h1>
        <p className="text-[#64748b] text-base leading-relaxed mb-6">
          {message || "This documentation portal is not currently accessible."}
        </p>

        {/* Show window info */}
        {futureStart && (
          <div className="bg-[#131824] border border-[#1e293b] rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 text-[#9cbbf8] font-semibold mb-4 justify-center">
              <Clock className="w-4 h-4" />
              <span>Opens In</span>
            </div>
            <Countdown target={futureStart} />
            <div className="mt-5 flex flex-col gap-2 text-sm text-[#64748b]">
              <div className="flex items-center gap-2 justify-center">
                <Calendar className="w-3.5 h-3.5 text-[#9cbbf8]" />
                <span>Available from: <span className="text-white">{formatDate(futureStart)}</span></span>
              </div>
              {endDate && (
                <div className="flex items-center gap-2 justify-center">
                  <Calendar className="w-3.5 h-3.5 text-[#64748b]" />
                  <span>Until: <span className="text-white">{formatDate(endDate)}</span></span>
                </div>
              )}
            </div>
          </div>
        )}

        {!futureStart && endDate && (
          <div className="bg-[#131824] border border-[#1e293b] rounded-2xl p-4 mb-6 text-sm text-[#64748b]">
            <Calendar className="w-4 h-4 text-[#9cbbf8] inline mr-2" />
            The documentation window ended on{" "}
            <span className="text-white">{formatDate(endDate)}</span>.
          </div>
        )}

        <div className="flex gap-3 justify-center flex-wrap">
          <a
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#9cbbf8] text-[#0c101b] rounded-xl font-semibold text-sm hover:bg-[#82a5f5] transition-colors"
          >
            Go to App
            <ArrowRight className="w-4 h-4" />
          </a>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-[#131824] border border-[#1e293b] text-[#9cbbf8] rounded-xl font-semibold text-sm hover:border-[#9cbbf8] transition-colors"
          >
            Retry
          </button>
        </div>

        <p className="text-[#334155] text-xs mt-10">
          If you believe this is an error, contact the administrator.
        </p>
      </div>
    </div>
  );
}
