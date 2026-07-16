import React from "react";
import { cn } from "@/lib/utils";
import { useSimulationStore } from "@/stores/simulation.store";

interface SimulationProgressProps {
  className?: string;
}

export const SimulationProgress: React.FC<SimulationProgressProps> = ({ className }) => {
  const { progress, activeScenarioId, currentStepIndex, scenarios } = useSimulationStore();
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId);

  if (!activeScenarioId || !activeScenario) {
    return (
      <div className={cn("p-4 bg-[#0f1524] border border-[#1f2937] rounded text-center text-xs text-slate-500 font-mono", className)}>
        No active scenario running.
      </div>
    );
  }

  return (
    <div className={cn("p-4 bg-[#0f1524] border border-[#1f2937] rounded flex flex-col gap-2", className)}>
      <div className="flex justify-between items-center text-xs font-mono">
        <span className="text-slate-400 font-semibold">{activeScenario.name}</span>
        <span className="text-slate-500">
          Step {currentStepIndex + 1} / {activeScenario.stepsCount}
        </span>
      </div>

      <div className="w-full bg-[#172033] h-2 rounded overflow-hidden mt-1">
        <div
          className="h-full bg-sky-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-1">
        <span>Ingesting Scenarios...</span>
        <span>{progress}%</span>
      </div>
    </div>
  );
};
