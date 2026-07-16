from app.pdp.models import PDPPolicyProfile

NormalBankingOperationsPolicy = PDPPolicyProfile(
    id="POL-NORMAL-BANKING",
    name="Normal Banking Operations",
    description="Standard day-to-day banking operation limits.",
    max_risk_allowed=75.0,
    min_trust_required=30.0,
    allowed_roles=["Employee", "Manager", "SOC Analyst", "System"],
    requires_mfa_threshold=35.0,
    requires_approval_threshold=55.0,
    critical_actions=["rotate-keys", "backdoor-admin-deploy"]
)

MaintenanceWindowPolicy = PDPPolicyProfile(
    id="POL-MAINTENANCE",
    name="Maintenance Window",
    description="Active during off-hours scheduled database/system maintenance.",
    max_risk_allowed=65.0,
    min_trust_required=45.0,
    allowed_roles=["Manager", "SOC Analyst", "System"],
    requires_mfa_threshold=30.0,
    requires_approval_threshold=50.0,
    critical_actions=["disable-audit", "rotate-keys"]
)

EmergencyOperationsPolicy = PDPPolicyProfile(
    id="POL-EMERGENCY",
    name="Emergency Operations",
    description="Strict posture active during live cybersecurity incidents.",
    max_risk_allowed=45.0,
    min_trust_required=65.0,
    allowed_roles=["Manager", "SOC Analyst"],
    requires_mfa_threshold=1.0,  # Always require MFA
    requires_approval_threshold=20.0,
    critical_actions=["disable-audit", "create-admin-user", "rotate-keys", "db-query-mass-select", "usb-hardware-mount"]
)

ProductionDatabasePolicy = PDPPolicyProfile(
    id="POL-PRODUCTION-DB",
    name="Production Database",
    description="Enforces controls for direct production query consoles.",
    max_risk_allowed=60.0,
    min_trust_required=50.0,
    allowed_roles=["Employee", "Manager"],
    requires_mfa_threshold=25.0,
    requires_approval_threshold=45.0,
    critical_actions=["db-query-select", "db-query-mass-select", "db-privilege-bypass", "backdoor-admin-deploy"]
)

CustomerDataProtectionPolicy = PDPPolicyProfile(
    id="POL-CUSTOMER-DATA",
    name="Customer Data Protection",
    description="Restricts access to PII and banking client records.",
    max_risk_allowed=55.0,
    min_trust_required=55.0,
    allowed_roles=["Employee", "Manager", "SOC Analyst"],
    requires_mfa_threshold=30.0,
    requires_approval_threshold=45.0,
    critical_actions=["db-query-mass-select", "report-export-pdf"]
)

PrivilegedAdministrationPolicy = PDPPolicyProfile(
    id="POL-PRIVILEGED-ADMIN",
    name="Privileged Administration",
    description="Governs configuration changes and system overrides.",
    max_risk_allowed=50.0,
    min_trust_required=60.0,
    allowed_roles=["Manager", "SOC Analyst"],
    requires_mfa_threshold=20.0,
    requires_approval_threshold=40.0,
    critical_actions=["create-admin-user", "audit-deactivate-attempt", "rotate-keys", "backdoor-admin-deploy"]
)

POL_PROFILES_REGISTRY = {
    "Normal Banking Operations": NormalBankingOperationsPolicy,
    "Maintenance Window": MaintenanceWindowPolicy,
    "Emergency Operations": EmergencyOperationsPolicy,
    "Production Database": ProductionDatabasePolicy,
    "Customer Data Protection": CustomerDataProtectionPolicy,
    "Privileged Administration": PrivilegedAdministrationPolicy
}
