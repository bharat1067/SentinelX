from typing import Dict, Any, Tuple

class PDPApprovalWorkflow:
    @staticmethod
    def resolve_approval_workflow(
        decision: str,
        event: Dict[str, Any],
        policy_name: str
    ) -> Tuple[str, str, str]:
        """
        Determines the workflow approval type, reviewer role, and recommended playbook
        based on the PDP outcome decision and user context.
        Returns a tuple of (approval_requirement, required_reviewer, recommended_response).
        """
        role = event.get("role", "Employee")
        action = event.get("action", "").lower().replace("_", "-")

        if decision == "Reject":
            return "None", "None", "BLOCK_TRANSACTION_AND_FORCE_REAUTH"

        elif decision == "Require Manager Approval":
            # Determine dual vs manager based on role & policy
            if policy_name == "Emergency Operations":
                return "Emergency Override", "Dual Reviewer", "SUSPEND_ACTION_UNTIL_DUAL_OVERRIDE"
            elif role == "Employee" and action in ["db-query-mass-select", "usb-hardware-mount"]:
                return "Dual Approval", "Dual Reviewer", "SUSPEND_ACTION_UNTIL_DUAL_SIGNS"
            else:
                return "Manager Approval", "Manager", "SUSPEND_ACTION_UNTIL_MANAGER_SIGNS"

        elif decision == "Require MFA":
            return "Single Approval", "System", "PROMPT_USER_MFA_CHALLENGE"

        elif decision == "Pause Sensitive Action":
            return "SOC Approval", "SOC Analyst", "SUSPEND_ACTION_AND_HOLD"

        elif decision == "Escalate to SOC":
            return "SOC Approval", "SOC Analyst", "ALERT_SOC_AND_HOLD"

        # Allow / Allow + Log
        elif decision == "Allow + Log":
            return "None", "None", "ALLOW_AND_AUDIT"
        else:
            return "None", "None", "ALLOW_AND_CONTINUE"
