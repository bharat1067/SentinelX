from typing import Dict, Any, List, Tuple
from app.pdp.models import PDPPolicyProfile

class PDPRuleEvaluator:
    @staticmethod
    def evaluate_rules(
        event: Dict[str, Any],
        risk_score: float,
        trust_score: float,
        profile: PDPPolicyProfile
    ) -> Tuple[str, List[str]]:
        """
        Runs policy rules sequentially to check for violations and map baseline conditions.
        Returns a tuple of (outcome_recommendation, evidence_list).
        """
        evidence = []
        role = event.get("role", "Employee")
        action = event.get("action", "").lower().replace("_", "-")

        # Rule 1: Role Validation
        if role not in profile.allowed_roles:
            evidence.append(f"Unauthorized role: Role '{role}' is not in the permitted list: {profile.allowed_roles}")
            return "Reject", evidence

        # Rule 2: Hard Block Limits (Max Risk Exceeded / Min Trust Dropped)
        if risk_score > profile.max_risk_allowed:
            evidence.append(f"Risk score {risk_score} exceeds maximum allowed risk threshold {profile.max_risk_allowed}")
            return "Reject", evidence
        
        if trust_score < profile.min_trust_required:
            evidence.append(f"Trust score {trust_score} has dropped below the minimum required trust {profile.min_trust_required}")
            return "Reject", evidence

        # Rule 3: Critical Action Safeguards
        if action in profile.critical_actions:
            evidence.append(f"Action '{action}' is marked as a critical action under policy '{profile.name}'")
            # If trust is decreasing or risk is elevated, step up immediately
            if risk_score > 40.0 or trust_score < 70.0:
                evidence.append("Risk/trust metrics are elevated during critical action execution")
                return "Require Manager Approval", evidence
            else:
                return "Require MFA", evidence

        # Rule 4: Dynamic Threshold Escalation
        if risk_score >= profile.requires_approval_threshold:
            evidence.append(f"Risk score {risk_score} has exceeded the approval threshold {profile.requires_approval_threshold}")
            return "Require Manager Approval", evidence

        if risk_score >= profile.requires_mfa_threshold:
            evidence.append(f"Risk score {risk_score} has exceeded the MFA threshold {profile.requires_mfa_threshold}")
            return "Require MFA", evidence

        # Rule 5: Normal Flow
        if risk_score > 20.0 or trust_score < 85.0:
            evidence.append("Minor anomalous indicators; session logging step-up activated")
            return "Allow + Log", evidence

        evidence.append("All session parameters are normal")
        return "Allow", evidence
