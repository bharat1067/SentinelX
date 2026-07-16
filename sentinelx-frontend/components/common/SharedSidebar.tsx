"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user.store";
import { useLayoutStore } from "@/stores/layout.store";
import { IconRegistry } from "@/constants/icons";
import { Menu, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItem {
  label: string;
  href: string;
  icon: keyof typeof IconRegistry;
}

const SIDEBAR_ITEMS: Record<string, SidebarItem[]> = {
  "Employee": [
    { label: "Dashboard", href: "/portal/employee", icon: "Monitoring" },
    { label: "Customer Database", href: "/portal/employee/customers", icon: "Employees" },
    { label: "Accounts", href: "/portal/employee/accounts", icon: "Identity" },
    { label: "Transactions", href: "/portal/employee/transactions", icon: "Security" },
    { label: "Loans", href: "/portal/employee/loans", icon: "Audit" },
    { label: "Cards", href: "/portal/employee/cards", icon: "PrivilegedAccess" },
    { label: "Branches", href: "/portal/employee/branches", icon: "Network" },
    { label: "Employees", href: "/portal/employee/employees", icon: "Employees" },
    { label: "Reports", href: "/portal/employee/reports", icon: "Report" },
    { label: "Database Console", href: "/portal/employee/database", icon: "Database" },
    { label: "Backup Center", href: "/portal/employee/backup", icon: "Database" },
    { label: "User Management", href: "/portal/employee/users", icon: "Identity" },
    { label: "Role Management", href: "/portal/employee/roles", icon: "Identity" },
    { label: "System Configuration", href: "/portal/employee/config", icon: "Settings" },
    { label: "Server Health", href: "/portal/employee/health", icon: "Metrics" },
    { label: "Audit Logs", href: "/portal/employee/audit", icon: "Audit" },
    { label: "Downloads", href: "/portal/employee/downloads", icon: "Download" },
    { label: "Settings", href: "/portal/employee/settings", icon: "Settings" }
  ],
  "SOC Analyst": [
    { label: "Dashboard", href: "/portal/soc", icon: "Monitoring" },
    { label: "Investigations", href: "/portal/soc/investigations", icon: "Search" },
    { label: "Policies", href: "/portal/soc/policies", icon: "Sliders" },
    { label: "Analytics", href: "/portal/soc/analytics", icon: "Network" },
    { label: "Administration", href: "/portal/soc/administration", icon: "Settings" }
  ],
  "Manager": [
    { label: "Dashboard", href: "/portal/manager", icon: "Monitoring" },
    { label: "Pending Approvals", href: "/portal/manager/approvals", icon: "Approvals" },
    { label: "Approvals History", href: "/portal/manager/history", icon: "Audit" },
    { label: "Incidents", href: "/portal/manager/incidents", icon: "Critical" },
    { label: "Audit Log", href: "/portal/manager/audit", icon: "Audit" },
    { label: "Profile", href: "/portal/manager/profile", icon: "Identity" }
  ]
};

export const SharedSidebar: React.FC = () => {
  const pathname = usePathname();
  const { activePersona } = useUserStore();
  const { sidebarOpen, toggleSidebar } = useLayoutStore();

  const items = activePersona ? SIDEBAR_ITEMS[activePersona.role] || [] : [];

  return (
    <aside
      className={cn(
        "bg-[#0c101d] border-r border-[#1f2937] flex flex-col shrink-0 h-full overflow-hidden transition-all duration-300 select-none",
        sidebarOpen ? "w-52" : "w-12"
      )}
    >
      {/* Toggle button row */}
      <div className="h-10 border-b border-[#1f2937]/50 flex items-center justify-end px-3 shrink-0">
        <button
          onClick={toggleSidebar}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav list */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = IconRegistry[item.icon];

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors font-medium",
                isActive
                  ? "bg-[#172033] text-slate-100 font-semibold border-l-2 border-slate-400 pl-[10px]"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Persona card bottom */}
      {activePersona && sidebarOpen && (
        <div className="p-3 border-t border-[#1f2937] bg-[#090d16] shrink-0 font-mono text-[9px] text-slate-500">
          <span>ROLE: {activePersona.role.toUpperCase()}</span>
        </div>
      )}
    </aside>
  );
};
