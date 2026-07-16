"use client";

import React, { useEffect } from "react";
import { useLayoutStore } from "@/stores/layout.store";
import { useUserStore, UserRole } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Shield, Eye, Settings, Users, Key } from "lucide-react";

export const GlobalCommandPalette: React.FC = () => {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useLayoutStore();
  const { login } = useUserStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const handleNavigate = (path: string) => {
    setCommandPaletteOpen(false);
    router.push(path);
  };

  const handleSwitchRole = (role: UserRole, path: string) => {
    login(role);
    setCommandPaletteOpen(false);
    router.push(path);
  };

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <div className="bg-[#0f1524] border border-[#1f2937] rounded overflow-hidden shadow-2xl">
        <CommandInput
          placeholder="Type a command or search portal routes..."
          className="text-xs bg-transparent border-0 border-b border-[#1f2937] placeholder-slate-500 text-slate-200 focus:ring-0"
        />
        <CommandList className="max-h-[300px] overflow-y-auto p-2 no-scrollbar text-slate-300">
          <CommandEmpty className="text-center py-4 text-xs text-slate-500 font-mono">
            No results found.
          </CommandEmpty>

          <CommandGroup heading="Demo Switch Persona" className="text-[10px] font-mono text-slate-500 uppercase px-2 mb-2">
            <CommandItem
              onSelect={() => handleSwitchRole("Employee", "/portal/employee")}
              className="flex items-center gap-2 p-2 rounded hover:bg-[#172033]/60 cursor-pointer text-xs font-sans text-slate-200"
            >
              <Key className="h-4 w-4 text-slate-400" />
              <span>Login as Privileged Database Administrator</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSwitchRole("SOC Analyst", "/portal/soc")}
              className="flex items-center gap-2 p-2 rounded hover:bg-[#172033]/60 cursor-pointer text-xs font-sans text-slate-200"
            >
              <Shield className="h-4 w-4 text-slate-400" />
              <span>Login as SOC Analyst</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSwitchRole("Manager", "/portal/manager")}
              className="flex items-center gap-2 p-2 rounded hover:bg-[#172033]/60 cursor-pointer text-xs font-sans text-slate-200"
            >
              <Users className="h-4 w-4 text-slate-400" />
              <span>Login as IT Infrastructure Manager</span>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Go to Workspaces" className="text-[10px] font-mono text-slate-500 uppercase px-2">
            <CommandItem
              onSelect={() => handleNavigate("/portal/employee")}
              className="flex items-center gap-2 p-2 rounded hover:bg-[#172033]/60 cursor-pointer text-xs font-sans text-slate-200"
            >
              <Eye className="h-4 w-4 text-slate-400" />
              <span>Employee Portal Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/portal/soc")}
              className="flex items-center gap-2 p-2 rounded hover:bg-[#172033]/60 cursor-pointer text-xs font-sans text-slate-200"
            >
              <Eye className="h-4 w-4 text-slate-400" />
              <span>SOC Analyst Workspace</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/portal/manager")}
              className="flex items-center gap-2 p-2 rounded hover:bg-[#172033]/60 cursor-pointer text-xs font-sans text-slate-200"
            >
              <Eye className="h-4 w-4 text-slate-400" />
              <span>Manager Authorizations Desk</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleNavigate("/portal/soc/settings")}
              className="flex items-center gap-2 p-2 rounded hover:bg-[#172033]/60 cursor-pointer text-xs font-sans text-slate-200"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Global Security Configurations</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </div>
    </CommandDialog>
  );
};
