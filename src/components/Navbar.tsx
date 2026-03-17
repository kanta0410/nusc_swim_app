"use client";

import { useRouter } from "next/navigation";
import { LogOut, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  name: string;
  role: "admin" | "student";
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Navbar({ name, role, activeTab, onTabChange }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/login");
  };

  const isAdmin = role === "admin";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b shadow-sm",
        isAdmin
          ? "bg-blue-700 border-blue-800"
          : "bg-green-700 border-green-800"
      )}
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-white font-bold text-sm hidden sm:block">
              NUSC 部活動管理
            </span>
          </div>

          {/* Tabs (admin only) */}
          {isAdmin && onTabChange && (
            <div className="flex items-center gap-1 bg-blue-800/50 rounded-lg p-1">
              <button
                onClick={() => onTabChange("students")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  activeTab === "students"
                    ? "bg-white text-blue-700"
                    : "text-blue-100 hover:bg-blue-600/50"
                )}
              >
                <Users size={14} />
                生徒一覧
              </button>
              <button
                onClick={() => onTabChange("calendar")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  activeTab === "calendar"
                    ? "bg-white text-blue-700"
                    : "text-blue-100 hover:bg-blue-600/50"
                )}
              >
                <Calendar size={14} />
                カレンダー
              </button>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-xs hidden sm:block">{name}</span>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                isAdmin ? "bg-blue-500 text-white" : "bg-green-500 text-white"
              )}
            >
              {isAdmin ? "管理者" : "生徒"}
            </span>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="ログアウト"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
