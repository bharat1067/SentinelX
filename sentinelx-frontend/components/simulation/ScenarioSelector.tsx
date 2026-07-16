import React from "react";
import { cn } from "@/lib/utils";
import { useSimulationStore } from "@/stores/simulation.store";
import { IconRegistry } from "@/constants/icons";

interface ScenarioSelectorProps {
  className?: string;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ className }) => {
  const { scenarios, activeScenarioId, setActiveScenario } = useSimulationStore();
  const NetworkIcon = IconRegistry.Network;

  return (
    <div className={cn("p-4 bg-[#0f1524] border border-[#1f2937] rounded", className)}>
      <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 mb-3">
        <NetworkIcon className="h-3.5 w-3.5 text-slate-400" />
        Simulation Scenario Select
      </span>

      <div className="space-y-2">
        {scenarios.map((scenario) => {
          const isActive = scenario.id === activeScenarioId;

          let badgeColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
          if (scenario.category === "attack") {
            badgeColor = "text-red-400 bg-red-950/20 border-red-900/30";
          } else if (scenario.category === "privileged") {
            badgeColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
          }

          return (
            <div
              key={scenario.id}
              onClick={() => setActiveScenario(scenario.id)}
              className={cn(
                "p-3 rounded border text-left cursor-pointer transition-all hover:bg-slate-900",
                isActive
                  ? "bg-[#172033] border-slate-400"
                  : "bg-[#090d16] border-[#1f2937]"
              )}
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-xs font-semibold text-slate-200">{scenario.name}</span>
                <span className={cn("text-[9px] font-mono px-1.5 py-0.25 border rounded uppercase", badgeColor)}>
                  {scenario.category}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed font-mono">
                {scenario.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
