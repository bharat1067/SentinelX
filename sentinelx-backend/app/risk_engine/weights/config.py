from typing import Dict

# Default risk factor weights (Must sum to 1.0)
DEFAULT_WEIGHTS: Dict[str, float] = {
    "behaviour": 0.20,
    "trust": 0.25,
    "device": 0.15,
    "location": 0.15,
    "time": 0.05,
    "action": 0.10,
    "resource": 0.10
}

# Role sensitivity multipliers (amplifies the impact of risk score calculations)
ROLE_SENSITIVITY: Dict[str, float] = {
    "Employee": 1.0,
    "SOC Analyst": 1.3,
    "Manager": 1.5,
    "System": 1.0
}

# Asset Criticality classification mapping
ASSET_CRITICALITY: Dict[str, str] = {
    "bom_ledger.core_bypass_credentials": "Critical",
    "bom_ledger.customer_accounts": "Critical",
    "bom_ledger.role_management": "Critical",
    "system_services.auditd": "Critical",
    "bom_backup.postgres_ledgers": "High",
    "system_hardware.usb_drive": "High",
    "bom_ledger.loans": "High",
    "bom_ledger.employee_accounts": "Medium",
    "bom_reports.weekly_backup_integrity": "Medium",
    "bom_ledger.system_metrics": "Low"
}

# Criticality multipliers
CRITICALITY_MULTIPLIERS: Dict[str, float] = {
    "Critical": 2.0,
    "High": 1.5,
    "Medium": 1.2,
    "Low": 0.8
}

RESOURCE_SENSITIVITY: Dict[str, float] = {
    res: CRITICALITY_MULTIPLIERS.get(crit, 1.0)
    for res, crit in ASSET_CRITICALITY.items()
}

# Action risk baseline values
ACTION_BASE_RISK: Dict[str, float] = {
    "session-initialize": 10.0,
    "session-terminate": 5.0,
    "db-query-select": 15.0,
    "db-maintenance-command": 20.0,
    "system-service-connect": 15.0,
    "integrity-check-run": 10.0,
    "report-export-pdf": 25.0,
    "db-privilege-bypass": 80.0,
    "db-query-mass-select": 90.0,
    "usb-hardware-mount": 85.0,
    "audit-deactivate-attempt": 95.0,
    "backdoor-admin-deploy": 100.0,
    "session-kill-action": 10.0
}
