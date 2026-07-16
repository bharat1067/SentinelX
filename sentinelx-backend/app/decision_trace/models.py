from pydantic import BaseModel, Field
from typing import List, Dict, Any

class DecisionTimelineEvent(BaseModel):
    timestamp: str = Field(..., description="ISO 8601 timestamp of the step")
    event_id: str = Field(..., description="Unique event identifier")
    action: str = Field(..., description="Simulated action executed")
    description: str = Field(..., description="Human-readable description of the step")
    trust_change: float = Field(0.0, description="Applied change to trust score")
    risk_change: float = Field(0.0, description="Applied change to risk score")

class DecisionTrace(BaseModel):
    session_id: str = Field(..., description="Active session ID token")
    username: str = Field(..., description="Associated operator username")
    decision_summary: str = Field(..., description="High-level human-readable decision summary")
    timeline: List[DecisionTimelineEvent] = Field(default_factory=list, description="Chronological trace timeline list")
    reasons: List[str] = Field(default_factory=list, description="List of active decision trigger reasons")
    risk_contribution: Dict[str, float] = Field(default_factory=dict, description="Risk factor contribution percentages")
    trust_contribution: Dict[str, float] = Field(default_factory=dict, description="Trust factor contribution breakdown (e.g. baseline, anomaly, bypass)")
    behaviour_contribution: Dict[str, float] = Field(default_factory=dict, description="Behavior factor contribution breakdown (e.g. timing, command, host)")
    recommended_action: str = Field(..., description="Recommended response action")
    confidence: float = Field(..., description="Mathematical confidence score (0-100) supporting explanations")

class ExportedReport(BaseModel):
    report_type: str = Field(..., description="Type of the report: Incident Summary, Decision Report, SOC Investigation Report, Audit Evidence Summary")
    session_id: str = Field(..., description="Associated session ID")
    generated_at: str = Field(..., description="ISO 8601 generation timestamp")
    content: str = Field(..., description="Markdown or text content of the report")
