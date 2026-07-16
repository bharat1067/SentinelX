from typing import List, Dict, Any

class DecisionReasoner:
    @staticmethod
    def generate_reasons(
        behaviour_summary: Dict[str, Any],
        trust_summary: Dict[str, Any],
        risk_reasons: List[Dict[str, Any]],
        event: Dict[str, Any]
    ) -> List[str]:
        """
        Extracts and converts raw linter and evaluation rules into a clean list of
        structured, high-level security explanations.
        """
        reasons_set = set()

        # 1. Parse behaviour deviation reasons
        dev_reasons = behaviour_summary.get("deviation_reasons", [])
        for r in dev_reasons:
            if "Late Login" in r or "hour" in r.lower():
                reasons_set.add("Late Login")
            if "Unknown Device" in r or "workstation" in r.lower():
                reasons_set.add("Unknown Device")
            if "Location" in r or "location" in r.lower():
                reasons_set.add("Unknown Location")
            if "Command" in r or "action" in r.lower():
                reasons_set.add("Abnormal SQL Pattern")

        # 2. Parse risk reasons
        for item in risk_reasons:
            reason_text = item.get("reason", "")
            if "Late Login" in reason_text:
                reasons_set.add("Late Login")
            if "Unknown workstation" in reason_text:
                reasons_set.add("Unknown Device")
            if "Location" in reason_text:
                reasons_set.add("Unknown Location")
            if "mass-select" in reason_text or "Massive query" in reason_text:
                reasons_set.add("Bulk Export")
            if "bypass" in reason_text or "backdoor" in reason_text:
                reasons_set.add("Privilege Escalation")
            if "audit" in reason_text:
                reasons_set.add("Audit Disabled")
            if "usb" in reason_text or "USB" in reason_text:
                reasons_set.add("USB Mount Anomaly")

        # 3. Check event action directly
        action = event.get("action", "").lower().replace("_", "-")
        if "mass-select" in action:
            reasons_set.add("Bulk Export")
        elif "bypass" in action or "backdoor" in action:
            reasons_set.add("Privilege Escalation")
        elif "audit" in action:
            reasons_set.add("Audit Disabled")
        elif "usb" in action:
            reasons_set.add("USB Mount Anomaly")
            
        resource = event.get("resource", "").lower()
        if "customer_accounts" in resource or "postgres_ledgers" in resource:
            reasons_set.add("Sensitive Database")

        # Fallback if empty but deviation is positive
        if not reasons_set and behaviour_summary.get("deviation_percentage", 0.0) > 0.0:
            reasons_set.add("Abnormal SQL Pattern")

        return sorted(list(reasons_set))

    @staticmethod
    def generate_decision_summary(
        risk_score: float,
        reasons: List[str],
        username: str
    ) -> str:
        """
        Creates a concise, human-readable overview of why the security state
        reaches the calculated risk level.
        """
        if not reasons:
            return f"Session parameters for operator {username} fully conform to regular baseline behavior patterns. No deviations detected."

        reasons_clause = ", ".join(reasons)
        if risk_score >= 85.0:
            return f"Critical compromise signature sequence detected for operator {username}. Multiple anomalous triggers present: {reasons_clause}. Direct access termination is highly recommended."
        elif risk_score >= 70.0:
            return f"High risk activity sequence detected for operator {username} involving: {reasons_clause}. Session trust standing has severely degraded."
        elif risk_score >= 50.0:
            return f"Moderate risk level assigned to operator {username} due to anomalous behaviors: {reasons_clause}. Continuous monitoring step-up checks recommended."
        elif risk_score >= 30.0:
            return f"Low risk level assigned to operator {username} with minor operational anomalies: {reasons_clause}."
        else:
            return f"Session activity for operator {username} is stable (Score: {risk_score}/100) with minor warnings: {reasons_clause}."
