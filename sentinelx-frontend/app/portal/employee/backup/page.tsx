"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { EmployeeLayout } from "@/layouts/employee/EmployeeLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { ActionButton } from "@/components/common/ActionButton";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Server, Check } from "lucide-react";

interface BackupItem {
  id: string;
  type: string;
  destination: string;
  status: "SYNCED" | "PENDING";
  timestamp: string;
  size: string;
}

export default function BackupCenter() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, activePersona } = useUserStore();

  const [syncing, setSyncing] = useState(false);
  const [backups, setBackups] = useState<BackupItem[]>([
    { id: "BKP-9801", type: "Incremental Sync", destination: "BOM-VAULT-NODE-3 (10.15.4.15)", status: "SYNCED", timestamp: "2026-07-15 14:00", size: "14.2 GB" },
    { id: "BKP-9800", type: "Full Snapshot", destination: "BOM-VAULT-NODE-1 (10.15.4.10)", status: "SYNCED", timestamp: "2026-07-14 23:30", size: "4.2 TB" }
  ]);

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

  const handleCreateBackup = () => {
    setSyncing(true);
    toast({
      title: "Incremental Backup Ticking",
      description: "Compiling diff indexes on replica database core..."
    });

    setTimeout(() => {
      setSyncing(false);
      const newId = `BKP-${Math.floor(9000 + Math.random() * 900)}`;
      setBackups(prev => [
        {
          id: newId,
          type: "Incremental Sync",
          destination: "BOM-VAULT-NODE-3 (10.15.4.15)",
          status: "SYNCED",
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          size: "18.4 GB"
        },
        ...prev
      ]);
      toast({
        title: "Backup Finalized",
        description: `Snapshot ${newId} signed with crypto validation token.`
      });
    }, 1500);
  };

  return (
    <EmployeeLayout>
      <WorkspaceHeader
        title="Disaster Recovery Backup Center"
        breadcrumbs={["Portal", "Backup Center"]}
        status="OPERATIONAL"
        riskSummary="All Nodes: SYNCED"
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Controls */}
          <DashboardCard
            title="Create Snapshots"
            description="Manage recovery files"
            className="lg:col-span-2"
            headerActions={
              <ActionButton onClick={handleCreateBackup} disabled={syncing} size="sm" className="flex items-center gap-1">
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                Run Backup Now
              </ActionButton>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-[#090d16] border border-[#172033] rounded space-y-2">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-200">BOM-VAULT-NODE-1</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">Status</span>
                  <span className="text-emerald-500 font-semibold uppercase">Synced</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">Active Storage</span>
                  <span className="text-slate-400 font-mono">4.2 TB</span>
                </div>
              </div>

              <div className="p-3 bg-[#090d16] border border-[#172033] rounded space-y-2">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-200">BOM-VAULT-NODE-3</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">Status</span>
                  <span className="text-emerald-500 font-semibold uppercase">Synced</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">Active Storage</span>
                  <span className="text-slate-400 font-mono">14.2 GB</span>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Backup History */}
          <DashboardCard title="Replication History" description="Incremental ledger logs list">
            <div className="space-y-3">
              {backups.map((bkp) => (
                <div key={bkp.id} className="p-2.5 bg-[#090d16] border border-[#172033] rounded flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-bold font-mono">{bkp.id}</span>
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-950 px-1.5 py-0.25 rounded font-mono uppercase flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      {bkp.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>{bkp.type}</span>
                    <span>{bkp.size}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-600 font-mono">
                    <span>{bkp.destination.split(" ")[0]}</span>
                    <span>{bkp.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </EmployeeLayout>
  );
}
