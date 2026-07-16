"use client";

import React, { useState } from "react";
import { useUserStore, UserRole } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconRegistry } from "@/constants/icons";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Terminal, Shield, Key, Users } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useUserStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Authentication Failed",
        description: "Credentials inputs cannot be empty for BOM security.",
        variant: "destructive",
      });
      return;
    }
    // Success, display selector
    setShowPersonaSelector(true);
  };

  const handleSelectPersona = (role: UserRole, targetPath: string) => {
    login(role);
    setShowPersonaSelector(false);
    toast({
      title: "Session Established",
      description: `Active role context set to: ${role}`,
    });
    router.push(targetPath);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#07090f] px-4 font-sans select-none">
      <div className="w-full max-w-md bg-[#0f1524] border border-[#1f2937] p-8 rounded shadow-2xl flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-10 w-10 rounded bg-red-950/20 border border-red-900/40 flex items-center justify-center text-red-500">
            <IconRegistry.Security className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-slate-100 uppercase">
              SentinelX
            </h1>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
              AI Powered Security Decision Intelligence Platform
            </p>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase">
              Operator Username
            </label>
            <Input
              type="text"
              placeholder="e.g. bom_operator"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#090d16] border-[#1f2937] text-xs h-9 text-slate-200 placeholder-slate-600 focus-visible:ring-slate-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase">
              Clearance Token Password
            </label>
            <Input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#090d16] border-[#1f2937] text-xs h-9 text-slate-200 placeholder-slate-600 focus-visible:ring-slate-700"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 text-xs font-semibold h-9 rounded mt-2"
          >
            Authenticate Session
          </Button>
        </form>

        <div className="text-center text-[10px] font-mono text-slate-600 flex items-center justify-center gap-1">
          <Terminal className="h-3 w-3" />
          Bank of Maharashtra Cyber Defense Portal
        </div>
      </div>

      {/* Demo Persona Selector Dialog */}
      <Dialog open={showPersonaSelector} onOpenChange={setShowPersonaSelector}>
        <DialogContent className="bg-[#0c101d] border-[#1f2937] text-slate-300 w-full max-w-lg p-6 rounded">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase text-slate-100 tracking-wider">
              Select Demo Identity Persona
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-mono">
              SentinelX dynamically adjusts layouts, sidebars, and privileges matching banking roles.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {/* Employee Card */}
            <div
              onClick={() => handleSelectPersona("Employee", "/portal/employee")}
              className="p-3 bg-[#0f1524] border border-[#1f2937] hover:border-slate-400 rounded cursor-pointer transition-all flex items-start gap-3"
            >
              <div className="h-8 w-8 rounded bg-slate-900 border border-[#1f2937] flex items-center justify-center text-slate-400">
                <Key className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-slate-200">
                    Privileged Database Administrator
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">Employee Portal</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal font-mono">
                  Accesses core banking registries. Simulates requests for elevated resource tokens.
                </p>
              </div>
            </div>

            {/* SOC Analyst Card */}
            <div
              onClick={() => handleSelectPersona("SOC Analyst", "/portal/soc")}
              className="p-3 bg-[#0f1524] border border-[#1f2937] hover:border-slate-400 rounded cursor-pointer transition-all flex items-start gap-3"
            >
              <div className="h-8 w-8 rounded bg-slate-900 border border-[#1f2937] flex items-center justify-center text-slate-400">
                <Shield className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-slate-200">
                    SOC Security Analyst
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">SOC Workspace</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal font-mono">
                  Inspects log streams, dynamic incident timelines, anomalies, and active alerts.
                </p>
              </div>
            </div>

            {/* Manager Card */}
            <div
              onClick={() => handleSelectPersona("Manager", "/portal/manager")}
              className="p-3 bg-[#0f1524] border border-[#1f2937] hover:border-slate-400 rounded cursor-pointer transition-all flex items-start gap-3"
            >
              <div className="h-8 w-8 rounded bg-slate-900 border border-[#1f2937] flex items-center justify-center text-slate-400">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-semibold text-slate-200">
                    IT Infrastructure Manager
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">Approvals Desk</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal font-mono">
                  Authorizes privileged requests, overrides threat lockdowns, and checks signed audit chain records.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
