import React from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ className, ...props }) => {
  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
      <Input
        type="search"
        className="pl-9 bg-[#090d16] border-[#1f2937] text-xs h-9 text-slate-200 placeholder-slate-500 focus-visible:ring-slate-700"
        {...props}
      />
    </div>
  );
};
