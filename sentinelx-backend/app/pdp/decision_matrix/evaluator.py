from typing import Tuple, List

class PDPDecisionMatrix:
    # Sensitivity mapping for actions
    ACTION_SENSITIVITY = {
        "view-dashboard": "Low",
        "view-customers": "Medium",
        "generate-report": "Medium",
        "report-export-pdf": "Medium",
        "db-query-select": "High",
        "db-query-mass-select": "Critical",
        "db-privilege-bypass": "Critical",
        "usb-hardware-mount": "Critical",
        "audit-deactivate-attempt": "Critical",
        "backdoor-admin-deploy": "Critical",
        "create-admin-user": "Critical",
        "rotate-keys": "Critical",
        "session-kill-action": "Low"
    }

    @staticmethod
    def get_action_sensitivity(action: str) -> str:
        return PDPDecisionMatrix.ACTION_SENSITIVITY.get(action.lower().replace("_", "-"), "Medium")

    @staticmethod
    def evaluate_matrix(
        risk_level: str,
        trust_level: str,
        action_sensitivity: str,
        role: str
    ) -> Tuple[str, str]:
        """
        Applies a multi-dimensional matrix cross-referencing risk level, trust standing,
        action sensitivity, and user roles to determine the policy outcome.
        Returns a tuple of (matrix_decision, explanation_reason).
        """
        # Normalization
        risk = risk_level.title()
        trust = trust_level.title()
        sensitivity = action_sensitivity.title()

        # Hard-block overrides
        if trust == "Critical" or risk == "Critical":
            return "Reject", "Hard block: Session risk profile indicates critical compromise or zero active trust."

        if sensitivity == "Critical":
            if risk == "High" or trust == "Low":
                return "Reject", "Critical operation blocked due to High Risk or Low Trust standing."
            if risk == "Medium" or trust == "Medium":
                return "Require Manager Approval", "Critical operation requires dual manager approval in current risk/trust state."
            # High trust/low risk
            return "Require MFA", "Critical operation triggers MFA re-verification step-up."

        if sensitivity == "High":
            if risk == "High" or trust == "Low":
                return "Require Manager Approval", "High sensitivity action requires manager approval in elevated risk state."
            if risk == "Medium" or trust == "Medium":
                return "Require MFA", "High sensitivity action triggers MFA verification under medium trust."
            return "Allow + Log", "High sensitivity action allowed and logged under normal security parameters."

        if sensitivity == "Medium":
            if risk == "High" or trust == "Low":
                return "Require MFA", "Medium sensitivity action requires MFA re-verification due to elevated risk/low trust."
            if risk == "Medium" or trust == "Medium":
                return "Allow + Log", "Medium sensitivity action logged under moderate risk parameters."
            return "Allow", "Medium sensitivity action allowed within safe baseline boundaries."

        # Low sensitivity actions
        if risk == "High" or trust == "Low":
            return "Require MFA", "Low sensitivity action stepped up to MFA verification due to high session risk."
        return "Allow", "Low sensitivity action permitted."
