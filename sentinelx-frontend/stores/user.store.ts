import { create } from "zustand";

export type UserRole = "Employee" | "SOC Analyst" | "Manager";

export interface UserPersona {
  name: string;
  role: UserRole;
  badge: string;
  department: string;
  avatarUrl?: string;
  clearanceLevel: string;
  lastLogin: string;
}

export const PREDEFINED_PERSONAS: Record<UserRole, UserPersona> = {
  "Employee": {
    name: "Privileged Database Administrator",
    role: "Employee",
    badge: "DBA-ADMIN",
    department: "Core Banking Systems",
    clearanceLevel: "Level-3 Privileged",
    lastLogin: "2026-07-15 14:04:35",
  },
  "SOC Analyst": {
    name: "Senior SOC Security Analyst",
    role: "SOC Analyst",
    badge: "SOC-LV2",
    department: "Global Cyber Defense",
    clearanceLevel: "Level-4 Security",
    lastLogin: "2026-07-15 13:58:12",
  },
  "Manager": {
    name: "IT Infrastructure Manager",
    role: "Manager",
    badge: "MGR-EXEC",
    department: "IT Risk & Governance",
    clearanceLevel: "Level-4 Authorization",
    lastLogin: "2026-07-15 11:20:00",
  },
};

interface UserState {
  isAuthenticated: boolean;
  activePersona: UserPersona | null;
  login: (role: UserRole) => void;
  logout: () => void;
  setPersona: (persona: UserPersona) => void;
}

export const useUserStore = create<UserState>((set) => ({
  isAuthenticated: false,
  activePersona: null,
  login: (role) => {
    set({
      isAuthenticated: true,
      activePersona: PREDEFINED_PERSONAS[role],
    });
  },
  logout: () => {
    set({
      isAuthenticated: false,
      activePersona: null,
    });
  },
  setPersona: (persona) => set({ activePersona: persona }),
}));
