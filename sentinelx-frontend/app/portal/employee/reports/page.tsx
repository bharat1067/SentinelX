"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { EmployeeLayout } from "@/layouts/employee/EmployeeLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { ActionButton } from "@/components/common/ActionButton";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Play, CheckCircle } from "lucide-react";

interface ReportHistoryItem {
  id: string;
  name: string;
  type: string;
  timestamp: string;
  status: "COMPLETED" | "PENDING";
}

export default function ReportsPortal() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, activePersona } = useUserStore();

  const [history, setHistory] = useState<ReportHistoryItem[]>([
    { id: "REP-401", name: "Daily_Transaction_Audit.pdf", type: "Transaction Ledger Summary", timestamp: "2026-07-15 09:30", status: "COMPLETED" },
    { id: "REP-402", name: "Ledger_Replication_Verif.csv", type: "DB Sync Replication Verifier", timestamp: "2026-07-15 12:00", status: "COMPLETED" }
  ]);

  const [generating, setGenerating] = useState(false);

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

  const handleGenerateReport = (type: string) => {
    setGenerating(true);
    toast({
      title: "Report Generation Initiated",
      description: "Compiling database ledger indexes..."
    });

    setTimeout(() => {
      setGenerating(false);
      const newId = `REP-${Math.floor(100 + Math.random() * 900)}`;
      const fileName = `${type.replace(/\s+/g, "_")}_Dump.csv`;
      setHistory(prev => [
        {
          id: newId,
          name: fileName,
          type: type,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          status: "COMPLETED"
        },
        ...prev
      ]);
      toast({
        title: "Report Generation Completed",
        description: `Export file ${fileName} sent to Download Center.`
      });
    }, 1200);
  };

  return (
    <EmployeeLayout>
      <WorkspaceHeader
        title="Infrastructure Reports Center"
        breadcrumbs={["Portal", "Reports"]}
        status="OPERATIONAL"
        riskSummary={`${history.length} audit logs`}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Controls to generate */}
          <DashboardCard
            title="Generate Audit Records"
            description="Initiate DB reports compiles"
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              <div className="p-3 bg-[#090d16] border border-[#172033] rounded flex justify-between items-center">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Ledger Sync Audit</span>
                  <span className="text-[10px] text-slate-500 font-mono">Verifies sync states between backup nodes</span>
                </div>
                <ActionButton
                  onClick={() => handleGenerateReport("Ledger Sync Verification")}
                  disabled={generating}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Play className="h-3.5 w-3.5" />
                  Compile Report
                </ActionButton>
              </div>

              <div className="p-3 bg-[#090d16] border border-[#172033] rounded flex justify-between items-center">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Mass Transaction Export</span>
                  <span className="text-[10px] text-slate-500 font-mono">Compiles all credit/debit records above ₹500,000</span>
                </div>
                <ActionButton
                  onClick={() => handleGenerateReport("Mass High Value Transactions")}
                  disabled={generating}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Play className="h-3.5 w-3.5" />
                  Compile Report
                </ActionButton>
              </div>

              <div className="p-3 bg-[#090d16] border border-[#172033] rounded flex justify-between items-center">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Database Query Log Ledger</span>
                  <span className="text-[10px] text-slate-500 font-mono">Consolidates recent SELECT/INSERT queries logs</span>
                </div>
                <ActionButton
                  onClick={() => handleGenerateReport("Console Query History")}
                  disabled={generating}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Play className="h-3.5 w-3.5" />
                  Compile Report
                </ActionButton>
              </div>
            </div>
          </DashboardCard>

          {/* History */}
          <DashboardCard title="Generated History" description="Recent exports status track">
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="p-2.5 bg-[#090d16] border border-[#172033] rounded flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="text-slate-300 block font-semibold truncate max-w-[150px]">{h.name}</span>
                      <span className="text-[9px] text-slate-500 block">{h.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-emerald-500 font-mono flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      COMPLETED
                    </span>
                    <button
                      onClick={() => toast({ title: "Downloading Report", description: `Fetching ${h.name} file stream...` })}
                      className="p-1 bg-[#172033] hover:bg-slate-700 rounded text-slate-400"
                      title="Download File"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
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
