import React from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, children, className }) => {
  return (
    <div className={cn("p-4 border border-[#172033] bg-[#090d16] rounded flex flex-col gap-2", className)}>
      {title && (
        <h4 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono mb-2">
          {title}
        </h4>
      )}
      {children}
    </div>
  );
};
