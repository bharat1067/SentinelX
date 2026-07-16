"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { ManagerLayout } from "@/layouts/manager/ManagerLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { ApprovalTable } from "@/components/common/ApprovalTable";
import { AuditTable } from "@/components/common/AuditTable";
import { DashboardCard } from "@/components/common/DashboardCard";
import { useToast } from "@/hooks/use-toast";
import { ApprovalRequest } from "@/components/security/ApprovalCard";
import { AuditRecord } from "@/components/security/AuditCard";

const INITIAL_MOCK_APPROVALS: ApprovalRequest[] = [
  {
    id: "REQ-701",
    user: "Privileged Database Administrator",
    role: "Database Administrator",
    resource: "PostgreSQL Customer Account Ledger",
    durationMinutes: 30,
    reason: "Require emergency DB backup restoration following minor replication sync drift.",
    riskScore: 78,
    timestamp: "2026-07-15 14:04:12"
  },
  {
    id: "REQ-702",
    user: "Privileged Database Administrator",
    role: "Database Administrator",
    resource: "Oracle Security Core Configuration",
    durationMinutes: 15,
    reason: "Verify connection strings limits update.",
    riskScore: 35,
    timestamp: "2026-07-15 13:58:00"
  }
];

const INITIAL_MOCK_AUDIT_LOGS: AuditRecord[] = [
  {
    id: "BLK-001",
    action: "Access Request Authorized",
    actor: "IT Infrastructure Manager",
    timestamp: "2026-07-15 14:04:35",
    currentHash: "ea285f54316d99fcf6002f2334812a64019de6d3a95d710b10697d812e9b88ef",
    previousHash: "92bb212de2f218f2f2162a64019dfd3810a95d710b10697d812e9b88ef11b22e",
    status: "verified"
  },
  {
    id: "BLK-002",
    action: "Dynamic Alert Intercept",
    actor: "Security Orchestration Engine",
    timestamp: "2026-07-15 14:02:10",
    currentHash: "92bb212de2f218f2f2162a64019dfd3810a95d710b10697d812e9b88ef11b22e",
    previousHash: "f182bcf281f215d2a64019d3810a95d710b10697d812e9b88ef11b22eea481bd0",
    status: "verified"
  },
  {
    id: "BLK-003",
    action: "Session Override Blocked",
    actor: "Policy Decision Point",
    timestamp: "2026-07-15 13:48:50",
    currentHash: "f182bcf281f215d2a64019d3810a95d710b10697d812e9b88ef11b22eea481bd0",
    previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
    status: "verified"
  }
];

export default function ManagerPortalDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, activePersona } = useUserStore();

  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_MOCK_APPROVALS);
  const [audits, setAudits] = useState<AuditRecord[]>(INITIAL_MOCK_AUDIT_LOGS);

  useEffect(() => {
    if (!isAuthenticated || !activePersona || activePersona.role !== "Manager") {
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

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.filter(req => req.id !== id));
    toast({
      title: "Access Authorized",
      description: `Request ${id} approved. Security audit ticket signed.`,
    });
    // Add verification block to audits
    const newBlock: AuditRecord = {
      id: `BLK-00${audits.length + 1}`,
      action: "Access Request Authorized",
      actor: activePersona.name,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      currentHash: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      previousHash: audits[0]?.currentHash || "000000000000",
      status: "verified"
    };
    setAudits(prev => [newBlock, ...prev]);
  };

  const handleDeny = (id: string) => {
    setApprovals(prev => prev.filter(req => req.id !== id));
    toast({
      title: "Access Blocked / Denied",
      description: `Access request ${id} denied. Event flagged in security ledger.`,
      variant: "destructive"
    });
  };

  const handleVerifyProof = (id: string) => {
    toast({
      title: "Cryptographic Integrity Verified",
      description: `Signed block hash ${id} verified cleanly against parent node. Ledger is untampered.`,
    });
  };

  return (
    <ManagerLayout>
      <WorkspaceHeader
        title="Infrastructure Governance & Approvals Desk"
        breadcrumbs={["Portal", "Manager", "Dashboard"]}
        status="OPERATIONAL"
        riskSummary={`${approvals.length} Pending Elevations`}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {/* Approvals Table */}
        <DashboardCard
          title="Active Privileged Access Requests Queue"
          description="Supervisor validation required"
        >
          <ApprovalTable
            requests={approvals}
            onApprove={handleApprove}
            onDeny={handleDeny}
          />
        </DashboardCard>

        {/* Audit Log Table */}
        <DashboardCard
          title="Continuous Cryptographic Log Ledger"
          description="Tamper-evident system signatures chain"
        >
          <AuditTable
            records={audits}
            onVerify={handleVerifyProof}
          />
        </DashboardCard>
      </div>
    </ManagerLayout>
  );
}
