from typing import Dict
from app.risk_engine.scoring.models import RiskSubScores, RiskBreakdown

class RiskBreakdownAnalyzer:
    @staticmethod
    def analyze_contributions(
        sub_scores: RiskSubScores,
        weights: Dict[str, float],
        previous_risk_score: float,
        history_weight: float = 0.2
    ) -> RiskBreakdown:
        """
        Calculates the relative percentage contribution of each risk factor
        to the final risk score, ensuring the total sums to exactly 100.0%.
        """
        # Calculate raw weighted points for each dimension
        w_behaviour = weights.get("behaviour", 0.20) * sub_scores.behaviour_risk
        w_trust = weights.get("trust", 0.25) * sub_scores.trust_risk
        w_device = weights.get("device", 0.15) * sub_scores.device_risk
        w_location = weights.get("location", 0.15) * sub_scores.location_risk
        w_action = weights.get("action", 0.10) * sub_scores.action_risk
        w_asset = weights.get("resource", 0.10) * sub_scores.resource_risk
        
        # Time risk and previous history constitute the historical context
        w_historical = (weights.get("time", 0.05) * sub_scores.time_risk) + (history_weight * previous_risk_score)

        total_points = w_behaviour + w_trust + w_device + w_location + w_action + w_asset + w_historical

        if total_points == 0:
            # Equal contribution if there's zero risk points overall
            val = 100.0 / 7.0
            return RiskBreakdown(
                behaviour_contribution=round(val, 2),
                trust_contribution=round(val, 2),
                device_contribution=round(val, 2),
                location_contribution=round(val, 2),
                action_contribution=round(val, 2),
                asset_contribution=round(val, 2),
                historical_contribution=round(val, 2)
            )

        # Normalize to percentage values
        contrib_behaviour = (w_behaviour / total_points) * 100.0
        contrib_trust = (w_trust / total_points) * 100.0
        contrib_device = (w_device / total_points) * 100.0
        contrib_location = (w_location / total_points) * 100.0
        contrib_action = (w_action / total_points) * 100.0
        contrib_asset = (w_asset / total_points) * 100.0
        contrib_historical = (w_historical / total_points) * 100.0

        return RiskBreakdown(
            behaviour_contribution=round(contrib_behaviour, 2),
            trust_contribution=round(contrib_trust, 2),
            device_contribution=round(contrib_device, 2),
            location_contribution=round(contrib_location, 2),
            action_contribution=round(contrib_action, 2),
            asset_contribution=round(contrib_asset, 2),
            historical_contribution=round(contrib_historical, 2)
        )
