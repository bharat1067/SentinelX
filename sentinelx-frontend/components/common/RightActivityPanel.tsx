import React from "react";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/stores/layout.store";
import { useAlertStore } from "@/stores/alert.store";
import { IconRegistry } from "@/constants/icons";
import { X, TrendingDown, RefreshCw, Zap } from "lucide-react";

interface RightActivityPanelProps {
  className?: string;
}

export const RightActivityPanel: React.FC<RightActivityPanelProps> = ({ className }) => {
  const { rightPanelOpen, setRightPanelOpen } = useLayoutStore();
  const { alerts } = useAlertStore();

  const MonitorIcon = IconRegistry.Monitoring;

  if (!rightPanelOpen) return null;

  return (
    <aside
      className={cn(
        "w-80 border-l border-[#1f2937] bg-[#0c101d] flex flex-col shrink-0 h-full overflow-hidden transition-all duration-300",
        className
      )}
    >
      <div className="border-b border-[#1f2937] px-4 py-3 flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <MonitorIcon className="h-3.5 w-3.5" />
          Realtime Feed
        </span>
        <button
          onClick={() => setRightPanelOpen(false)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {/* Trust changes section */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            Recent Trust Deviations
          </span>
          <div className="space-y-1.5">
            <div className="p-2.5 bg-[#0f1524] border border-red-950/30 rounded flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <div>
                  <span className="text-[11px] font-semibold text-slate-300 block">DBA Bypass Check</span>
                  <span className="text-[9px] text-slate-500 font-mono">User: DBA_Root</span>
                </div>
              </div>
              <span className="text-xs font-bold text-red-400 font-mono">-24 Trust</span>
            </div>
            <div className="p-2.5 bg-[#0f1524] border border-[#172033] rounded flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-emerald-500" />
                <div>
                  <span className="text-[11px] font-semibold text-slate-300 block">Verification Check</span>
                  <span className="text-[9px] text-slate-500 font-mono">User: Mgr_IT</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-500 font-mono">+5 Trust</span>
            </div>
          </div>
        </div>

        {/* Dynamic Alerts Queue list */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            Latest Anomalies ({alerts.length})
          </span>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="p-2.5 bg-[#0f1524] border border-[#1f2937] rounded flex flex-col gap-1 hover:border-slate-500 transition-colors"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[11px] font-semibold text-slate-200 line-clamp-1">
                    {alert.title}
                  </span>
                  <span className="text-[8px] font-mono text-slate-500 shrink-0">
                    {alert.id}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 font-mono leading-normal">
                  {alert.description}
                </p>
                <div className="flex justify-between items-center mt-1 border-t border-[#172033] pt-1 text-[9px] font-mono">
                  <span className="text-red-400">Risk: {alert.score}%</span>
                  <span className="text-slate-500">{alert.timestamp.split(" ")[1]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Policy Recommendations */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            Security Recommends
          </span>
          <div className="p-2.5 bg-[#0f1524] border border-sky-950/20 rounded flex gap-2.5 items-start">
            <Zap className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-semibold text-slate-300 block">Step-Up Auth Required</span>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5 leading-relaxed">
                DBA requested resources map to critical customer ledger metadata. Force MFA validation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
