"use client";

import { useDevice } from "@/hooks/useDevice";
import DesktopChatPage from "./DesktopChatPage";
import MobileChatPage from "./MobileChatPage";
import { Loader2 } from "lucide-react";

export default function ChatPage() {
  const { isMobile, isLoaded } = useDevice();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c101b] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return isMobile ? <MobileChatPage /> : <DesktopChatPage />;
}
