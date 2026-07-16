from pydantic import BaseModel, Field
from typing import List, Dict, Any

class RiskSubScores(BaseModel):
    behaviour_risk: float = Field(0.0, description="Risk sub-score derived from behavior deviations (0-100)")
    trust_risk: float = Field(0.0, description="Risk sub-score derived from trust state degradation (0-100)")
    device_risk: float = Field(0.0, description="Risk sub-score derived from endpoint anomalies (0-100)")
    location_risk: float = Field(0.0, description="Risk sub-score derived from geographical shifts (0-100)")
    time_risk: float = Field(0.0, description="Risk sub-score derived from off-hours access (0-100)")
    action_risk: float = Field(0.0, description="Risk sub-score derived from operation severity/complexity (0-100)")
    resource_risk: float = Field(0.0, description="Risk sub-score derived from asset criticality (0-100)")

class RiskBreakdown(BaseModel):
    behaviour_contribution: float = Field(0.0, description="Percentage/ratio contribution of behavior risk factor")
    trust_contribution: float = Field(0.0, description="Percentage/ratio contribution of trust risk factor")
    device_contribution: float = Field(0.0, description="Percentage/ratio contribution of device anomalies")
    location_contribution: float = Field(0.0, description="Percentage/ratio contribution of location anomalies")
    action_contribution: float = Field(0.0, description="Percentage/ratio contribution of action severity")
    asset_contribution: float = Field(0.0, description="Percentage/ratio contribution of resource criticality")
    historical_contribution: float = Field(0.0, description="Percentage/ratio contribution of historical context")

class RiskRecommendation(BaseModel):
    recommended_action: str = Field(..., description="Human-readable response action recommendation")
    reason: str = Field(..., description="Explainable justification context for the recommended action")

class RiskState(BaseModel):
    session_id: str = Field(..., description="Active session ID token")
    username: str = Field(..., description="Unique operator login username")
    current_risk_score: float = Field(10.0, description="Aggregated risk score index from 0.0 to 100.0")
    previous_risk_score: float = Field(10.0, description="Previous session risk score index")
    risk_level: str = Field("Very Low", description="Discrete risk level classification: Very Low, Low, Medium, High, Critical")
    sub_scores: RiskSubScores = Field(default_factory=RiskSubScores)
    breakdown: RiskBreakdown = Field(default_factory=RiskBreakdown)
    reasons_history: List[Dict[str, Any]] = Field(default_factory=list, description="Audit trail of delta increases: {'delta': float, 'reason': str}")
    timeline_history: List[Dict[str, Any]] = Field(default_factory=list, description="Timeline snapshot logs tracking risk score trends")
    is_frozen: bool = Field(False, description="Toggles update operations on risk states")
    policy_name: str = Field("Normal Banking", description="Name of the active risk policy profile")

class RiskEvaluationResult(BaseModel):
    session_id: str = Field(..., description="Associated session ID")
    username: str = Field(..., description="Associated username")
    current_risk_score: float = Field(..., description="Overall risk score")
    risk_level: str = Field(..., description="Calculated discrete risk level")
    risk_trend: str = Field(..., description="Risk trend trajectory: UPWARD, DOWNWARD, NEUTRAL")
    sub_scores: Dict[str, float] = Field(..., description="Dictionary representation of sub-scores")
    breakdown: Dict[str, float] = Field(..., description="Dictionary representation of risk breakdown factors")
    reasons: List[Dict[str, Any]] = Field(..., description="List of reasons and deltas active on this step")
    timeline: List[Dict[str, Any]] = Field(..., description="Timeline snapshot tracking history")
    recommendation: RiskRecommendation = Field(..., description="Recommended action summary")
