import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}) => {
  let styleClass = "";

  switch (variant) {
    case "primary":
      styleClass = "bg-slate-200 hover:bg-slate-300 text-slate-900 border-0";
      break;
    case "secondary":
      styleClass = "bg-[#172033] hover:bg-[#1f2d47] text-slate-100 border border-[#1f2937]";
      break;
    case "destructive":
      styleClass = "bg-red-800 hover:bg-red-700 text-white border-0";
      break;
    case "outline":
      styleClass = "bg-transparent border border-[#1f2937] hover:bg-slate-900 text-slate-300";
      break;
  }

  let sizeClass = "h-9 px-4 text-xs";
  if (size === "sm") sizeClass = "h-7 px-3 text-[11px]";
  else if (size === "lg") sizeClass = "h-10 px-6 text-sm";

  return (
    <Button
      className={cn(
        "font-semibold rounded transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed",
        styleClass,
        sizeClass,
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};
