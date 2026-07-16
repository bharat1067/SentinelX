"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { EmployeeLayout } from "@/layouts/employee/EmployeeLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { ActionButton } from "@/components/common/ActionButton";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export default function OperatorSettings() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, activePersona } = useUserStore();

  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [themePreference, setThemePreference] = useState("dark");

  useEffect(() => {
    if (!isAuthenticated || !activePersona || activePersona.role !== "Employee") {
      router.push("/");
    }
  }, [isAuthenticated, activePersona, router]);

  if (!isAuthenticated || !activePersona) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#07090f] text-slate-500 font-mono text-xs">
        Verifying security token clearance...
      </div>
    );
  }

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Operator workspace profile preferences saved successfully."
    });
  };

  return (
    <EmployeeLayout>
      <WorkspaceHeader
        title="DBA Settings"
        breadcrumbs={["Portal", "Settings"]}
        status="OPERATIONAL"
        riskSummary="Config: Loaded"
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <DashboardCard
          title="Workspace Customization"
          description="Manage console local parameters"
          headerActions={
            <ActionButton onClick={handleSaveSettings} size="sm" className="flex items-center gap-1.5">
              <Save className="h-3.5 w-3.5" />
              Save Preferences
            </ActionButton>
          }
        >
          <div className="space-y-4 max-w-md text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-slate-400 block font-semibold">LDAP Vault Session Timeout (Minutes)</label>
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full bg-[#090d16] border border-[#1f2937] rounded p-2 text-slate-200 focus:border-slate-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 block font-semibold">Console Layout Theme Mode</label>
              <select
                value={themePreference}
                onChange={(e) => setThemePreference(e.target.value)}
                className="w-full bg-[#090d16] border border-[#1f2937] rounded p-2 text-slate-200 focus:border-slate-500 outline-none"
              >
                <option value="dark">Enterprise Dark (Recommended)</option>
                <option value="hybrid">Terminal Classic Green</option>
              </select>
            </div>

            <div className="p-3 bg-[#090d16] border border-[#172033] rounded text-slate-500 text-[10px]">
              <p>Workstation ID: BOM-DBA-087</p>
              <p className="mt-1">Vault Registry IP: 10.15.2.14</p>
              <p className="mt-1">Cryptographic Core Ledger Token Active</p>
            </div>
          </div>
        </DashboardCard>
      </div>
    </EmployeeLayout>
  );
}
