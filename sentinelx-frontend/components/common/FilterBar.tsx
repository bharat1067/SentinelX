import React from "react";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  options,
  selectedValue,
  onChange,
  label = "Severity",
  className
}) => {
  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      <span className="text-slate-500 flex items-center gap-1 font-mono uppercase text-[10px]">
        <Filter className="h-3 w-3" />
        {label}:
      </span>
      <select
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#090d16] border border-[#1f2937] text-slate-300 rounded px-2.5 py-1 text-xs outline-none focus:border-slate-500 transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0f1524]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
