import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { IconRegistry } from "@/constants/icons";

interface FloatingNotificationProps {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  onClose?: (id: string) => void;
  className?: string;
}

export const FloatingNotification: React.FC<FloatingNotificationProps> = ({
  id,
  title,
  message,
  type,
  onClose,
  className
}) => {
  let iconClass = "text-sky-500";
  let Icon = IconRegistry.Info;
  let borderClass = "border-sky-950 bg-sky-950/10";

  if (type === "success") {
    iconClass = "text-emerald-500";
    Icon = IconRegistry.Success;
    borderClass = "border-emerald-950 bg-emerald-950/10";
  } else if (type === "warning") {
    iconClass = "text-amber-500";
    Icon = IconRegistry.Critical;
    borderClass = "border-amber-950 bg-amber-950/10";
  } else if (type === "error") {
    iconClass = "text-red-500";
    Icon = IconRegistry.Error;
    borderClass = "border-red-950 bg-red-950/10";
  }

  return (
    <div className={cn("p-3 border rounded shadow-lg flex gap-3 items-start max-w-[320px] transition-all duration-300", borderClass, className)}>
      <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", iconClass)} />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-slate-200 block">{title}</span>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5 leading-normal">
          {message}
        </p>
      </div>
      {onClose && (
        <button
          onClick={() => onClose(id)}
          className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
