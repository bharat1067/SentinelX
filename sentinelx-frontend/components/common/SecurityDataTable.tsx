import React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

interface SecurityDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyState?: React.ReactNode;
  className?: string;
}

export function SecurityDataTable<T>({
  data,
  columns,
  keyExtractor,
  emptyState,
  className,
}: SecurityDataTableProps<T>) {
  return (
    <div className={cn("border border-[#1f2937] rounded bg-[#0f1524] overflow-x-auto", className)}>
      <Table className="min-w-full divide-y divide-[#1f2937] text-left">
        <TableHeader className="bg-[#090d16] border-b border-[#1f2937]">
          <TableRow className="hover:bg-transparent border-0">
            {columns.map((column, idx) => (
              <TableHead
                key={idx}
                className={cn(
                  "text-[10px] font-bold tracking-wider text-slate-500 uppercase h-8 px-4 py-2 border-0",
                  column.className
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-[#172033] border-0">
          {data.length === 0 ? (
            <TableRow className="hover:bg-transparent border-0">
              <TableCell colSpan={columns.length} className="px-4 py-8 text-center">
                {emptyState || (
                  <span className="text-xs text-slate-500 font-mono">No records loaded.</span>
                )}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow
                key={keyExtractor(item)}
                className="hover:bg-[#172033]/40 border-b border-[#172033] last:border-0 transition-colors"
              >
                {columns.map((column, idx) => (
                  <TableCell
                    key={idx}
                    className={cn(
                      "px-4 py-2 text-xs font-mono text-slate-300 h-8 border-0",
                      column.className
                    )}
                  >
                    {column.accessor(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
