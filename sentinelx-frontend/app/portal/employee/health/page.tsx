"use client";

import React, { useEffect } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { EmployeeLayout } from "@/layouts/employee/EmployeeLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { StatWidget } from "@/components/common/StatWidget";
import { ProgressRing } from "@/components/common/ProgressRing";

export default function ServerHealth() {
  const router = useRouter();
  const { isAuthenticated, activePersona } = useUserStore();

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

  return (
    <EmployeeLayout>
      <WorkspaceHeader
        title="Server Health Telemetry"
        breadcrumbs={["Portal", "Server Health"]}
        status="OPERATIONAL"
        riskSummary="All Nodes: HEALTHY"
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {/* Resource grids */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardCard title="CPU Core Status" description="Core processing load indicators">
            <div className="flex items-center justify-around py-4">
              <div className="text-center">
                <ProgressRing percentage={12} size={80} strokeWidth={8} colorClass="stroke-emerald-500" />
                <span className="text-[10px] text-slate-500 font-mono block mt-2">Node Core 1: 12%</span>
              </div>
              <div className="text-center">
                <ProgressRing percentage={18} size={80} strokeWidth={8} colorClass="stroke-emerald-500" />
                <span className="text-[10px] text-slate-500 font-mono block mt-2">Node Core 2: 18%</span>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Memory Allocation" description="Memory mapping and cache rates">
            <div className="flex items-center justify-around py-4">
              <div className="text-center">
                <ProgressRing percentage={64} size={80} strokeWidth={8} colorClass="stroke-sky-500" />
                <span className="text-[10px] text-slate-500 font-mono block mt-2">Buffer Cache: 64%</span>
              </div>
              <div className="text-center">
                <ProgressRing percentage={38} size={80} strokeWidth={8} colorClass="stroke-emerald-500" />
                <span className="text-[10px] text-slate-500 font-mono block mt-2">Swap Memory: 38%</span>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Disk IOPS Status" description="Input / Output operations per second">
            <div className="flex items-center justify-around py-4">
              <div className="text-center">
                <ProgressRing percentage={28} size={80} strokeWidth={8} colorClass="stroke-emerald-500" />
                <span className="text-[10px] text-slate-500 font-mono block mt-2">Read IOPS: 28%</span>
              </div>
              <div className="text-center">
                <ProgressRing percentage={14} size={80} strokeWidth={8} colorClass="stroke-emerald-500" />
                <span className="text-[10px] text-slate-500 font-mono block mt-2">Write IOPS: 14%</span>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Detailed subsystems */}
        <DashboardCard title="System Node Statistics" description="Network latency and connection stats">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatWidget label="API Gateway Response Time" value="18ms" percentage={18} barColor="bg-emerald-500" />
            <StatWidget label="Database Thread Pool" value="8%" percentage={8} barColor="bg-emerald-500" />
            <StatWidget label="Network Ingress Bandwidth" value="4.2 Gbps" percentage={42} barColor="bg-sky-500" />
            <StatWidget label="Replication Sync Latency" value="4ms" percentage={4} barColor="bg-emerald-500" />
          </div>
        </DashboardCard>
      </div>
    </EmployeeLayout>
  );
}
