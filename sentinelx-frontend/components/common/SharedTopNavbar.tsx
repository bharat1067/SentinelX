"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user.store";
import { useThemeStore } from "@/stores/theme.store";
import { useLayoutStore } from "@/stores/layout.store";
import { IconRegistry } from "@/constants/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, LayoutGrid, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";

export const SharedTopNavbar: React.FC = () => {
  const router = useRouter();
  const { activePersona, logout } = useUserStore();
  const { theme, toggleTheme } = useThemeStore();
  const { toggleRightPanel } = useLayoutStore();

  const [currentTime, setCurrentTime] = useState("14:04:35");

  useEffect(() => {
    // Dynamic time tick
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toTimeString().split(" ")[0]
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const SunIcon = IconRegistry.Sun;
  const MoonIcon = IconRegistry.Moon;

  return (
    <header className="h-12 border-b border-[#1f2937] bg-[#0c101d] px-4 flex items-center justify-between shrink-0 select-none z-10">
      {/* Brand Logo */}
      <div className="flex items-center gap-2">
        <IconRegistry.Security className="h-4 w-4 text-[#ef4444]" />
        <span className="text-sm font-bold tracking-wider text-slate-100 uppercase font-sans">
          SentinelX
        </span>
        <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-[#1f2937] px-1.5 py-0.25 rounded">
          v1.0.0-MVP
        </span>
      </div>

      {/* Center metadata */}
      <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-slate-500">
        <span>UTC CLOCK: <span className="text-slate-300 font-bold">{currentTime}</span></span>
        <span className="h-3 w-px bg-[#1f2937]" />
        <span className="text-slate-400 font-semibold flex items-center gap-1">
          <Terminal className="h-3 w-3" />
          BOM_HACKATHON_DEMO
        </span>
      </div>

      {/* Right User Action Tray */}
      <div className="flex items-center gap-3">
        {/* Toggle Theme */}
        <Button
          onClick={toggleTheme}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 border-[#1f2937] hover:bg-slate-800 text-slate-400"
        >
          {theme === "dark" ? <SunIcon className="h-3.5 w-3.5" /> : <MoonIcon className="h-3.5 w-3.5" />}
        </Button>

        {/* Realtime feed toggler */}
        <Button
          onClick={toggleRightPanel}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 border-[#1f2937] hover:bg-slate-800 text-slate-400"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
        </Button>

        <span className="h-4 w-px bg-[#1f2937]" />

        {/* User profile dropdown */}
        {activePersona && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 outline-none hover:opacity-85 text-left group">
                <div className="h-7 w-7 rounded-full bg-[#172033] border border-[#1f2937] flex items-center justify-center text-xs font-bold text-slate-300 uppercase">
                  {activePersona.name.substring(0, 2)}
                </div>
                <div className="hidden sm:block">
                  <span className="text-[11px] font-semibold text-slate-200 block leading-tight">
                    {activePersona.name}
                  </span>
                  <span className="text-[9px] font-mono text-red-400 bg-red-950/20 border border-red-900/30 px-1 py-0.25 rounded mt-0.5 inline-block scale-95 origin-left">
                    {activePersona.badge}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0f1524] border-[#1f2937] text-slate-300 w-48 text-xs">
              <div className="px-2 py-1.5 border-b border-[#1f2937] mb-1 font-mono text-[9px] text-slate-500">
                DEPT: {activePersona.department}
                <br />
                CLEARANCE: {activePersona.clearanceLevel}
              </div>
              <DropdownMenuItem onClick={() => router.push("/portal/" + activePersona.role.toLowerCase().replace(" ", ""))}>
                Go to Workspace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-300 focus:bg-red-950/20">
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Disconnect Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};
