import { create } from "zustand";

const API_BASE = "http://127.0.0.1:8000/api";

let cachedToken: string | null = null;

async function getAuthToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "analyst" }),
    });
    if (res.ok) {
      const data = await res.json();
      cachedToken = data.token;
      return data.token;
    }
  } catch (err) {
    console.error("Zustand token fetch error:", err);
  }
  return "";
}

export interface SimulationScenario {
  id: string;
  name: string;
  category: "normal" | "attack" | "privileged";
  description: string;
  stepsCount: number;
}

interface SimulationState {
  isRunning: boolean;
  speed: number; // multiplier: 1x, 2x, 5x, 10x
  activeScenarioId: string | null;
  currentStepIndex: number;
  progress: number; // 0 to 100
  scenarios: SimulationScenario[];
  setRunning: (isRunning: boolean) => Promise<void>;
  setSpeed: (speed: number) => Promise<void>;
  setActiveScenario: (id: string | null) => Promise<void>;
  setCurrentStepIndex: (index: number) => void;
  setProgress: (progress: number) => void;
  resetSimulation: () => Promise<void>;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  isRunning: false,
  speed: 1,
  activeScenarioId: null,
  currentStepIndex: 0,
  progress: 0,
  scenarios: [
    {
      id: "SCN-001",
      name: "Normal Session Routine",
      category: "normal",
      description: "Simulates normal DBA activities during banking hours (reports generation, backup checks).",
      stepsCount: 5,
    },
    {
      id: "SCN-002",
      name: "Dynamic Insider Threat Run",
      category: "attack",
      description: "DBA attempts unauthorized schema downloads, triggering dynamic anomaly elevation and PDP step-up challenge.",
      stepsCount: 7,
    },
    {
      id: "SCN-003",
      name: "Privileged Access Overrides",
      category: "privileged",
      description: "Supervised session override by infrastructure manager, validating continuous audit chain signatures.",
      stepsCount: 6,
    },
  ],
  setRunning: async (isRunning) => {
    set({ isRunning });
    try {
      const token = await getAuthToken();
      const endpoint = isRunning ? "/simulation/start" : "/simulation/pause";
      await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (e) {
      console.error("Failed to set simulation running status on backend:", e);
    }
  },
  setSpeed: async (speed) => {
    set({ speed });
    try {
      const token = await getAuthToken();
      await fetch(`${API_BASE}/simulation/speed?speed=${speed}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (e) {
      console.error("Failed to update simulation speed on backend:", e);
    }
  },
  setActiveScenario: async (id) => {
    set({ activeScenarioId: id, currentStepIndex: 0, progress: 0 });
    try {
      if (id) {
        const token = await getAuthToken();
        await fetch(`${API_BASE}/simulation/load?scenario_id=${id}`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.error("Failed to load scenario on backend:", e);
    }
  },
  setCurrentStepIndex: (index) => set({ currentStepIndex: index }),
  setProgress: (progress) => set({ progress }),
  resetSimulation: async () => {
    set({ isRunning: false, currentStepIndex: 0, progress: 0, activeScenarioId: null });
    try {
      const token = await getAuthToken();
      await fetch(`${API_BASE}/simulation/reset`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (e) {
      console.error("Failed to reset simulation on backend:", e);
    }
  },
}));
