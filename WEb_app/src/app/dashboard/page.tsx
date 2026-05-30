"use client";

import { useDevice } from "@/hooks/useDevice";
import DesktopDashboardPage from "./DesktopDashboardPage";
import MobileDashboardPage from "./MobileDashboardPage";
import { Loader2 } from "lucide-react";

export default function DashboardRoutePage() {
  const { isMobile, isLoaded } = useDevice();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c101b] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return isMobile ? <MobileDashboardPage /> : <DesktopDashboardPage />;
}
