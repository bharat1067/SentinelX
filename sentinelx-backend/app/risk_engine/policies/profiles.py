from typing import Dict, Any
from app.risk_engine.weights.config import DEFAULT_WEIGHTS

class RiskPolicy:
    def __init__(
        self,
        name: str,
        weights: Dict[str, float],
        role_multipliers: Dict[str, float] | None = None,
        resource_multipliers: Dict[str, float] | None = None,
        base_offset: float = 0.0,
        description: str = ""
    ):
        self.name = name
        self.weights = weights
        self.role_multipliers = role_multipliers or {}
        self.resource_multipliers = resource_multipliers or {}
        self.base_offset = base_offset
        self.description = description

    def get_weight(self, factor: str) -> float:
        return self.weights.get(factor, DEFAULT_WEIGHTS.get(factor, 0.0))

    def get_role_multiplier(self, role: str) -> float:
        return self.role_multipliers.get(role, 1.0)

    def get_resource_multiplier(self, resource: str) -> float:
        return self.resource_multipliers.get(resource, 1.0)


# 1. Normal Banking Policy (Standard baseline operations)
NormalBankingPolicy = RiskPolicy(
    name="Normal Banking Policy",
    weights={
        "behaviour": 0.20,
        "trust": 0.25,
        "device": 0.15,
        "location": 0.15,
        "time": 0.05,
        "action": 0.10,
        "resource": 0.10
    },
    base_offset=0.0,
    description="Standard day-to-day banking operation configurations."
)

# 2. High Security Policy (Sensitive data access controls, heavy emphasis on anomalies and trust)
HighSecurityPolicy = RiskPolicy(
    name="High Security Policy",
    weights={
        "behaviour": 0.25,  # higher weight on behaviour deviations
        "trust": 0.35,      # severe penalty for trust loss
        "device": 0.10,
        "location": 0.10,
        "time": 0.05,
        "action": 0.08,
        "resource": 0.07
    },
    role_multipliers={
        "Employee": 1.2,
        "SOC Analyst": 1.4,
        "Manager": 1.6
    },
    resource_multipliers={
        "bom_ledger.customer_accounts": 1.3,
        "bom_ledger.core_bypass_credentials": 1.5
    },
    base_offset=10.0,  # general risk level is higher
    description="Tightened security control weights, heavily penalizing trust score drops."
)

# 3. Maintenance Window Policy (Authorized system configurations, allows some behaviors but watches assets closely)
MaintenanceWindowPolicy = RiskPolicy(
    name="Maintenance Window Policy",
    weights={
        "behaviour": 0.15,
        "trust": 0.20,
        "device": 0.20,      # strict validation of the device used
        "location": 0.20,    # strict validation of the location
        "time": 0.05,
        "action": 0.10,
        "resource": 0.10
    },
    base_offset=5.0,
    description="Active during off-hours scheduled database/system maintenance."
)

# 4. Emergency Operations Policy (Suspicious/compromised activity alert levels)
EmergencyOperationsPolicy = RiskPolicy(
    name="Emergency Operations Policy",
    weights={
        "behaviour": 0.30,
        "trust": 0.40,      # extreme weight on trust standing
        "device": 0.08,
        "location": 0.08,
        "time": 0.04,
        "action": 0.05,
        "resource": 0.05
    },
    role_multipliers={
        "Employee": 1.5,
        "SOC Analyst": 1.6,
        "Manager": 1.8
    },
    base_offset=25.0,  # massive flat penalty
    description="Triggered during active infrastructure compromise incidents."
)

POLICIES_REGISTRY = {
    "Normal Banking Policy": NormalBankingPolicy,
    "High Security Policy": HighSecurityPolicy,
    "Maintenance Window Policy": MaintenanceWindowPolicy,
    "Emergency Operations Policy": EmergencyOperationsPolicy
}
