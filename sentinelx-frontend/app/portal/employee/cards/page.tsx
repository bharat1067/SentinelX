"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { EmployeeLayout } from "@/layouts/employee/EmployeeLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { SecurityDataTable } from "@/components/common/SecurityDataTable";
import { SearchBar } from "@/components/common/SearchBar";

interface CardRecord {
  cardNumber: string;
  name: string;
  type: "DEBIT" | "CREDIT";
  dailyLimit: string;
  status: "ACTIVE" | "BLOCKED" | "EXPIRED";
}

const MOCK_CARDS: CardRecord[] = [
  { cardNumber: "4315-XXXX-XXXX-9018", name: "Karan Johar", type: "CREDIT", dailyLimit: "₹500,000", status: "ACTIVE" },
  { cardNumber: "4315-XXXX-XXXX-1234", name: "Ananya Pandey", type: "DEBIT", dailyLimit: "₹250,000", status: "ACTIVE" },
  { cardNumber: "4315-XXXX-XXXX-8742", name: "Sunil Shetty", type: "CREDIT", dailyLimit: "₹1,000,000", status: "ACTIVE" },
  { cardNumber: "4315-XXXX-XXXX-0091", name: "Sanjay Dutt", type: "DEBIT", dailyLimit: "₹150,000", status: "BLOCKED" }
];

export default function CardsRegistry() {
  const router = useRouter();
  const { isAuthenticated, activePersona } = useUserStore();

  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredData = MOCK_CARDS.filter((card) =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase()) || card.cardNumber.includes(searchQuery)
  );

  const columns = [
    {
      header: "Card Number ID",
      accessor: (c: CardRecord) => <span className="font-semibold font-mono text-slate-400">{c.cardNumber}</span>,
    },
    {
      header: "Cardholder Name",
      accessor: (c: CardRecord) => <span className="text-slate-200 font-semibold">{c.name}</span>,
    },
    {
      header: "Card Type",
      accessor: (c: CardRecord) => <span className="font-mono text-slate-400">{c.type}</span>,
    },
    {
      header: "Daily Limit",
      accessor: (c: CardRecord) => <span className="text-slate-200 font-mono">{c.dailyLimit}</span>,
    },
    {
      header: "Access Status",
      accessor: (c: CardRecord) => (
        <span
          className={
            c.status === "ACTIVE"
              ? "text-emerald-500 bg-emerald-500/10 border border-emerald-900/30 px-1.5 py-0.25 rounded text-[10px]"
              : "text-red-500 bg-red-950/20 border border-red-900/30 px-1.5 py-0.25 rounded text-[10px]"
          }
        >
          {c.status}
        </span>
      ),
    },
  ];

  return (
    <EmployeeLayout>
      <WorkspaceHeader
        title="Active Cards Telemetry Database"
        breadcrumbs={["Portal", "Cards"]}
        status="OPERATIONAL"
        riskSummary={`${filteredData.length} cards tracked`}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <DashboardCard
          title="Dynamic Cards Directory"
          description="Verify daily withdrawal and payment limit indicators"
          headerActions={
            <SearchBar
              placeholder="Search cardholder or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          }
        >
          <SecurityDataTable
            data={filteredData}
            columns={columns}
            keyExtractor={(c) => c.cardNumber}
          />
        </DashboardCard>
      </div>
    </EmployeeLayout>
  );
}
