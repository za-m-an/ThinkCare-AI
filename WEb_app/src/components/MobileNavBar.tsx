"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  Shield,
  LogOut
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MobileNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error("Failed to load user in mobile navbar", err);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to log out?")) return;
    try {
      const res = await fetch("/api/auth/me"); // First load state
      const logoutRes = await fetch("/api/auth/logout", { method: "POST" });
      if (logoutRes.ok) {
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const navItems = [
    {
      name: t("nav", "dashboard"),
      icon: LayoutDashboard,
      path: "/dashboard",
      show: currentUser?.role === "USER" || !currentUser,
    },
    {
      name: t("nav", "assistant"),
      icon: MessageSquare,
      path: "/chat",
      show: currentUser?.role === "USER" || !currentUser,
    },
    {
      name: t("nav", "profile"),
      icon: FileText,
      path: "/profile",
      show: currentUser?.role === "USER" || !currentUser,
    },
    {
      name: t("nav", "settings"),
      icon: Settings,
      path: "/settings",
      show: true,
    },
    {
      name: t("nav", "admin"),
      icon: Shield,
      path: "/admin/dashboard",
      show: currentUser?.role === "ADMIN",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0c101b]/95 backdrop-blur-lg border-t border-[#1e293b]/80 py-2 px-6 flex items-center justify-between z-50 shadow-2xl">
      {navItems
        .filter((item) => item.show)
        .map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-1.5 py-1 px-3 text-[10px] font-bold tracking-wide transition-all ${
                isActive ? "text-blue-400 font-extrabold" : "text-slate-400"
              }`}
            >
              <item.icon className={`h-5.5 w-5.5 transition-transform ${isActive ? "scale-110 text-blue-400" : "text-slate-400"}`} />
              <span className="font-sans">{item.name}</span>
            </Link>
          );
        })}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-1.5 py-1 px-3 text-[10px] font-bold tracking-wide text-slate-400 hover:text-red-400 transition-all cursor-pointer"
      >
        <LogOut className="h-5.5 w-5.5 text-slate-400 hover:text-red-400" />
        <span className="font-sans">{t("common", "logout")}</span>
      </button>
    </nav>
  );
}
