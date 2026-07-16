from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class SecurityEvent(BaseModel):
    event_id: str = Field(..., description="Unique event identifier (e.g. EVT-XXXXXX)")
    timestamp: str = Field(..., description="ISO 8601 timestamp format")
    session_id: str = Field(..., description="Active session ID token")
    user_id: str = Field(..., description="Unique identifier for employee")
    username: str = Field(..., description="Full user login identifier")
    role: str = Field(..., description="Predefined role descriptor")
    department: str = Field(..., description="Department grouping")
    action: str = Field(..., description="Simulated operation performed")
    resource: str = Field(..., description="Target asset path")
    resource_type: str = Field(..., description="Asset type metadata")
    severity: str = Field(..., description="Operational severity: low, medium, high, critical")
    source: str = Field(..., description="Source daemon system")
    device: str = Field(..., description="Workstation terminal label")
    location: str = Field(..., description="Office geo location")
    ip_address: str = Field(..., description="Ingress host IP address")
    status: str = Field(..., description="Command outcome status")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional custom dictionary parameters")
