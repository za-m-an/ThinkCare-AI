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
  Users,
  LogOut,
  User,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  BookOpen,
  Sun,
  Moon
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

interface SidebarProps {
  activeTab?: string;
  userRole?: string;
}

export default function Sidebar({ activeTab, userRole = "USER" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error("Failed to load user in sidebar", err);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
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
      show: userRole === "USER",
    },
    {
      name: t("nav", "assistant"),
      icon: MessageSquare,
      path: "/chat",
      show: userRole === "USER",
    },
    {
      name: t("nav", "profileReports"),
      icon: FileText,
      path: "/profile",
      show: userRole === "USER",
    },
    {
      name: t("nav", "settings"),
      icon: Settings,
      path: "/settings",
      show: true,
    },
    {
      name: t("nav", "adminPanel"),
      icon: Shield,
      path: "/admin/dashboard",
      show: userRole === "ADMIN" || currentUser?.role === "ADMIN",
    },
    {
      name: t("nav", "monitorUsers"),
      icon: Users,
      path: "/admin/users",
      show: userRole === "ADMIN" || currentUser?.role === "ADMIN",
    },
    {
      name: "Docs Control",
      icon: BookOpen,
      path: "/admin/dashboard/docs",
      show: userRole === "ADMIN" || currentUser?.role === "ADMIN",
    },
    {
      name: "Public Docs",
      icon: BookOpen,
      path: "/docs",
      show: userRole === "USER",
    },
  ];

  return (
    <>
      <aside
        className={`bg-[#0c101b] border-r border-[#1e293b] flex flex-col h-screen sticky top-0 shrink-0 text-white select-none transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-0 border-r-0 overflow-hidden" : "w-64"
        }`}
      >
        {/* Brand logo header */}
        <div className="p-6 border-b border-[#1e293b]/50 flex items-center justify-between gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0 flex-1">
            <img 
              src="/logo.png" 
              alt="TCA Logo" 
              className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-md shadow-blue-500/20" 
            />
            <div className="truncate">
              <h2 className="font-extrabold text-base tracking-tight leading-none truncate font-sans">ThinkCare AI</h2>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1 block truncate font-sans">
                {userRole === "ADMIN" ? t("common", "taglineAdmin") : t("common", "taglineUser")}
              </span>
            </div>
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-900/50 transition-colors shrink-0 cursor-pointer"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Main navigation list */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {userRole === "USER" && (
            <Link
              href="/chat?new=true"
              className="flex items-center justify-center gap-2 w-full py-3.5 px-4 mb-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/10 transition-all hover:scale-[1.02] font-sans"
            >
              <Plus className="h-4 w-4" />
              {t("nav", "newAssessment")}
            </Link>
          )}

          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all font-sans ${
                    isActive
                      ? "bg-[#131824] text-blue-400 border-l-4 border-blue-500 pl-3.5"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                  {item.name}
                </Link>
              );
            })}
        </nav>

        {/* Language & Theme Switchers */}
        <div className="px-4 pb-2 flex gap-2">
          <button
            onClick={() => setLanguage(language === "en" ? "bn" : "en")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-[#2e3e56] hover:border-blue-400/50 text-slate-400 hover:text-blue-400 text-[10px] font-bold transition-all cursor-pointer bg-[#0c101b]/50 hover:bg-[#131824]"
            title={language === "en" ? "Switch to Bangla" : "Switch to English"}
          >
            <Globe className="h-3.5 w-3.5" />
            {language === "en" ? "বাংলা" : "English"}
          </button>
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border border-[#2e3e56] hover:border-blue-400/50 text-slate-400 hover:text-blue-400 text-[10px] font-bold transition-all cursor-pointer bg-[#0c101b]/50 hover:bg-[#131824]"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-indigo-400" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>

        {/* Sidebar footer user metadata and logout */}
        <div className="p-4 border-t border-[#1e293b]/50 bg-slate-950/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-800 border border-[#2e3e56] flex items-center justify-center text-blue-400 font-bold font-sans">
                {currentUser?.fullName ? currentUser.fullName.charAt(0) : "U"}
              </div>
              <div className="truncate w-28">
                <p className="text-xs font-bold truncate leading-none text-slate-200 font-sans">
                  {currentUser?.fullName || "User"}
                </p>
                <span className="text-[10px] text-slate-500 font-semibold block mt-1 uppercase tracking-widest truncate font-sans">
                  {currentUser?.role || "USER"}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-900/50 cursor-pointer"
              title={t("common", "logout")}
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>
      {isCollapsed && (
        <button
          onClick={toggleSidebar}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-[#0c101b]/95 backdrop-blur border-y border-r border-[#1e293b]/80 text-slate-400 hover:text-white px-1.5 py-4 rounded-r-xl shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          title="Expand sidebar"
        >
          <PanelLeftOpen className="h-4.5 w-4.5" />
        </button>
      )}
    </>
  );
}
