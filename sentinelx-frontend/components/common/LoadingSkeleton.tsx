import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 3, className }) => {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-6 w-1/3 bg-[#1f2937]" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full bg-[#1f2937]/50" />
        ))}
      </div>
    </div>
  );
};
