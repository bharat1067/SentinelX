import React from "react";
import { cn } from "@/lib/utils";
import { useSimulationStore } from "@/stores/simulation.store";

export interface ScenarioStep {
  label: string;
  desc: string;
  riskInc: number;
}

const MOCK_STEPS: Record<string, ScenarioStep[]> = {
  "SCN-001": [
    { label: "Initialize Session", desc: "DBA logs into terminal during normal business hours", riskInc: 0 },
    { label: "Access Billing Catalog", desc: "Select and read standard tables schema metadata", riskInc: 5 },
    { label: "Query Transactions", desc: "Performs regular daily query counts", riskInc: 2 },
    { label: "Generate Day Report", desc: "Outputs compiled billing analytics as CSV", riskInc: 3 },
    { label: "Logout", desc: "Closes connection to terminal securely", riskInc: 0 }
  ],
  "SCN-002": [
    { label: "Initialize Session", desc: "DBA logs in outside normal hours (02:00 AM)", riskInc: 15 },
    { label: "Access Privileged DB", desc: "Requests session bypass authorization bypass via vault", riskInc: 20 },
    { label: "Rapid Sequence Read", desc: "Queries multiple high-importance customer balances", riskInc: 25 },
    { label: "Trigger PDP Stepup", desc: "Threat score hits threshold. System triggers approval desk challenge", riskInc: 15 },
    { label: "Manager Override", desc: "Manager reviews alert parameters and declines access", riskInc: 0 },
    { label: "Orchestrate Session Block", desc: "SOAR triggers active session kill and credentials freeze", riskInc: 10 },
    { label: "Log Signed Chain", desc: "Append and sign event hashes on the ledger", riskInc: 0 }
  ],
  "SCN-003": [
    { label: "Open Manager Console", desc: "Infrastructure Manager logs in from Mumbai office", riskInc: 0 },
    { label: "Geographical Drift Anomaly", desc: "Active VPN पुणे session overlaps with Mumbai terminal IP", riskInc: 45 },
    { label: "Access Override Desk", desc: "Inspect pending DBA elevation logs", riskInc: 10 },
    { label: "Audit Ledger Check", desc: "Launch cryptographic signature check for integrity logs", riskInc: 0 },
    { label: "Authorize Temporary Tokens", desc: "Signs access voucher using keys", riskInc: 5 },
    { label: "Trigger Continuous Audit", desc: "Decisions and approvals chained to audit records", riskInc: 0 }
  ]
};

interface ScenarioTimelineProps {
  className?: string;
}

export const ScenarioTimeline: React.FC<ScenarioTimelineProps> = ({ className }) => {
  const { activeScenarioId, currentStepIndex } = useSimulationStore();
  const steps = activeScenarioId ? MOCK_STEPS[activeScenarioId] || [] : [];

  if (!activeScenarioId || steps.length === 0) {
    return (
      <div className={cn("p-4 bg-[#0f1524] border border-[#1f2937] rounded text-center text-xs text-slate-500 font-mono", className)}>
        Select a scenario to view steps timeline.
      </div>
    );
  }

  return (
    <div className={cn("p-4 bg-[#0f1524] border border-[#1f2937] rounded flex flex-col gap-3", className)}>
      <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
        Scenario Timeline Steps
      </span>

      <div className="relative border-l border-[#1f2937] ml-2 pl-4 space-y-4">
        {steps.map((step, idx) => {
          const isPassed = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;

          return (
            <div key={idx} className="relative flex gap-3 items-start">
              {/* Timeline marker */}
              <div
                className={cn(
                  "absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full border transition-all",
                  isPassed
                    ? "bg-emerald-500 border-emerald-500 scale-90"
                    : isActive
                    ? "bg-sky-500 border-sky-500 scale-110 ring-2 ring-sky-950"
                    : "bg-slate-900 border-[#1f2937]"
                )}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className={cn("font-semibold", isActive ? "text-sky-400" : isPassed ? "text-slate-300" : "text-slate-500")}>
                    {step.label}
                  </span>
                  {step.riskInc > 0 && (
                    <span className={cn("text-[9px] font-mono", isActive ? "text-red-400" : "text-slate-500")}>
                      Risk +{step.riskInc}
                    </span>
                  )}
                </div>
                <p className={cn("text-[10px] leading-relaxed mt-0.5 font-mono", isActive ? "text-slate-200" : "text-slate-500")}>
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
