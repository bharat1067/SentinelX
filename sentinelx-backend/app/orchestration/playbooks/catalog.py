from typing import List, Dict, Any
from app.orchestration.models import OrchestrationWorkflow

# Playbook definitions mapped by trigger names
PLAYBOOKS_REGISTRY = {
    "Database Export Abuse": OrchestrationWorkflow(
        id="PLAY-DB-EXPORT-ABUSE",
        name="Database Export Abuse",
        trigger="db-query-mass-select",
        actions=[
            "Pause Sensitive Operation",
            "Notify SOC",
            "Require Manager Approval",
            "Generate Investigation Package",
            "Terminate Current Session"
        ]
    ),
    "Unknown Device": OrchestrationWorkflow(
        id="PLAY-UNKNOWN-DEVICE",
        name="Unknown Device",
        trigger="unknown-device-login",
        actions=[
            "Continue Monitoring",
            "Request MFA",
            "Create Incident Ticket"
        ]
    ),
    "Credential Abuse": OrchestrationWorkflow(
        id="PLAY-CRED-ABUSE",
        name="Credential Abuse",
        trigger="credential-abuse",
        actions=[
            "Pause Sensitive Operation",
            "Notify SOC",
            "Request MFA",
            "Revoke Temporary Privileges",
            "Rotate Credentials"
        ]
    ),
    "Privilege Escalation": OrchestrationWorkflow(
        id="PLAY-PRIV-ESCALATION",
        name="Privilege Escalation",
        trigger="db-privilege-bypass",
        actions=[
            "Pause Sensitive Operation",
            "Notify SOC",
            "Require Manager Approval",
            "Generate Investigation Package",
            "Terminate Current Session"
        ]
    ),
    "Late Night Activity": OrchestrationWorkflow(
        id="PLAY-LATE-NIGHT",
        name="Late Night Activity",
        trigger="late-login",
        actions=[
            "Continue Monitoring",
            "Request MFA",
            "Notify Manager"
        ]
    ),
    "Sensitive SQL Execution": OrchestrationWorkflow(
        id="PLAY-SENSITIVE-SQL",
        name="Sensitive SQL Execution",
        trigger="db-query-select",
        actions=[
            "Pause Sensitive Operation",
            "Request MFA",
            "Create Incident Ticket"
        ]
    ),
    "Audit Log Tampering": OrchestrationWorkflow(
        id="PLAY-AUDIT-TAMPER",
        name="Audit Log Tampering",
        trigger="audit-deactivate-attempt",
        actions=[
            "Pause Sensitive Operation",
            "Notify SOC",
            "Require Manager Approval",
            "Disable Active Session"
        ]
    ),
    "Backup Manipulation": OrchestrationWorkflow(
        id="PLAY-BACKUP-MANIPULATION",
        name="Backup Manipulation",
        trigger="backup-manipulation",
        actions=[
            "Pause Sensitive Operation",
            "Notify SOC",
            "Require Manager Approval",
            "Generate Investigation Package",
            "Disable Active Session"
        ]
    )
}

class PlaybookMatcher:
    @staticmethod
    def match_playbook(event: Dict[str, Any], risk_score: float) -> OrchestrationWorkflow:
        """
        Dynamically matches the best security playbook based on event details,
        anomalies, and risk scores.
        """
        action = event.get("action", "").lower().replace("_", "-")
        anomalies = event.get("anomalies", [])

        if action == "db-query-mass-select":
            return PLAYBOOKS_REGISTRY["Database Export Abuse"]
        elif action in ["db-privilege-bypass", "backdoor-admin-deploy", "create-admin-user", "rotate-keys"]:
            return PLAYBOOKS_REGISTRY["Privilege Escalation"]
        elif action == "audit-deactivate-attempt":
            return PLAYBOOKS_REGISTRY["Audit Log Tampering"]
        elif "Late Login" in anomalies:
            return PLAYBOOKS_REGISTRY["Late Night Activity"]
        elif action == "db-query-select":
            return PLAYBOOKS_REGISTRY["Sensitive SQL Execution"]
        elif risk_score >= 50.0:
            return PLAYBOOKS_REGISTRY["Credential Abuse"]
        else:
            return PLAYBOOKS_REGISTRY["Unknown Device"]
