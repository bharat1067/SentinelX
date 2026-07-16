"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { EmployeeLayout } from "@/layouts/employee/EmployeeLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { ActionButton } from "@/components/common/ActionButton";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Download, CheckCircle, Clock } from "lucide-react";

interface DownloadItem {
  id: string;
  filename: string;
  size: string;
  status: "COMPLETED" | "PENDING";
  expiry: string;
}

export default function DownloadsCenter() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, activePersona } = useUserStore();

  const [items] = useState<DownloadItem[]>([
    { id: "DL-101", filename: "Daily_Transaction_Audit.pdf", size: "1.2 MB", status: "COMPLETED", expiry: "24 hours" },
    { id: "DL-102", filename: "Ledger_Replication_Verif.csv", size: "4.8 MB", status: "COMPLETED", expiry: "48 hours" },
    { id: "DL-103", filename: "Mass_High_Value_Transactions_Dump.csv", size: "18.2 MB", status: "PENDING", expiry: "-" }
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

  const handleDownload = (filename: string) => {
    toast({
      title: "File Download Started",
      description: `Downloading ${filename}...`
    });
  };

  return (
    <EmployeeLayout>
      <WorkspaceHeader
        title="Download Center"
        breadcrumbs={["Portal", "Downloads"]}
        status="OPERATIONAL"
        riskSummary={`${items.length} Files Pending / Completed`}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <DashboardCard
          title="Generated Export Files"
          description="Download completed reports and exports"
        >
          <div className="space-y-3 font-mono text-xs">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-[#090d16] border border-[#172033] rounded flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <FileDown className="h-5 w-5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-200 block font-semibold">{item.filename}</span>
                    <span className="text-[10px] text-slate-500">Size: {item.size} | Expiry: {item.expiry}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {item.status === "COMPLETED" ? (
                    <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      COMPLETED
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 animate-pulse" />
                      COMPILING
                    </span>
                  )}

                  <ActionButton
                    onClick={() => handleDownload(item.filename)}
                    disabled={item.status !== "COMPLETED"}
                    variant={item.status === "COMPLETED" ? "outline" : "secondary"}
                    size="sm"
                    className="flex items-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </EmployeeLayout>
  );
}
