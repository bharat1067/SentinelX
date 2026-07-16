import { create } from "zustand";

export type SeverityLevel = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "open" | "investigating" | "resolved" | "suppressed";

export interface SecurityAlert {
  id: string;
  title: string;
  source: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  user: string;
  ip: string;
  score: number;
  timestamp: string;
  description: string;
  analyst_feedback?: string;
}

interface AlertState {
  alerts: SecurityAlert[];
  addAlert: (alert: SecurityAlert) => void;
  updateAlertStatus: (id: string, status: IncidentStatus) => void;
  clearAlerts: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [
    {
      id: "ALT-101",
      title: "Suspicious Privilege Escalation",
      source: "CyberArk Registry Gateway",
      severity: "critical",
      status: "open",
      user: "Privileged Database Administrator",
      ip: "10.15.2.14",
      score: 94,
      timestamp: "2026-07-15 14:04:10",
      description: "User requested elevation to database schema root bypass outside standard operational timeframe."
    },
    {
      id: "ALT-102",
      title: "Anomalous Multiple Read Transactions",
      source: "Database Access Auditor",
      severity: "high",
      status: "investigating",
      user: "Privileged Database Administrator",
      ip: "10.15.2.14",
      score: 78,
      timestamp: "2026-07-15 14:02:45",
      description: "Read commands executed sequentially across 50 individual customer profiles in 10 seconds."
    },
    {
      id: "ALT-103",
      title: "Concurrent Geolocation Logins",
      source: "Azure Directory Monitor",
      severity: "medium",
      status: "open",
      user: "IT Infrastructure Manager",
      ip: "192.168.4.150",
      score: 52,
      timestamp: "2026-07-15 13:59:00",
      description: "Manager login session opened from Mumbai corporate building while active VPN session exists from Pune."
    },
    {
      id: "ALT-104",
      title: "Unusual SQL Dump Command",
      source: "PostgreSQL Database Engine",
      severity: "low",
      status: "resolved",
      user: "Privileged Database Administrator",
      ip: "10.15.2.14",
      score: 35,
      timestamp: "2026-07-15 13:51:22",
      description: "SQL Schema backup request initialized on a replica node."
    }
  ],
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  updateAlertStatus: (id, status) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, status } : a)),
    })),
  clearAlerts: () => set({ alerts: [] }),
}));
