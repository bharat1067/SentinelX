from typing import Dict, Any
from app.pdp.models import PolicyDecision
from app.pdp.policies.profiles import POL_PROFILES_REGISTRY, NormalBankingOperationsPolicy
from app.pdp.policy_engine.engine import PDPPolicyEngine

class PDPManager:
    @staticmethod
    def evaluate_policy(
        event: Dict[str, Any],
        behaviour_summary: Dict[str, Any],
        trust_summary: Dict[str, Any],
        risk_evaluation: Any,
        policy_profile_name: str = "Normal Banking Operations"
    ) -> PolicyDecision:
        """
        Coordinates and runs PDP evaluation against the current active transaction context
        and returns the final PolicyDecision model.
        """
        # 1. Fetch policy profile
        profile = POL_PROFILES_REGISTRY.get(policy_profile_name, NormalBankingOperationsPolicy)

        # 2. Extract trust metrics
        trust_score = trust_summary.get("current_trust_score", 90.0)
        trust_level = trust_summary.get("trust_level", "High")

        # 3. Extract risk metrics
        risk_score = getattr(risk_evaluation, "current_risk_score", 10.0)
        risk_level = getattr(risk_evaluation, "risk_level", "Very Low")

        # 4. Run Policy Decision Point evaluation
        decision = PDPPolicyEngine.evaluate(
            event=event,
            risk_score=risk_score,
            risk_level=risk_level,
            trust_score=trust_score,
            trust_level=trust_level,
            profile=profile
        )

        return decision
