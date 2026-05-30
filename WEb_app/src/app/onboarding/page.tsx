"use client";

import { useDevice } from "@/hooks/useDevice";
import DesktopOnboardingPage from "./DesktopOnboardingPage";
import MobileOnboardingPage from "./MobileOnboardingPage";
import { Loader2 } from "lucide-react";

export default function OnboardingRoutePage() {
  const { isMobile, isLoaded } = useDevice();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c101b] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return isMobile ? <MobileOnboardingPage /> : <DesktopOnboardingPage />;
}
