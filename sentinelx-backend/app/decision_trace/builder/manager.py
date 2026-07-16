from typing import Dict, Any, List
from app.decision_trace.models import DecisionTrace, DecisionTimelineEvent
from app.decision_trace.timeline.builder import DecisionTimelineBuilder
from app.decision_trace.explainer.reasoner import DecisionReasoner

class DecisionTraceManager:
    @staticmethod
    def build_trace(
        session_id: str,
        username: str,
        events: List[Dict[str, Any]],
        behaviour_summary: Dict[str, Any],
        trust_summary: Dict[str, Any],
        risk_evaluation: Any,
        historical_profile: Any = None
    ) -> DecisionTrace:
        """
        Gathers raw security engine data, stiches logs, and compiles
        the complete explainable DecisionTrace block.
        """
        # 1. Gather chronological timeline events
        # Note: risk_evaluation.timeline contains list of risk state timeline logs
        risk_timeline = getattr(risk_evaluation, "timeline", [])
        trust_timeline = trust_summary.get("trust_history", [])
        
        timeline_events = DecisionTimelineBuilder.build_timeline(
            session_id=session_id,
            events=events,
            trust_history=trust_timeline,
            risk_history=risk_timeline
        )

        # 2. Extract trigger reasons list
        risk_reasons = getattr(risk_evaluation, "reasons", [])
        reasons_list = DecisionReasoner.generate_reasons(
            behaviour_summary=behaviour_summary,
            trust_summary=trust_summary,
            risk_reasons=risk_reasons,
            event=events[-1] if events else {}
        )

        # 3. Generate summary text
        risk_score = getattr(risk_evaluation, "current_risk_score", 10.0)
        summary_text = DecisionReasoner.generate_decision_summary(
            risk_score=risk_score,
            reasons=reasons_list,
            username=username
        )

        # 3.1 Calculate deterministic Decision Confidence
        if historical_profile is not None:
            weight_count = getattr(historical_profile, "history_weights_count", 0)
            if weight_count == 0:
                weight_count = 1
            baseline_completeness = round(min(40.0, 40.0 * (weight_count / 5.0)), 2)

            trust_score = trust_summary.get("current_trust_score", 90.0)
            if (trust_score < 70.0 and risk_score >= 50.0) or (trust_score >= 80.0 and risk_score < 30.0):
                concordance = 30.0
            else:
                concordance = 15.0

            sensor_integrity = 30.0
            if behaviour_summary.get("is_anomalous_ip") or behaviour_summary.get("ip_address_deviation"):
                sensor_integrity -= 10.0
            if behaviour_summary.get("is_anomalous_device") or behaviour_summary.get("device_deviation"):
                sensor_integrity -= 10.0
            if behaviour_summary.get("is_anomalous_location") or behaviour_summary.get("location_deviation"):
                sensor_integrity -= 10.0

            confidence_val = baseline_completeness + concordance + sensor_integrity
            confidence_val = max(10.0, min(100.0, confidence_val))
            
            summary_text += (
                f" [Decision Confidence: {confidence_val:.1f}%. Calculated based on: "
                f"Baseline completeness ({baseline_completeness}%), "
                f"Telemetry Concordance ({concordance}%), "
                f"Sensor Integrity ({sensor_integrity}%).]"
            )
        else:
            confidence_val = behaviour_summary.get("confidence_score", 0.95)
            if confidence_val <= 1.0:
                confidence_val = confidence_val * 100.0

        # 4. Map risk contribution breakdown
        risk_breakdown = getattr(risk_evaluation, "breakdown", {})

        # 5. Compute Behaviour contribution breakdown
        changed_feats = behaviour_summary.get("changed_features", [])
        behaviour_contrib = {}
        if changed_feats:
            val = 100.0 / len(changed_feats)
            for f in changed_feats:
                clean_f = f.replace("_", " ").title()
                behaviour_contrib[clean_f] = round(val, 2)
        else:
            behaviour_contrib["Baseline Compliance"] = 100.0

        # 6. Compute Trust contribution breakdown
        trust_score = trust_summary.get("current_trust_score", 90.0)
        trust_contrib = {}
        if trust_score <= 10.0:
            trust_contrib["Critical Plunge Signature"] = 80.0
            trust_contrib["Standard Penalties"] = 20.0
            trust_contrib["Baseline Compliance"] = 0.0
        elif trust_score < 90.0:
            trust_contrib["Standard Penalties"] = 100.0
            trust_contrib["Baseline Compliance"] = 0.0
        else:
            trust_contrib["Baseline Compliance"] = 100.0

        # 7. Formulate recommendation
        rec_obj = getattr(risk_evaluation, "recommendation", None)
        recommended_action = rec_obj.recommended_action if rec_obj else "Allow Access Unchallenged"

        return DecisionTrace(
            session_id=session_id,
            username=username,
            decision_summary=summary_text,
            timeline=timeline_events,
            reasons=reasons_list,
            risk_contribution=risk_breakdown,
            trust_contribution=trust_contrib,
            behaviour_contribution=behaviour_contrib,
            recommended_action=recommended_action,
            confidence=round(confidence_val, 2)
        )
