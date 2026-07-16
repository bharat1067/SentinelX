"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { EmployeeLayout } from "@/layouts/employee/EmployeeLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { SecurityDataTable } from "@/components/common/SecurityDataTable";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterBar } from "@/components/common/FilterBar";

interface CustomerRecord {
  id: string;
  name: string;
  pan: string;
  tier: "RETAIL" | "HNI" | "CORPORATE";
  risk: "low" | "medium" | "high";
  created: string;
}

const MOCK_CUSTOMERS: CustomerRecord[] = [
  { id: "CUST-9081", name: "Amit Sharma", pan: "ABHPS9872F", tier: "RETAIL", risk: "low", created: "2026-01-10" },
  { id: "CUST-9082", name: "Karan Johar", pan: "CBLPK0921M", tier: "HNI", risk: "medium", created: "2025-06-15" },
  { id: "CUST-9083", name: "Ananya Pandey", pan: "DPLPA1290C", tier: "RETAIL", risk: "low", created: "2026-03-22" },
  { id: "CUST-9084", name: "Sunil Shetty", pan: "EDKPS8741B", tier: "HNI", risk: "low", created: "2024-11-05" },
  { id: "CUST-9085", name: "Nita Ambani", pan: "FLMPS0981X", tier: "CORPORATE", risk: "low", created: "2023-04-12" },
  { id: "CUST-9086", name: "Sachin Tendulkar", pan: "GLKPA7654Z", tier: "HNI", risk: "low", created: "2024-08-18" }
];

export default function CustomerDatabase() {
  const router = useRouter();
  const { isAuthenticated, activePersona } = useUserStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState("ALL");

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

  const filteredData = MOCK_CUSTOMERS.filter((cust) => {
    const matchesSearch = cust.name.toLowerCase().includes(searchQuery.toLowerCase()) || cust.pan.includes(searchQuery.toUpperCase());
    const matchesFilter = filterTier === "ALL" || cust.tier === filterTier;
    return matchesSearch && matchesFilter;
  });

  const columns = [
    {
      header: "Customer ID",
      accessor: (c: CustomerRecord) => <span className="font-semibold text-slate-400">{c.id}</span>,
    },
    {
      header: "Full Name",
      accessor: (c: CustomerRecord) => <span className="text-slate-200 font-semibold">{c.name}</span>,
    },
    {
      header: "PAN Number",
      accessor: (c: CustomerRecord) => <span className="font-mono text-slate-300">{c.pan}</span>,
    },
    {
      header: "Customer Tier",
      accessor: (c: CustomerRecord) => (
        <span
          className={
            c.tier === "CORPORATE"
              ? "text-sky-400 bg-sky-950/20 border border-sky-900/30 px-1.5 py-0.25 rounded text-[10px]"
              : c.tier === "HNI"
              ? "text-amber-500 bg-amber-950/10 border border-amber-900/30 px-1.5 py-0.25 rounded text-[10px]"
              : "text-slate-400 bg-slate-900 border border-[#1f2937] px-1.5 py-0.25 rounded text-[10px]"
          }
        >
          {c.tier}
        </span>
      ),
    },
    {
      header: "Internal Risk",
      accessor: (c: CustomerRecord) => (
        <span className={c.risk === "high" ? "text-red-400" : c.risk === "medium" ? "text-amber-500" : "text-emerald-500"}>
          {c.risk.toUpperCase()}
        </span>
      ),
    },
    {
      header: "Registration Date",
      accessor: (c: CustomerRecord) => <span className="text-slate-500">{c.created}</span>,
    },
  ];

  return (
    <EmployeeLayout>
      <WorkspaceHeader
        title="Customer Profiles Registry"
        breadcrumbs={["Portal", "Customer DB"]}
        status="OPERATIONAL"
        riskSummary={`${filteredData.length} Records Loaded`}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <DashboardCard
          title="BOM Customer Base Directory"
          description="View and verify bank customer registrations"
          headerActions={
            <div className="flex items-center gap-3">
              <SearchBar
                placeholder="Search name or PAN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FilterBar
                options={[
                  { label: "All Tiers", value: "ALL" },
                  { label: "Retail", value: "RETAIL" },
                  { label: "HNI", value: "HNI" },
                  { label: "Corporate", value: "CORPORATE" }
                ]}
                selectedValue={filterTier}
                onChange={setFilterTier}
                label="Tier"
              />
            </div>
          }
        >
          <SecurityDataTable
            data={filteredData}
            columns={columns}
            keyExtractor={(c) => c.id}
          />
        </DashboardCard>
      </div>
    </EmployeeLayout>
  );
}
