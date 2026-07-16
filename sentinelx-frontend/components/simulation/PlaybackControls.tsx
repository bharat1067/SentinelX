import React from "react";
import { cn } from "@/lib/utils";
import { useSimulationStore } from "@/stores/simulation.store";
import { IconRegistry } from "@/constants/icons";
import { Button } from "@/components/ui/button";

interface PlaybackControlsProps {
  className?: string;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({ className }) => {
  const {
    isRunning,
    speed,
    activeScenarioId,
    setRunning,
    setSpeed,
    resetSimulation
  } = useSimulationStore();

  const PlayIcon = IconRegistry.Play;
  const PauseIcon = IconRegistry.Pause;
  const ResetIcon = IconRegistry.Reset;

  const handlePlayToggle = () => {
    if (!activeScenarioId) return;
    setRunning(!isRunning);
  };

  return (
    <div className={cn("p-4 bg-[#0f1524] border border-[#1f2937] rounded flex flex-col gap-3", className)}>
      <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
        Scenario Playback Controls
      </span>

      <div className="flex items-center gap-2">
        <Button
          disabled={!activeScenarioId}
          onClick={handlePlayToggle}
          size="sm"
          className={cn(
            "flex-1 text-[11px] h-8 border-0 text-white font-semibold",
            isRunning
              ? "bg-amber-700 hover:bg-amber-600"
              : "bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
          )}
        >
          {isRunning ? (
            <span className="flex items-center justify-center gap-1.5">
              <PauseIcon className="h-3.5 w-3.5" />
              Pause Run
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <PlayIcon className="h-3.5 w-3.5" />
              Run Scenario
            </span>
          )}
        </Button>

        <Button
          onClick={resetSimulation}
          variant="outline"
          size="sm"
          className="border-[#1f2937] hover:bg-slate-800 text-slate-300 text-[11px] h-8"
        >
          <ResetIcon className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex items-center justify-between border-t border-[#172033] pt-3 text-xs">
        <span className="text-slate-500 font-mono">Simulation Speed:</span>
        <div className="flex items-center gap-1">
          {[1, 2, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={cn(
                "px-2 py-0.5 border rounded font-mono text-[10px] transition-all",
                speed === s
                  ? "bg-[#172033] border-slate-400 text-slate-200"
                  : "bg-[#090d16] border-[#1f2937] text-slate-500 hover:text-slate-300"
              )}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
