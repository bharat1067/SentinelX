from typing import List, Dict, Any

NORMAL_DB_HEALTH_CHECK: List[Dict[str, Any]] = [
    {
        "timestamp": "2026-07-15T09:05:00Z",
        "event_id": "EVT-901001",
        "session_id": "SES-90812",
        "user": "Amit Verma",
        "role": "Employee",
        "source": "CyberArk_Vault_Gate",
        "event_type": "SESSION_INITIALIZE",
        "resource": "bom_ledger.customer_accounts",
        "severity": "low",
        "payload": {
            "ip_address": "10.15.2.14",
            "terminal_id": "BOM-DBA-087",
            "vault_session_id": "CYB-90812"
        }
    },
    {
        "timestamp": "2026-07-15T09:08:12Z",
        "event_id": "EVT-901002",
        "session_id": "SES-90812",
        "user": "Amit Verma",
        "role": "Employee",
        "source": "PostgreSQL_Database_Engine",
        "event_type": "DB_QUERY_SELECT",
        "resource": "bom_ledger.system_metrics",
        "severity": "low",
        "payload": {
            "sql_statement": "SELECT cpu_utilization, active_connections FROM server_health WHERE node='Core_Ledger_Replica'",
            "affected_rows": 1,
            "ip_address": "10.15.2.14",
            "terminal_id": "BOM-DBA-087"
        }
    },
    {
        "timestamp": "2026-07-15T09:15:30Z",
        "event_id": "EVT-901003",
        "session_id": "SES-90812",
        "user": "Amit Verma",
        "role": "Employee",
        "source": "PostgreSQL_Database_Engine",
        "event_type": "DB_MAINTENANCE_COMMAND",
        "resource": "bom_ledger.customer_accounts",
        "severity": "low",
        "payload": {
            "sql_statement": "VACUUM ANALYZE customer_accounts",
            "affected_rows": 0,
            "ip_address": "10.15.2.14",
            "terminal_id": "BOM-DBA-087"
        }
    },
    {
        "timestamp": "2026-07-15T09:22:45Z",
        "event_id": "EVT-901004",
        "session_id": "SES-90812",
        "user": "Amit Verma",
        "role": "Employee",
        "source": "CyberArk_Vault_Gate",
        "event_type": "SESSION_TERMINATE",
        "resource": "bom_ledger.customer_accounts",
        "severity": "low",
        "payload": {
            "ip_address": "10.15.2.14",
            "terminal_id": "BOM-DBA-087"
        }
    }
]

NORMAL_BACKUP_REPORT: List[Dict[str, Any]] = [
    {
        "timestamp": "2026-07-15T11:15:00Z",
        "event_id": "EVT-902001",
        "session_id": "SES-90855",
        "user": "Amit Verma",
        "role": "Employee",
        "source": "Backup_Center_Daemon",
        "event_type": "SYSTEM_SERVICE_CONNECT",
        "resource": "bom_backup.postgres_ledgers",
        "severity": "low",
        "payload": {
            "ip_address": "10.15.2.14",
            "terminal_id": "BOM-DBA-087"
        }
    },
    {
        "timestamp": "2026-07-15T11:18:22Z",
        "event_id": "EVT-902002",
        "session_id": "SES-90855",
        "user": "Amit Verma",
        "role": "Employee",
        "source": "Backup_Center_Daemon",
        "event_type": "INTEGRITY_CHECK_RUN",
        "resource": "bom_backup.postgres_ledgers",
        "severity": "low",
        "payload": {
            "node_ip": "10.15.4.15",
            "signature_status": "VALID",
            "ip_address": "10.15.2.14"
        }
    },
    {
        "timestamp": "2026-07-15T11:30:10Z",
        "event_id": "EVT-902003",
        "session_id": "SES-90855",
        "user": "Amit Verma",
        "role": "Employee",
        "source": "Backup_Center_Daemon",
        "event_type": "REPORT_EXPORT_PDF",
        "resource": "bom_reports.weekly_backup_integrity",
        "severity": "low",
        "payload": {
            "destination_path": "/shared/it_risk_reports/weekly_backup_integrity.pdf",
            "ip_address": "10.15.2.14"
        }
    }
]

