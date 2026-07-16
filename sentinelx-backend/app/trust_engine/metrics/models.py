from pydantic import BaseModel, Field
from typing import List, Dict, Any

class TrustState(BaseModel):
    username: str = Field(..., description="Unique operator login username")
    current_trust: float = Field(90.0, description="Active trust score from 0.0 to 100.0")
    previous_trust: float = Field(90.0, description="Previous tick trust score")
    trust_level: str = Field("High", description="Discrete trust level: Very High, High, Medium, Low, Critical")
    reasons_history: List[Dict[str, Any]] = Field(default_factory=list, description="Audit log of delta updates: {'delta': float, 'reason': str}")
    timeline_history: List[Dict[str, Any]] = Field(default_factory=list, description="Timeline snapshot logs tracking score trends")
    is_frozen: bool = Field(False, description="Toggles calculations adjustments")
