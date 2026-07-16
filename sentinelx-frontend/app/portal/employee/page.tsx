"use client";

import React, { useEffect } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { EmployeeLayout } from "@/layouts/employee/EmployeeLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { MetricCard } from "@/components/common/MetricCard";
import { SectionCard } from "@/components/common/SectionCard";
import { StatWidget } from "@/components/common/StatWidget";
import { Database, Users, HardDrive, Terminal, RefreshCw, FileText } from "lucide-react";

export default function EmployeeDashboard() {
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
        title="Core Banking Operations & Database Console"
        breadcrumbs={["Portal", "DBA Operations", "Dashboard"]}
        status="OPERATIONAL"
        riskSummary="System Status: NORMAL"
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {/* Metric counts grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Database Nodes Status"
            value="ACTIVE"
            subValue="3/3 nodes online"
            trend={{ direction: "down", label: "Sync latency 4ms" }}
            icon={Database}
          />
          <MetricCard
            title="Active Operational Sessions"
            value="18"
            subValue="4 privileged admins"
            trend={{ direction: "neutral", label: "Baseline range normal" }}
            icon={Users}
          />
          <MetricCard
            title="Primary Ledger Disk Size"
            value="4.2 TB"
            subValue="1.8 TB remaining"
            trend={{ direction: "down", label: "Daily delta +14.2 GB" }}
            icon={HardDrive}
          />
          <MetricCard
            title="Pending Backup Archives"
            value="0"
            subValue="all nodes synced"
            trend={{ direction: "down", label: "Last sync 14:00" }}
            icon={RefreshCw}
          />
        </div>

        {/* Dashboard Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Active Database Sessions */}
          <DashboardCard
            title="Active Privileged Database Sessions"
            description="Active database console terminals"
            className="lg:col-span-2"
          >
            <div className="space-y-3 font-mono text-xs">
              <div className="p-2.5 bg-[#090d16] border border-[#172033] rounded flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-slate-400" />
                  <span>Session: SES-90812 (Active)</span>
                </div>
                <span>DBA: Amit Verma</span>
                <span className="text-slate-500">IP: 10.15.2.14</span>
              </div>
              <div className="p-2.5 bg-[#090d16] border border-[#172033] rounded flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-slate-400" />
                  <span>Session: SES-89714 (Idle)</span>
                </div>
                <span>Sys_Sync: Backup_Daemon</span>
                <span className="text-slate-500">IP: 10.15.4.15</span>
              </div>
              <div className="p-2.5 bg-[#090d16] border border-[#172033] rounded flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-slate-400" />
                  <span>Session: SES-89100 (Active)</span>
                </div>
                <span>Manager: Rajesh Kumar</span>
                <span className="text-slate-500">IP: 10.20.1.12</span>
              </div>
            </div>
          </DashboardCard>

          {/* Today's reports */}
          <DashboardCard title="Daily Reports Registry" description="Generated audit reports">
            <div className="space-y-2">
              <div className="p-2 bg-[#090d16] border border-[#172033] rounded flex items-center gap-2 text-xs">
                <FileText className="h-4 w-4 text-slate-400" />
                <div className="flex-1">
                  <span className="text-slate-300 block font-semibold">Ledger_Replication_Verif.csv</span>
                  <span className="text-[10px] text-slate-500 font-mono">Size: 4.8 MB | Ingested: 12:00</span>
                </div>
              </div>
              <div className="p-2 bg-[#090d16] border border-[#172033] rounded flex items-center gap-2 text-xs">
                <FileText className="h-4 w-4 text-slate-400" />
                <div className="flex-1">
                  <span className="text-slate-300 block font-semibold">Daily_Transaction_Audit.pdf</span>
                  <span className="text-[10px] text-slate-500 font-mono">Size: 1.2 MB | Ingested: 09:30</span>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* Server metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatWidget label="Database Cpu Ingest Core 1" value="12%" percentage={12} barColor="bg-emerald-500" />
          <StatWidget label="Primary Ledger Memory Cache" value="64%" percentage={64} barColor="bg-sky-500" />
          <StatWidget label="Disk Write IOPS Capacity" value="28%" percentage={28} barColor="bg-emerald-500" />
        </div>

        {/* Critical System status */}
        <DashboardCard title="Core Banking Infrastructure Registry" description="Operational subsystems status map">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SectionCard title="Ledger DB Engine">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">PostgreSQL core</span>
                <span className="text-emerald-500 font-semibold uppercase">Normal</span>
              </div>
            </SectionCard>
            <SectionCard title="Identity Registry">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">LDAP Gateway</span>
                <span className="text-emerald-500 font-semibold uppercase">Normal</span>
              </div>
            </SectionCard>
            <SectionCard title="Privileged Vault">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">CyberArk Core API</span>
                <span className="text-emerald-500 font-semibold uppercase">Normal</span>
              </div>
            </SectionCard>
            <SectionCard title="Log Forwarder">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Splunk Connector</span>
                <span className="text-emerald-500 font-semibold uppercase">Normal</span>
              </div>
            </SectionCard>
          </div>
        </DashboardCard>
      </div>
    </EmployeeLayout>
  );
}
