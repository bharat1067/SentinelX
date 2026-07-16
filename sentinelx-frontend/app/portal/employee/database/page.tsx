"use client";

import React, { useState, useEffect } from "react";
import { useUserStore } from "@/stores/user.store";
import { useRouter } from "next/navigation";
import { EmployeeLayout } from "@/layouts/employee/EmployeeLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { ActionButton } from "@/components/common/ActionButton";
import { SecurityDataTable } from "@/components/common/SecurityDataTable";
import { useToast } from "@/hooks/use-toast";
import { Terminal, Database, Save, Play } from "lucide-react";

interface QueryHistoryItem {
  timestamp: string;
  query: string;
  status: "SUCCESS" | "ERROR";
  durationMs: number;
}

const SAVED_QUERIES = [
  "SELECT * FROM customer_accounts WHERE balance > 1000000;",
  "SELECT account_number, balance FROM customer_accounts WHERE status='FROZEN';",
  "EXPLAIN ANALYZE SELECT * FROM transactions WHERE amount > 500000;",
  "SELECT count(*), type FROM transactions GROUP BY type;",
  "VACUUM ANALYZE customer_accounts;"
];

export default function DatabaseConsole() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, activePersona } = useUserStore();

  const [sqlText, setSqlText] = useState("SELECT * FROM customer_accounts LIMIT 10;");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<QueryHistoryItem[]>([
    { timestamp: "14:02:10", query: "SELECT count(*) FROM customer_accounts;", status: "SUCCESS", durationMs: 4.8 },
    { timestamp: "13:58:45", query: "EXPLAIN ANALYZE SELECT * FROM transactions WHERE id='TX-101';", status: "SUCCESS", durationMs: 12.2 }
  ]);

  const [gridColumns, setGridColumns] = useState<{ header: string; accessor: (item: any) => React.ReactNode }[]>([]);
  const [gridData, setGridData] = useState<any[]>([]);

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

  const handleExecuteQuery = () => {
    if (!sqlText.trim()) return;

    setLoading(true);
    toast({
      title: "SQL Command Sent",
      description: "Query execution pipeline parsing tokens..."
    });

    setTimeout(() => {
      setLoading(false);
      const isSelectAll = sqlText.toLowerCase().includes("select *");

      if (isSelectAll) {
        setGridColumns([
          { header: "Account Number", accessor: (d) => <span>{d.acc}</span> },
          { header: "Customer Name", accessor: (d) => <span className="text-slate-300 font-semibold">{d.name}</span> },
          { header: "Ledger Balance", accessor: (d) => <span className="text-emerald-500 font-mono">{d.bal}</span> },
          { header: "Card Limit", accessor: (d) => <span>{d.limit}</span> },
        ]);
        setGridData([
          { acc: "10091876543", name: "Karan Johar", bal: "₹1,245,600", limit: "₹500,000" },
          { acc: "10091876123", name: "Ananya Pandey", bal: "₹840,300", limit: "₹250,000" },
          { acc: "10091876356", name: "Sunil Shetty", bal: "₹2,150,000", limit: "₹1,000,000" }
        ]);
      } else {
        setGridColumns([
          { header: "Key", accessor: (d) => <span>{d.key}</span> },
          { header: "Value/Observed", accessor: (d) => <span className="text-slate-200">{d.val}</span> }
        ]);
        setGridData([
          { key: "STATUS_TAG", val: "QUERY_EXECUTION_COMPLETED" },
          { key: "AFFECTED_ROWS", val: "1 row (vacuum log written)" }
        ]);
      }

      setHistory(prev => [
        {
          timestamp: new Date().toTimeString().split(" ")[0],
          query: sqlText,
          status: "SUCCESS",
          durationMs: parseFloat((Math.random() * 20).toFixed(2))
        },
        ...prev
      ]);

      toast({
        title: "Execution Completed",
        description: `Affected rows: ${isSelectAll ? 3 : 2}`
      });
    }, 800);
  };

  const handleSaveQuery = () => {
    toast({
      title: "Query Saved",
      description: "SQL Statement cataloged in local DBA cache directory."
    });
  };

  return (
    <EmployeeLayout>
      <WorkspaceHeader
        title="Interactive Database Query SQL Console"
        breadcrumbs={["Portal", "DBA", "SQL Console"]}
        status="OPERATIONAL"
        riskSummary="Database: Core_Ledger_Postgres"
      />

      <div className="flex-1 overflow-hidden p-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Saved queries sidebar */}
        <div className="space-y-4 lg:col-span-1 overflow-y-auto no-scrollbar pr-1.5 h-full">
          <DashboardCard title="Saved Queries" description="Reusable SQL skeletons">
            <div className="space-y-2">
              {SAVED_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setSqlText(q)}
                  className="w-full text-left p-2 bg-[#090d16] border border-[#172033] hover:border-slate-500 rounded font-mono text-[10px] text-slate-400 truncate block leading-normal transition-colors"
                  title={q}
                >
                  {q}
                </button>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Recent History" description="Active session logs">
            <div className="space-y-2">
              {history.map((h, idx) => (
                <div key={idx} className="p-2 bg-[#090d16] border border-[#172033] rounded font-mono text-[9px] text-slate-500 space-y-1">
                  <div className="flex justify-between items-center text-[8px]">
                    <span className="text-emerald-500">{h.status}</span>
                    <span>{h.timestamp}</span>
                  </div>
                  <p className="text-slate-300 truncate" title={h.query}>{h.query}</p>
                  <span className="text-slate-500 block text-right">{h.durationMs}ms</span>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>

        {/* SQL Editor and Result Area */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden min-h-0">
          {/* SQL Editor input */}
          <DashboardCard
            title="PostgreSQL Terminal Query Editor"
            description="Execute database commands"
            headerActions={
              <div className="flex items-center gap-2">
                <ActionButton onClick={handleSaveQuery} variant="outline" size="sm" className="flex items-center gap-1 h-7">
                  <Save className="h-3.5 w-3.5" />
                  Save Query
                </ActionButton>
                <ActionButton onClick={handleExecuteQuery} disabled={loading} size="sm" className="bg-emerald-700 hover:bg-emerald-600 text-white border-0 flex items-center gap-1 h-7">
                  <Play className="h-3.5 w-3.5" />
                  Execute Command
                </ActionButton>
              </div>
            }
            className="shrink-0"
          >
            <div className="relative">
              <textarea
                value={sqlText}
                onChange={(e) => setSqlText(e.target.value)}
                className="w-full min-h-[120px] bg-[#090d16] border border-[#1f2937] rounded p-3 font-mono text-xs text-slate-200 outline-none focus:border-slate-500 resize-y"
              />
              <div className="absolute right-3 bottom-3 text-[9px] font-mono text-slate-600 flex items-center gap-1.5 pointer-events-none select-none">
                <Terminal className="h-3 w-3" />
                SQL Mode
              </div>
            </div>
          </DashboardCard>

          {/* Grid Output */}
          <DashboardCard
            title="Statement Execution Result Grid"
            description="Tabular outputs registry"
            className="flex-1 min-h-0"
          >
            {loading ? (
              <div className="flex items-center justify-center h-full text-xs text-slate-500 font-mono gap-2">
                <div className="h-4 w-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                Compiling ledger dataset...
              </div>
            ) : gridData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 border border-dashed border-[#1f2937] rounded">
                <Database className="h-8 w-8 text-slate-600 mb-2" />
                <span className="text-xs font-semibold text-slate-400">Empty Result Set</span>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Input SQL query and click Execute to query database records.</p>
              </div>
            ) : (
              <div className="h-full overflow-y-auto no-scrollbar">
                <SecurityDataTable
                  data={gridData}
                  columns={gridColumns}
                  keyExtractor={(d) => d.acc || d.key}
                />
              </div>
            )}
          </DashboardCard>
        </div>
      </div>
    </EmployeeLayout>
  );
}
