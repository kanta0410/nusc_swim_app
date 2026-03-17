"use client";

import { useRouter } from "next/navigation";
import { LogOut, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  name: string;
  role: "admin" | "student";
}

export default function Navbar({ name, role }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/login");
    router.refresh();
  };

  const isAdmin = role === "admin";

  return (
    <header className={cn(
      "sticky top-0 z-40 border-b shadow-sm",
      isAdmin ? "bg-blue-600 border-blue-700" : "bg-green-600 border-green-700"
    )}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white text-xs font-bold">N</span>
          </div>
          <span className="text-white font-semibold text-sm hidden sm:block">NUSC 部活動管理</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-2.5 py-1.5">
            {isAdmin ? <Shield size={14} className="text-white" /> : <User size={14} className="text-white" />}
            <span className="text-white text-sm font-medium">{name}</span>
            <span className="text-white/70 text-xs">
              {isAdmin ? "（管理者）" : "（生徒）"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <LogOut size={14} className="text-white" />
            <span className="text-white text-sm hidden sm:block">ログアウト</span>
          </button>
        </div>
      </div>
    </header>
  );
}