ROGUE_DBA_EXFILTRATION: List[Dict[str, Any]] = [
    {
        "timestamp": "2026-07-15T02:15:00Z",
        "event_id": "EVT-999001",
        "session_id": "SES-99912",
        "user": "Amit Verma",
        "role": "Employee",
        "source": "OpenVPN_External_Gateway",
        "event_type": "SESSION_INITIALIZE",
        "resource": "bom_ledger.customer_accounts",
        "severity": "medium",
        "payload": {
            "ip_address": "198.51.100.42", # Foreign/External IP
            "terminal_id": "BOM-DBA-UNKNOWN",
            "warning": "Login outside normal profile operational hours"
        }
    },
    {
        "timestamp": "2026-07-15T02:16:12Z",
        "event_id": "EVT-999002",
        "session_id": "SES-99912",
        "user": "Amit Verma",
        "role": "Employee",
        "source": "PostgreSQL_Database_Engine",
        "event_type": "DB_PRIVILEGE_BYPASS",
        "resource": "bom_ledger.core_bypass_credentials",
        "severity": "high",
        "payload": {
            "vault_bypass_detected": True,
            "ip_address": "198.51.100.42"
        }
    },
    {
        "timestamp": "2026-07-15T02:17:45Z",
        "event_id": "EVT-999003",
        "session_id": "SES-99912",
        "user": "Amit Verma",
        "role": "Employee",
        "source": "PostgreSQL_Database_Engine",
        "event_type": "DB_QUERY_MASS_SELECT",
        "resource": "bom_ledger.customer_accounts",
        "severity": "critical",
        "payload": {
            "sql_statement": "SELECT * FROM customer_accounts WHERE balance > 1000000",
            "affected_rows": 50000,
            "ip_address": "198.51.100.42"
        }
    },
    {
        "timestamp": "2026-07-15T02:18:20Z",
        "event_id": "EVT-999004",
        "session_id": "SES-99912",
        "user": "Amit Verma",
        "role": "Employee",
        "source": "BOM_Workstation_Daemon",
        "event_type": "USB_HARDWARE_MOUNT",
        "resource": "system_hardware.usb_drive",
        "severity": "critical",
        "payload": {
            "device_model": "SanDisk Extreme Pro USB",
            "mount_point": "E:/",
            "ip_address": "198.51.100.42"
        }
    },
    {
        "timestamp": "2026-07-15T02:19:10Z",
        "event_id": "EVT-999005",
        "session_id": "SES-99912",
        "user": "Amit Verma",
        "role": "Employee",
        "source": "Linux_Operating_System",
        "event_type": "AUDIT_DEACTIVATE_ATTEMPT",
        "resource": "system_services.auditd",
        "severity": "critical",
        "payload": {
            "command": "systemctl stop auditd",
            "ip_address": "198.51.100.42"
        }
    },
    {
        "timestamp": "2026-07-15T02:20:05Z",
        "event_id": "EVT-999006",
        "session_id": "SES-99912",
        "user": "Amit Verma",
        "role": "Employee",
        "source": "PostgreSQL_Database_Engine",
        "event_type": "BACKDOOR_ADMIN_DEPLOY",
        "resource": "bom_ledger.role_management",
        "severity": "critical",
        "payload": {
            "sql_statement": "INSERT INTO user_roles (user_id, role_id) VALUES ('temp_bom_admin', 'SUPER_ADMIN')",
            "affected_rows": 1,
            "ip_address": "198.51.100.42"
        }
    },
    {
        "timestamp": "2026-07-15T02:21:00Z",
        "event_id": "EVT-999007",
        "session_id": "SES-99912",
        "user": "Amit Verma",
        "role": "Employee",
        "source": "Security_Orchestration_Engine",
        "event_type": "SESSION_KILL_ACTION",
        "resource": "bom_ledger.customer_accounts",
        "severity": "critical",
        "payload": {
            "action_triggered": "TERM_SESSION_AND_FREEZE_USER",
            "reason": "SentinelX PDP elevation risk limit exceeded"
        }
    }
]

SCENARIOS_REGISTRY = {
    "SCN-001": NORMAL_DB_HEALTH_CHECK,
    "SCN-002": ROGUE_DBA_EXFILTRATION,
    "SCN-003": NORMAL_BACKUP_REPORT
}
