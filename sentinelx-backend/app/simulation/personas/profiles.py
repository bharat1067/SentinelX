from pydantic import BaseModel, Field
from typing import Dict, Any, List

class PersonaProfile(BaseModel):
    name: str
    role: str
    department: str
    normal_login_range: List[str] = Field(..., description="List of [start_hour, end_hour] formatted as HH:MM")
    normal_device: str
    office_location: str
    baseline_behaviors: Dict[str, Any] = Field(default_factory=dict, description="Predefined metrics outlining normal limits")

AMIT_VERMA_DBA = PersonaProfile(
    name="Amit Verma",
    role="Employee",
    department="Core Database Operations",
    normal_login_range=["09:00", "18:30"],
    normal_device="BOM-DBA-087",
    office_location="Pune HQ, 4th Floor",
    baseline_behaviors={
        "max_query_affected_rows": 50,
        "allowed_commands": ["SELECT", "EXPLAIN", "VACUUM", "ANALYZE"],
        "vault_bypass_allowed": False,
        "usb_mounting_allowed": False,
        "normal_ips": ["10.15.2.14"]
    }
)

NEHA_SINGH_SOC = PersonaProfile(
    name="Neha Singh",
    role="SOC Analyst",
    department="Security Operations Command",
    normal_login_range=["08:00", "23:59"], # shift-based, covers all hours
    normal_device="BOM-SOC-002",
    office_location="Mumbai Cyber Command Center",
    baseline_behaviors={
        "max_query_affected_rows": 200,
        "allowed_commands": ["SELECT", "UPDATE", "INSERT"], # alerts resolution inputs
        "vault_bypass_allowed": False,
        "usb_mounting_allowed": False,
        "normal_ips": ["10.20.4.50"]
    }
)

RAJESH_KUMAR_MGR = PersonaProfile(
    name="Rajesh Kumar",
    role="Manager",
    department="IT Governance & Risk Management",
    normal_login_range=["09:30", "18:30"],
    normal_device="BOM-MGR-001",
    office_location="Head Office, Mumbai",
    baseline_behaviors={
        "max_query_affected_rows": 10,
        "allowed_commands": ["SELECT", "UPDATE"],
        "vault_bypass_allowed": True, # supervisor bypass credentials
        "usb_mounting_allowed": False,
        "normal_ips": ["10.20.1.12"]
    }
)

PERSONAS_REGISTRY = {
    "Employee": AMIT_VERMA_DBA,
    "SOC Analyst": NEHA_SINGH_SOC,
    "Manager": RAJESH_KUMAR_MGR
}
