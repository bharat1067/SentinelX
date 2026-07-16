from app.risk_engine.scoring.models import RiskRecommendation

class RiskRecommendationEngine:
    @staticmethod
    def generate_recommendation(
        score: float,
        reasons: list
    ) -> RiskRecommendation:
        """
        Translates risk scores and triggers into appropriate, human-readable
        security recommendations with detailed justifications.
        """
        reasons_str = ", ".join([r["reason"] for r in reasons[-3:]]) if reasons else "Routine monitoring check"

        if score >= 85.0:
            return RiskRecommendation(
                recommended_action="Terminate Session Immediately & Lock Operator Account",
                reason=f"Critical risk indicators triggered: {reasons_str}."
            )
        elif score >= 70.0:
            return RiskRecommendation(
                recommended_action="Require Manager Approval for Database Transactions",
                reason=f"High risk activities: {reasons_str}."
            )
        elif score >= 50.0:
            return RiskRecommendation(
                recommended_action="Prompt Session Re-Verification via SMS/OTP",
                reason=f"Moderate behavioral deviation detected: {reasons_str}."
            )
        elif score >= 30.0:
            return RiskRecommendation(
                recommended_action="Log and Continue Continuous Monitoring",
                reason="Minor operational anomalies recorded; session parameters are within acceptable limits."
            )
        else:
            return RiskRecommendation(
                recommended_action="Allow Access Unchallenged",
                reason="Session parameters fully match historical baseline activities."
            )
