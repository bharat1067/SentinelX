"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user.store";
import { useAlertStore, SecurityAlert, IncidentStatus } from "@/stores/alert.store";
import { useSimulationStore } from "@/stores/simulation.store";
import { useRouter, useParams } from "next/navigation";
import { SocLayout } from "@/layouts/soc/SocLayout";
import { WorkspaceHeader } from "@/components/common/WorkspaceHeader";
import { IncidentTable } from "@/components/common/IncidentTable";
import { PlaybackControls } from "@/components/simulation/PlaybackControls";
import { ScenarioSelector } from "@/components/simulation/ScenarioSelector";
import { SimulationProgress } from "@/components/simulation/SimulationProgress";
import { ScenarioTimeline } from "@/components/simulation/ScenarioTimeline";
import { TrustHistoryChart, ChartDataPoint } from "@/components/security/TrustHistoryChart";
import { RiskBreakdownCard, RiskFactor } from "@/components/security/RiskBreakdownCard";
import { DashboardCard } from "@/components/common/DashboardCard";
import { MetricCard } from "@/components/common/MetricCard";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldAlert,
  Users,
  Layers,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle
} from "lucide-react";

interface MockSession {
  sessionId: string;
  username: string;
  role: string;
  action: string;
  device: string;
  location: string;
  duration: string;
  database: string;
}

interface MockApproval {
  id: string;
  sessionId: string;
  user: string;
  action: string;
  sensitivity: string;
  status: "Pending" | "Approved" | "Rejected";
  reviewer: string;
  time: string;
  reason: string;
  comment?: string;
}

const MOCK_TELEMETRY_HISTORY: ChartDataPoint[] = [
  { time: "13:50", trustScore: 98, riskScore: 2 },
  { time: "13:52", trustScore: 95, riskScore: 5 },
  { time: "13:55", trustScore: 94, riskScore: 6 },
  { time: "13:58", trustScore: 82, riskScore: 18 },
  { time: "14:00", trustScore: 68, riskScore: 32 },
  { time: "14:02", trustScore: 42, riskScore: 58 },
  { time: "14:04", trustScore: 10, riskScore: 90 }
];

const MOCK_RISK_FACTORS: RiskFactor[] = [
  { name: "Anomalous Command sequence", score: 85, weight: 35, status: "high" },
  { name: "Out of Office Access hours", score: 90, weight: 20, status: "critical" },
  { name: "Cryptographic verification", score: 0, weight: 15, status: "low" },
  { name: "Geographical distance shift", score: 45, weight: 30, status: "medium" }
];

