from typing import Dict, Any, Tuple, List
from app.pdp.models import PDPPolicyProfile, PolicyDecision
from app.pdp.evaluators.rules import PDPRuleEvaluator
from app.pdp.decision_matrix.evaluator import PDPDecisionMatrix
from app.pdp.approvals.workflow import PDPApprovalWorkflow

class PDPPolicyEngine:
    OUTCOME_RANK = {
        "Allow": 1,
        "Allow + Log": 2,
        "Require MFA": 3,
        "Escalate to SOC": 4,
        "Pause Sensitive Action": 4,
        "Require Manager Approval": 5,
        "Reject": 6
    }

    @classmethod
    def reconcile_outcomes(cls, outcome_a: str, outcome_b: str) -> str:
        """
        Reconciles two policy decisions, selecting the more restrictive of the two.
        """
        rank_a = cls.OUTCOME_RANK.get(outcome_a, 1)
        rank_b = cls.OUTCOME_RANK.get(outcome_b, 1)
        
        if rank_a >= rank_b:
            return outcome_a
        return outcome_b

    @classmethod
    def evaluate(
        cls,
        event: Dict[str, Any],
        risk_score: float,
        risk_level: str,
        trust_score: float,
        trust_level: str,
        profile: PDPPolicyProfile
    ) -> PolicyDecision:
        """
        Consumes rules and the decision matrix, reconciles the outcomes,
        and builds the final PolicyDecision object.
        """
        role = event.get("role", "Employee")
        action = event.get("action", "").lower().replace("_", "-")

        # 1. Evaluate Rule-based controls
        rule_outcome, rule_evidence = PDPRuleEvaluator.evaluate_rules(
            event=event,
            risk_score=risk_score,
            trust_score=trust_score,
            profile=profile
        )

        # 2. Evaluate Matrix-based controls
        action_sensitivity = PDPDecisionMatrix.get_action_sensitivity(action)
        matrix_outcome, matrix_reason = PDPDecisionMatrix.evaluate_matrix(
            risk_level=risk_level,
            trust_level=trust_level,
            action_sensitivity=action_sensitivity,
            role=role
        )

        # 3. Reconcile both outcomes (Take the more secure/restrictive)
        final_decision = cls.reconcile_outcomes(rule_outcome, matrix_outcome)

        # 4. Resolve approval requirements
        approval_req, reviewer, playbook = PDPApprovalWorkflow.resolve_approval_workflow(
            decision=final_decision,
            event=event,
            policy_name=profile.name
        )

        # Combine reasoning explanation
        reason_explanation = ""
        if final_decision == "Reject":
            reason_explanation = f"Access rejected. " + (matrix_reason if final_decision == matrix_outcome else "; ".join(rule_evidence))
        elif final_decision == "Require Manager Approval":
            reason_explanation = f"Step-up manager approval required. " + (matrix_reason if final_decision == matrix_outcome else "; ".join(rule_evidence))
        elif final_decision == "Require MFA":
            reason_explanation = f"Step-up MFA authentication challenge required. " + (matrix_reason if final_decision == matrix_outcome else "; ".join(rule_evidence))
        elif final_decision == "Allow + Log":
            reason_explanation = "Access permitted, subject to elevated audit logging controls."
        else:
            reason_explanation = "Access permitted cleanly."

        # Compile supporting evidence
        supporting_evidence = []
        supporting_evidence.extend(rule_evidence)
        supporting_evidence.append(f"Action Sensitivity: {action_sensitivity}")
        supporting_evidence.append(f"Risk Standing: Score={risk_score} ({risk_level})")
        supporting_evidence.append(f"Trust Standing: Score={trust_score} ({trust_level})")
        supporting_evidence.append(f"Decision Matrix Outcome: {matrix_outcome} ({matrix_reason})")

        return PolicyDecision(
            decision=final_decision,
            reason=reason_explanation,
            triggered_policy=profile.name,
            approval_requirement=approval_req,
            required_reviewer=reviewer,
            recommended_response=playbook,
            supporting_evidence=supporting_evidence
        )
