from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class PolicyDecision(BaseModel):
    decision: str = Field(..., description="PDP policy outcome decision (Allow, Allow + Log, Require MFA, Require Manager Approval, Pause Sensitive Action, Escalate to SOC, Reject)")
    reason: str = Field(..., description="Human-readable decision explanation")
    triggered_policy: str = Field(..., description="Name of the triggered policy profile")
    approval_requirement: str = Field("None", description="Workflow approval type (None, Single Approval, Dual Approval, SOC Approval, Manager Approval, Emergency Override)")
    required_reviewer: str = Field("None", description="Required reviewer role (None, Manager, SOC Analyst, Dual Reviewer)")
    recommended_response: str = Field(..., description="Recommended response action playbook")
    supporting_evidence: List[str] = Field(default_factory=list, description="List of raw security evidence reasons")

class PDPPolicyProfile(BaseModel):
    id: str = Field(..., description="Unique policy profile ID")
    name: str = Field(..., description="Human-readable policy name")
    description: str = Field(..., description="Policy profile description details")
    max_risk_allowed: float = Field(70.0, description="Upper threshold risk index (0-100) before reject")
    min_trust_required: float = Field(40.0, description="Lower threshold trust index (0-100) before reject")
    allowed_roles: List[str] = Field(default_factory=list, description="Roles permitted under this policy")
    requires_mfa_threshold: float = Field(35.0, description="Risk threshold where MFA challenge is triggered")
    requires_approval_threshold: float = Field(55.0, description="Risk threshold where transaction approval workflow is triggered")
    critical_actions: List[str] = Field(default_factory=list, description="List of actions requiring elevated approvals")
