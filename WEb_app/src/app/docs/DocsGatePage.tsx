"use client";

import { useEffect, useState } from "react";
import DocsViewerPage from "./DocsViewerPage";
import DocsUnavailablePage from "./DocsUnavailablePage";
import { Loader2 } from "lucide-react";

interface AccessResponse {
  accessible: boolean;
  message?: string;
  futureStart?: string;
  endDate?: string;
}

export default function DocsGatePage() {
  const [access, setAccess] = useState<AccessResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/docs/access")
      .then((r) => r.json())
      .then((data: AccessResponse) => {
        setAccess(data);
        setLoading(false);
      })
      .catch(() => {
        setAccess({ accessible: false, message: "Unable to connect." });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c101b]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#9cbbf8] animate-spin" />
          <p className="text-[#64748b] text-sm font-medium tracking-wide">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!access?.accessible) {
    return (
      <DocsUnavailablePage
        message={access?.message}
        futureStart={access?.futureStart}
        endDate={access?.endDate}
      />
    );
  }

  return <DocsViewerPage />;
}