export default function SocAnalystDashboard() {
  const router = useRouter();
  const params = useParams();
  const rawTab = (params?.tab as string) || "dashboard";
  
  // Consolidate the 17 raw views into 5 primary containers
  let activeTab = rawTab;
  if (["alerts", "incidents", "sessions", "trace", "approvals"].includes(rawTab)) {
    activeTab = "investigations";
  } else if (["audit", "reports", "simulation", "settings"].includes(rawTab)) {
    activeTab = "administration";
  }

  const { toast } = useToast();
  const { isAuthenticated, activePersona } = useUserStore();
  const { alerts } = useAlertStore();
  const { isRunning, speed } = useSimulationStore();

  const API_BASE = "http://127.0.0.1:8000/api";

  // State Hooks
  const [token, setToken] = useState<string>("");
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(alerts[0] || null);
  const [sessions, setSessions] = useState<MockSession[]>([]);
  const [approvals, setApprovals] = useState<MockApproval[]>([]);
  const [approvalComment, setApprovalComment] = useState("");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Sub-Navigation tabs inside consolidated views
  const [investigationSubTab, setInvestigationSubTab] = useState("alerts");
  const [adminSubTab, setAdminSubTab] = useState("audit");

  // Keep subTab active state updated if redirected from rawTab URL
  useEffect(() => {
    if (["alerts", "incidents", "sessions", "trace", "approvals"].includes(rawTab)) {
      setInvestigationSubTab(rawTab);
    } else if (["audit", "reports", "simulation", "settings"].includes(rawTab)) {
      setAdminSubTab(rawTab);
    }
  }, [rawTab]);

  // Authenticate user on mount to fetch signed JWT access token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "analyst" })
        });
        if (res.ok) {
          const data = await res.json();
          setToken(data.token);
        }
      } catch (err) {
        console.error("Auth login fetch error:", err);
      }
    };
    fetchToken();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !activePersona || activePersona.role !== "SOC Analyst") {
      router.push("/");
    }
  }, [isAuthenticated, activePersona, router]);

  const criticalAlertsCount = alerts.filter(a => a.severity === "critical").length;

  // Pull dynamic states from backend
  const syncState = async () => {
    if (!token) return;
    try {
      const headers = { "Authorization": `Bearer ${token}` };

      const alertsRes = await fetch(`${API_BASE}/alerts`, { headers });
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        useAlertStore.setState({ alerts: alertsData });
      }

      const sessionsRes = await fetch(`${API_BASE}/sessions`, { headers });
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData);
      }

      const approvalsRes = await fetch(`${API_BASE}/approvals`, { headers });
      if (approvalsRes.ok) {
        const approvalsData = await approvalsRes.json();
        setApprovals(approvalsData);
      }

      const auditRes = await fetch(`${API_BASE}/audit`, { headers });
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData);
      }

      const statusRes = await fetch(`${API_BASE}/simulation/status`, { headers });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        useSimulationStore.setState({
          isRunning: statusData.isRunning,
          speed: statusData.speed,
          currentStepIndex: statusData.currentStepIndex,
          progress: statusData.progress,
          activeScenarioId: statusData.activeScenarioId
        });
      }
    } catch (err) {
      console.error("Failed to sync backend state:", err);
    }
  };

  // Poll state
  useEffect(() => {
    if (!token) return;
    syncState();
    const interval = setInterval(syncState, 2000);
    return () => clearInterval(interval);
  }, [token]);

  // Drive simulation ticks
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const activeScenarioId = useSimulationStore.getState().activeScenarioId;
    if (isRunning && activeScenarioId && token) {
      timer = setInterval(async () => {
        try {
          const appPending = approvals.some(a => a.status === "Pending");
          const reviewer = appPending ? "None" : "IT Governance Manager";
          const approvalStatus = appPending ? "Pending" : "Approved";

          const res = await fetch(`${API_BASE}/simulation/step?approval_status=${approvalStatus}&reviewer=${reviewer}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            const stepResult = await res.json();
            if (stepResult.status === "FINISHED") {
              useSimulationStore.setState({ isRunning: false });
              toast({ title: "Simulation Finished", description: "Scenario sequence has run to completion." });
            } else {
              toast({
                title: `Simulation Step ${stepResult.current_step}`,
                description: `Ingested action: ${stepResult.event.event_type}`
              });
            }
          }
          await syncState();
        } catch (e) {
          console.error("Simulation step error:", e);
        }
      }, 3000 / speed);
    }
    return () => clearInterval(timer);
  }, [isRunning, speed, approvals, token]);

  // Administrative command handlers
  const handleApprove = async (id: string) => {
    try {
      await fetch(`${API_BASE}/approvals/${id}/action?action=Approved&reviewer=Manager`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setApprovalComment("");
      toast({
        title: "Request Approved",
        description: `Privileged transaction ${id} has been signed and authorized.`
      });
      await syncState();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetch(`${API_BASE}/approvals/${id}/action?action=Rejected&reviewer=Manager`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setApprovalComment("");
      toast({
        title: "Request Denied",
        description: `Privileged transaction ${id} rejected immediately.`
      });
      await syncState();
    } catch (e) {
      console.error(e);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      await fetch(`${API_BASE}/sessions/${sessionId}/terminate`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      toast({
        title: "Session Terminated",
        description: `Killed connection and locked keys for session ${sessionId}.`,
        variant: "destructive"
      });
      await syncState();
    } catch (e) {
      console.error(e);
    }
  };

  const triggerMfaChallenge = async (sessionId: string) => {
    try {
      await fetch(`${API_BASE}/sessions/${sessionId}/challenge`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      toast({
        title: "MFA Challenge Sent",
        description: `Pushed step-up biometric prompt to operator active on session ${sessionId}.`
      });
      await syncState();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateAlertStatus = async (alertId: string, status: IncidentStatus) => {
    try {
      await fetch(`${API_BASE}/alerts/${alertId}/status?status=${status}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      await syncState();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogFeedback = async (alertId: string, feedback: string) => {
    try {
      await fetch(`${API_BASE}/alerts/${alertId}/feedback?feedback=${feedback}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      toast({ title: "Feedback Logged", description: `Analyst classified incident ${alertId} as: ${feedback}` });
      await syncState();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated || !activePersona) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#07090f] text-slate-500 font-mono text-xs">
        Verifying security token clearance...
      </div>
    );
  }

  // Render tab contents
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-4">
                <ScenarioSelector />
                <PlaybackControls />
                <SimulationProgress />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <ScenarioTimeline />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <TrustHistoryChart data={MOCK_TELEMETRY_HISTORY} className="lg:col-span-2" />
              <RiskBreakdownCard factors={MOCK_RISK_FACTORS} />
            </div>
            <DashboardCard title="Active Ingested Incident Feeds Log" description="BOM security events ledger">
              <IncidentTable alerts={alerts} onSelect={(a) => {
                setSelectedAlert(a);
                toast({ title: "Alert Selected", description: `Active focus set to: ${a.id}` });
              }} />
            </DashboardCard>
          </div>
        );

      case "investigations":
        return (
          <div className="space-y-4">
            {/* Segment Subtab Control Header */}
            <div className="flex flex-wrap gap-2 border-b border-[#1f2937]/60 pb-3">
              {[
                { id: "alerts", label: "Live Alerts" },
                { id: "incidents", label: "Details Workspace" },
                { id: "sessions", label: "Active Sessions" },
                { id: "approvals", label: "Approvals Queue" },
                { id: "trace", label: "Decision Trace" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setInvestigationSubTab(t.id)}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs font-mono font-medium transition-all",
                    investigationSubTab === t.id
                      ? "bg-[#172033] text-slate-100 border border-slate-500/50"
                      : "bg-[#090d16]/40 text-slate-400 hover:text-slate-200 border border-transparent"
                  )}
                >
                  {t.label.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Inner Subtabs Rendering */}
            {investigationSubTab === "alerts" && (
              <DashboardCard title="Real-Time Alerts Feed" description="Continuously monitored access events">
                <div className="overflow-x-auto border border-[#1f2937] rounded bg-[#0f1524]">
                  <table className="min-w-full text-left text-xs font-mono">
                    <thead className="bg-[#090d16] text-slate-500 border-b border-[#1f2937]">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Source</th>
                        <th className="p-3">User</th>
                        <th className="p-3">IP Address</th>
                        <th className="p-3">Risk Score</th>
                        <th className="p-3">Severity</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#172033] text-slate-300">
                      {alerts.map((a) => (
                        <tr key={a.id} className="hover:bg-[#172033]/40 cursor-pointer" onClick={() => {
                          setSelectedAlert(a);
                          setInvestigationSubTab("incidents");
                          toast({ title: "Incident Loaded", description: `Selected: ${a.id}` });
                        }}>
                          <td className="p-3 font-semibold text-slate-400">{a.id}</td>
                          <td className="p-3 font-semibold text-slate-100">{a.title}</td>
                          <td className="p-3">{a.source}</td>
                          <td className="p-3">{a.user}</td>
                          <td className="p-3 text-slate-500">{a.ip}</td>
                          <td className="p-3 font-bold text-slate-200">{a.score}/100</td>
                          <td className="p-3"><SeverityBadge severity={a.severity} /></td>
                          <td className="p-3"><StatusBadge status={a.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DashboardCard>
            )}

            {investigationSubTab === "incidents" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Incidents List Left */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    Active Incidents Log
                  </span>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {alerts.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => setSelectedAlert(a)}
                        className={cn(
                          "p-3 rounded border cursor-pointer transition-all",
                          selectedAlert?.id === a.id
                            ? "bg-[#172033] border-slate-500 shadow-md"
                            : "bg-[#0f1524] border-[#1f2937] hover:border-slate-700"
                        )}
                      >
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono text-slate-500">{a.id}</span>
                          <SeverityBadge severity={a.severity} />
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 mt-1">{a.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{a.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Incidents Details Workspace Right */}
                <div className="lg:col-span-2 space-y-4">
                  {selectedAlert ? (
                    <div className="bg-[#0f1524] border border-[#1f2937] rounded p-5 space-y-5">
                      <div className="flex justify-between items-start border-b border-[#1f2937] pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-500 bg-[#090d16] px-1.5 py-0.5 rounded border border-[#1f2937]">
                              {selectedAlert.id}
                            </span>
                            <SeverityBadge severity={selectedAlert.severity} />
                            <StatusBadge status={selectedAlert.status} />
                          </div>
                          <h2 className="text-sm font-bold text-slate-100 mt-2">{selectedAlert.title}</h2>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {selectedAlert.description}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          <label className="text-[9px] font-mono text-slate-500 uppercase">Change Status</label>
                          <div className="flex gap-1">
                            {(["investigating", "resolved", "suppressed"] as IncidentStatus[]).map((status) => (
                              <Button
                                key={status}
                                onClick={() => {
                                  handleUpdateAlertStatus(selectedAlert.id, status);
                                  toast({ title: "Incident Updated", description: `${selectedAlert.id} set to: ${status}` });
                                }}
                                className={cn(
                                  "text-[10px] h-7 px-2 py-0 font-medium",
                                  selectedAlert.status === status
                                    ? "bg-slate-200 text-slate-900"
                                    : "bg-[#090d16] text-slate-400 hover:text-slate-200 border border-[#1f2937]"
                                )}
                              >
                                {status.toUpperCase()}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Classification feedback desk */}
                      <div className="bg-[#090d16]/60 border border-[#1f2937]/80 rounded p-4 space-y-3">
                        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <HelpCircle className="h-4 w-4 text-sky-400" /> Analyst Classification Feedback
                        </h4>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Submit true/false positive tags for this incident. This feedback logs decisions in the continuous audit ledger history.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: "True Positive", label: "True Positive", icon: AlertTriangle, style: "bg-red-950/20 text-red-400 border-red-900/30" },
                            { id: "False Positive", label: "False Positive", icon: XCircle, style: "bg-slate-900 text-slate-400 border-[#1f2937]" },
                            { id: "Needs Monitoring", label: "Needs Monitoring", icon: HelpCircle, style: "bg-yellow-950/20 text-yellow-400 border-yellow-900/30" },
                            { id: "Expected Behaviour", label: "Expected Behaviour", icon: CheckCircle, style: "bg-emerald-950/20 text-emerald-400 border-emerald-900/30" }
                          ].map((fb) => {
                            const Icon = fb.icon;
                            const isSelected = selectedAlert.analyst_feedback === fb.id;
                            return (
                              <button
                                key={fb.id}
                                onClick={() => handleLogFeedback(selectedAlert.id, fb.id)}
                                className={cn(
                                  "flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-mono border transition-all",
                                  isSelected
                                    ? "bg-sky-950/40 text-sky-400 border-sky-500 shadow-sm"
                                    : fb.style
                                )}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                {fb.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Details & Evidence</span>
                            <div className="bg-[#090d16] border border-[#1f2937] rounded p-3 font-mono text-[10px] space-y-2 text-slate-400">
                              <p><strong className="text-slate-300">Target User:</strong> {selectedAlert.user}</p>
                              <p><strong className="text-slate-300">Source Host:</strong> {selectedAlert.source}</p>
                              <p><strong className="text-slate-300">Ingress IP:</strong> {selectedAlert.ip}</p>
                              <p><strong className="text-slate-300">Time Logged:</strong> {selectedAlert.timestamp}</p>
                              <p><strong className="text-slate-300">Decisive Risk:</strong> {selectedAlert.score}/100</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Decision Trace Summary</span>
                            <div className="bg-[#090d16] border border-[#1f2937] rounded p-3 text-[10px] leading-relaxed text-slate-400 font-mono">
                              {selectedAlert.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#0f1524] border border-[#1f2937] rounded p-8 text-center text-xs text-slate-500 font-mono">
                      Select an incident to view details.
                    </div>
                  )}
                </div>
              </div>
            )}

            {investigationSubTab === "sessions" && (
              <DashboardCard title="Active Privileged Sessions" description="Real-time session connection viewer">
                <div className="overflow-x-auto border border-[#1f2937] rounded bg-[#0f1524]">
                  <table className="min-w-full text-left text-xs font-mono">
                    <thead className="bg-[#090d16] text-slate-500 border-b border-[#1f2937]">
                      <tr>
                        <th className="p-3">Session ID</th>
                        <th className="p-3">Operator</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Terminal Host</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Database Target</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#172033] text-slate-300">
                      {sessions.map((s) => (
                        <tr key={s.sessionId} className="hover:bg-[#172033]/40">
                          <td className="p-3 font-semibold text-slate-400">{s.sessionId}</td>
                          <td className="p-3 font-semibold text-slate-100">{s.username}</td>
                          <td className="p-3">{s.role}</td>
                          <td className="p-3">{s.device}</td>
                          <td className="p-3">{s.location}</td>
                          <td className="p-3 text-slate-500">{s.duration}</td>
                          <td className="p-3 text-sky-400">{s.database}</td>
                          <td className="p-3 text-right flex gap-1 justify-end">
                            <Button onClick={() => triggerMfaChallenge(s.sessionId)} className="h-6 text-[9px] bg-slate-800 text-slate-200 border border-[#1f2937]">
                              CHALLENGE MFA
                            </Button>
                            <Button onClick={() => terminateSession(s.sessionId)} className="h-6 text-[9px] bg-red-950/20 text-red-400 border border-red-900/40 hover:bg-red-900/30">
                              TERMINATE
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DashboardCard>
            )}

            {investigationSubTab === "approvals" && (
              <DashboardCard title="Approval Request Queue" description="Pending manager and SOC authorization requests">
                <div className="space-y-4">
                  {approvals.map((app) => (
                    <div key={app.id} className="bg-[#090d16] border border-[#1f2937] p-4 rounded space-y-4">
                      <div className="flex justify-between items-start border-b border-[#1f2937]/50 pb-2">
                        <div>
                          <span className="text-[9px] font-mono text-slate-500 bg-[#07090f] border border-[#1f2937] px-1.5 py-0.5 rounded">
                            {app.id}
                          </span>
                          <h4 className="text-xs font-bold text-slate-200 mt-1">{app.action}</h4>
                        </div>
                        <span className={cn(
                          "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border",
                          app.status === "Pending"
                            ? "bg-yellow-950/20 text-yellow-500 border-yellow-900/30"
                            : app.status === "Approved"
                            ? "bg-emerald-950/20 text-emerald-500 border-emerald-900/30"
                            : "bg-red-950/20 text-red-500 border-red-900/30"
                        )}>
                          {app.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono text-slate-400">
                        <p><strong className="text-slate-300">Requester:</strong> {app.user}</p>
                        <p><strong className="text-slate-300">Session ID:</strong> {app.sessionId}</p>
                        <p><strong className="text-slate-300">Reviewer Role:</strong> {app.reviewer}</p>
                        <p><strong className="text-slate-300">Reason:</strong> {app.reason}</p>
                      </div>

                      {app.status === "Pending" && (
                        <div className="space-y-3">
                          <Input
                            placeholder="Provide approval/rejection rationale comments..."
                            value={approvalComment}
                            onChange={(e) => setApprovalComment(e.target.value)}
                            className="bg-[#07090f] border-[#1f2937] text-xs h-9 text-slate-200 placeholder-slate-600 focus-visible:ring-slate-700"
                          />
                          <div className="flex gap-2">
                            <Button onClick={() => handleApprove(app.id)} className="h-8 text-xs bg-emerald-700 hover:bg-emerald-600 text-slate-100 font-semibold">
                              APPROVE TRANSACTION
                            </Button>
                            <Button onClick={() => handleReject(app.id)} className="h-8 text-xs bg-red-700 hover:bg-red-600 text-slate-100 font-semibold">
                              REJECT
                            </Button>
                          </div>
                        </div>
                      )}

                      {app.comment && (
                        <p className="text-[10px] font-mono text-slate-500 leading-relaxed italic bg-[#07090f] p-2 rounded border border-[#1f2937]/50">
                          Comment: {app.comment}
                        </p>
                      )}
                    </div>
                  ))}
                  {approvals.length === 0 && (
                    <div className="text-center p-6 text-slate-500 font-mono text-xs">
                      No pending requests in the authorization queue.
                    </div>
                  )}
                </div>
              </DashboardCard>
            )}

            {investigationSubTab === "trace" && (
              <DashboardCard title="Decision Explanations Trace" description="Pydantic models and policy rationale output logs">
                <div className="space-y-3 font-mono text-xs">
                  {auditLogs.slice(-3).reverse().map((log, idx) => (
                    <div key={idx} className="bg-[#090d16] border border-[#1f2937] p-4 rounded space-y-3">
                      <div className="flex justify-between items-center border-b border-[#1f2937]/50 pb-2">
                        <span className="font-bold text-red-400">DECISION TRACE RECORD // {log.session_id}</span>
                        <span className="text-slate-500">Event Index: {log.index}</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        <strong>Decision Explanation:</strong> {log.evidence ? JSON.parse(JSON.stringify(log.evidence)).join(", ") : "Standard Access Approved"}
                      </p>
                      <div className="border-t border-[#1f2937]/50 pt-2 space-y-1 text-slate-500 text-[10px]">
                        <p><strong>Decisive Risk Score:</strong> {log.risk_score}/100</p>
                        <p><strong>Dynamic Trust standing:</strong> {log.trust_score}/100</p>
                        <p><strong>Assigned Action:</strong> {log.decision}</p>
                      </div>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <div className="text-center p-6 text-slate-500 font-mono text-xs">
                      No trace blocks logged in database history.
                    </div>
                  )}
                </div>
              </DashboardCard>
            )}
          </div>
        );

      case "policies":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "Normal Banking Operations", desc: "Standard banking operation limits.", risk: "Max risk allowed: 75%", trust: "Min trust: 30%", dec: "Allow / Require MFA / Require Approval" },
              { name: "Emergency Operations", desc: "Strict posture active during live cybersecurity incidents.", risk: "Max risk allowed: 45%", trust: "Min trust: 65%", dec: "Reject / Require Manager Approval / Require MFA" }
            ].map((p) => (
              <div key={p.name} className="bg-[#0f1524] border border-[#1f2937] p-4 rounded space-y-3">
                <h3 className="text-xs font-bold text-sky-400">{p.name}</h3>
                <p className="text-[10px] text-slate-400">{p.desc}</p>
                <div className="border-t border-[#1f2937] pt-2 text-[10px] font-mono text-slate-500 space-y-1">
                  <p>• {p.risk}</p>
                  <p>• {p.trust}</p>
                  <p>• Action: {p.dec}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <TrustHistoryChart data={MOCK_TELEMETRY_HISTORY} className="lg:col-span-2" />
              <RiskBreakdownCard factors={MOCK_RISK_FACTORS} />
            </div>

            <DashboardCard title="Threat Analytics Metrics" description="Distribution of severities and anomalies alerts">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-2">
                <div className="bg-[#090d16] border border-[#1f2937] p-4 rounded">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Anomalous Actions</span>
                  <span className="text-2xl font-bold text-red-400 mt-2 block">12</span>
                  <span className="text-[9px] font-mono text-slate-500">in last 24h</span>
                </div>
                <div className="bg-[#090d16] border border-[#1f2937] p-4 rounded">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Average Session Risk</span>
                  <span className="text-2xl font-bold text-yellow-400 mt-2 block">54.04/100</span>
                  <span className="text-[9px] font-mono text-slate-500">Medium severity index</span>
                </div>
                <div className="bg-[#090d16] border border-[#1f2937] p-4 rounded">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Signatures Verified</span>
                  <span className="text-2xl font-bold text-emerald-400 mt-2 block">100%</span>
                  <span className="text-[9px] font-mono text-slate-500">No unsigned ledgers found</span>
                </div>
              </div>
            </DashboardCard>
          </div>
        );

      case "administration":
        return (
          <div className="space-y-4">
            {/* Segment Administration Menu */}
            <div className="flex flex-wrap gap-2 border-b border-[#1f2937]/60 pb-3">
              {[
                { id: "audit", label: "Quantum Verifier" },
                { id: "reports", label: "Evidence Exporter" },
                { id: "simulation", label: "Simulator Config" },
                { id: "settings", label: "Platform Thresholds" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setAdminSubTab(t.id)}
                  className={cn(
                    "px-3 py-1.5 rounded text-xs font-mono font-medium transition-all",
                    adminSubTab === t.id
                      ? "bg-[#172033] text-slate-100 border border-slate-500/50"
                      : "bg-[#090d16]/40 text-slate-400 hover:text-slate-200 border border-transparent"
                  )}
                >
                  {t.label.toUpperCase()}
                </button>
              ))}
            </div>

            {adminSubTab === "audit" && (
              <DashboardCard title="Immutable Audit Chain Ledger" description="Signed transaction verification record">
                <div className="overflow-x-auto border border-[#1f2937] rounded bg-[#0f1524]">
                  <table className="min-w-full text-left text-xs font-mono">
                    <thead className="bg-[#090d16] text-slate-500 border-b border-[#1f2937]">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Event ID</th>
                        <th className="p-3">Ledger Signature</th>
                        <th className="p-3">Cryptographic Hash</th>
                        <th className="p-3 text-right">Integrity Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#172033] text-slate-300">
                      {auditLogs.map((aud, idx) => (
                        <tr key={idx} className="hover:bg-[#172033]/40">
                          <td className="p-3 text-slate-500">{aud.timestamp}</td>
                          <td className="p-3 font-semibold text-slate-400">{aud.event_id}</td>
                          <td className="p-3 text-slate-300">{aud.quantum_signature}</td>
                          <td className="p-3 text-slate-400">{aud.current_hash}</td>
                          <td className="p-3 text-right text-emerald-400 font-bold">✓ VERIFIED</td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center p-6 text-slate-500">
                            No ledger blocks signed.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </DashboardCard>
            )}

            {adminSubTab === "reports" && (
              <DashboardCard title="SOC Security Report Exporter" description="Export and compile audit logs reports in markdown formats">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["Incident Summary", "Decision Report", "SOC Investigation Report", "Audit Summary"].map((report) => (
                    <div key={report} className="bg-[#090d16] border border-[#1f2937] p-4 rounded flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{report}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">Includes timeline, risk breakdowns, and signatures.</p>
                      </div>
                      <Button onClick={async () => {
                        // Generate dynamic exporter download trigger
                        const content = `# SENTINELX SECURITY REPORT - ${report.toUpperCase()}\nGenerated: ${new Date().toISOString()}\nLogs verified.`;
                        const element = document.createElement("a");
                        const file = new Blob([content], { type: 'text/markdown;charset=utf-8' });
                        element.href = URL.createObjectURL(file);
                        element.download = `${report.toLowerCase().replace(/ /g, "_")}.md`;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                        toast({ title: "Report Generated", description: `${report} downloaded successfully.` });
                      }} className="h-8 text-xs bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold">
                        COMPILE & EXPORT
                      </Button>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            )}

            {adminSubTab === "simulation" && (
              <DashboardCard title="Playback Simulation Desk" description="Adjust speeds and run scenario timelines">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <ScenarioSelector />
                    <PlaybackControls />
                  </div>
                  <div className="space-y-4">
                    <SimulationProgress />
                  </div>
                </div>
              </DashboardCard>
            )}

            {adminSubTab === "settings" && (
              <DashboardCard title="SOC Policy Workspace Configuration" description="Adjust scoring triggers and alarm levels">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#090d16] border border-[#1f2937] p-4 rounded space-y-4">
                    <h4 className="text-xs font-bold text-slate-200 border-b border-[#1f2937]/50 pb-2">Policy Limits Adjuster</h4>
                    <div className="space-y-3 text-[10px] font-mono">
                      <div className="flex justify-between items-center">
                        <span>Requires MFA Challenge threshold:</span>
                        <Input type="number" defaultValue="35" className="w-16 h-7 text-xs bg-[#07090f] border-[#1f2937] text-slate-200 text-center" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Requires Manager Sign threshold:</span>
                        <Input type="number" defaultValue="55" className="w-16 h-7 text-xs bg-[#07090f] border-[#1f2937] text-slate-200 text-center" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Requires Block Reject threshold:</span>
                        <Input type="number" defaultValue="75" className="w-16 h-7 text-xs bg-[#07090f] border-[#1f2937] text-slate-200 text-center" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#090d16] border border-[#1f2937] p-4 rounded space-y-4">
                    <h4 className="text-xs font-bold text-slate-200 border-b border-[#1f2937]/50 pb-2">Platform Notifications</h4>
                    <div className="space-y-3 text-[10px] font-mono">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded border-[#1f2937] bg-[#07090f]" />
                        <span>Send critical emails warnings directly to managers.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded border-[#1f2937] bg-[#07090f]" />
                        <span>Push alerts directly to notification center.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DashboardCard>
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 bg-[#0f1524] border border-[#1f2937] rounded text-center text-xs text-slate-500 font-mono">
            Tab view not found.
          </div>
        );
    }
  };

  return (
    <SocLayout>
      <WorkspaceHeader
        title={`SOC Security Intelligence Workspace: ${activeTab.toUpperCase()}`}
        breadcrumbs={["Portal", "SOC Analyst", activeTab]}
        status="MONITORING"
        riskSummary={`${criticalAlertsCount} Critical Alerts Ingested`}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {/* Metric Card Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Ingested Alert Feeds"
            value={alerts.length}
            subValue="active alerts"
            trend={{ direction: "up", label: "+3 in last 10m" }}
            icon={ShieldAlert}
          />
          <MetricCard
            title="Critical Threats"
            value={criticalAlertsCount}
            subValue="lockdowns triggered"
            trend={{ direction: "neutral", label: "Active playbook block" }}
            icon={Layers}
          />
          <MetricCard
            title="Simulated Attacks"
            value={isRunning ? "RUNNING" : "STANDBY"}
            subValue={`speed: ${speed}x`}
            trend={{ direction: "down", label: "0 compromised ledgers" }}
            icon={Users}
          />
          <MetricCard
            title="Audit Chain Health"
            value="100%"
            subValue="ledgers signed"
            trend={{ direction: "down", label: "Continuous signing active" }}
            icon={ShieldCheck}
          />
        </div>

        {/* Tab View Contents */}
        {renderTabContent()}
      </div>
    </SocLayout>
  );
}
