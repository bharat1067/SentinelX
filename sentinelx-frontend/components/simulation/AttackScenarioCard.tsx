import React from "react";
import { cn } from "@/lib/utils";
import { IconRegistry } from "@/constants/icons";

interface AttackScenarioCardProps {
  className?: string;
}

export const AttackScenarioCard: React.FC<AttackScenarioCardProps> = ({ className }) => {
  const CriticalIcon = IconRegistry.Critical;

  return (
    <div className={cn("p-4 bg-[#0f1524] border border-[#ef4444]/30 rounded flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <CriticalIcon className="h-4 w-4 text-red-500 animate-pulse" />
        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
          Threat Vector: Active Attack Scenario
        </span>
      </div>

      <p className="text-[11px] text-slate-300 font-mono leading-relaxed bg-[#7f1d1d]/10 p-2.5 border border-[#7f1d1d]/30 rounded">
        ALERT: Privilege Escalation attack simulation runs next. Attacker DBA bypasses CyberArk vault checks via localized session side-jacking.
      </p>

      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500">
        <div>Actor: <span className="text-slate-300">DBA_Root_Bypass</span></div>
        <div>Target: <span className="text-slate-300">Customer_Core_DB</span></div>
        <div>Threat Level: <span className="text-red-400">CRITICAL (94%)</span></div>
        <div>Payload: <span className="text-slate-300">DB_Dump_Sequencer</span></div>
      </div>
    </div>
  );
};
