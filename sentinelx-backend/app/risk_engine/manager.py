from typing import Dict, Any, List
from app.risk_engine.scoring.models import RiskState, RiskEvaluationResult, RiskSubScores, RiskBreakdown, RiskRecommendation
from app.risk_engine.calculator.engine import RiskCalculator
from app.risk_engine.policies.profiles import POLICIES_REGISTRY, NormalBankingPolicy
from app.risk_engine.breakdown.analyzer import RiskBreakdownAnalyzer
from app.risk_engine.timeline.tracker import RiskTimelineTracker
from app.risk_engine.history.store import RiskHistoryStore
from app.risk_engine.recommendations.engine import RiskRecommendationEngine

class RiskEngineManager:
    def __init__(self):
        self._states: Dict[str, RiskState] = {}

    def get_or_create_state(
        self,
        session_id: str,
        username: str,
        policy_name: str = "Normal Banking Policy"
    ) -> RiskState:
        """
        Retrieves or initializes a continuous risk evaluation state for a session.
        """
        if session_id not in self._states:
            state = RiskState(
                session_id=session_id,
                username=username,
                current_risk_score=10.0,  # Default starting base score (Low Risk)
                previous_risk_score=10.0,
                risk_level="Very Low",
                policy_name=policy_name
            )
            self._states[session_id] = state
            print(f"[RISK-MANAGER] Initialized risk index registry for session {session_id} ({username}).")
        return self._states[session_id]

    def freeze_risk(self, session_id: str) -> bool:
        """
        Locks state modifications for a session.
        """
        if session_id in self._states:
            self._states[session_id].is_frozen = True
            print(f"[RISK-MANAGER] Froze risk calculations for session {session_id}.")
            return True
        return False

    def reset_risk(self, session_id: str) -> bool:
        """
        Deletes the risk state for a session.
        """
        if session_id in self._states:
            del self._states[session_id]
            print(f"[RISK-MANAGER] Reset risk state data for session {session_id}.")
            return True
        return False

    def evaluate_session_risk(
        self,
        session_id: str,
        event: Dict[str, Any],
        behaviour_summary: Dict[str, Any],
        trust_summary: Dict[str, Any],
        historical_profile: Any
    ) -> RiskEvaluationResult:
        """
        Core orchestration sequence evaluating real-time session parameters, updating states,
        and producing explainable risk metrics.
        """
        username = event.get("username", "System")
        state = self.get_or_create_state(session_id, username)

        timestamp = event.get("timestamp", "")
        event_id = event.get("event_id", "EVT-UNKNOWN")

        if state.is_frozen:
            # Return current snapshot without calculating updates
            trend = "NEUTRAL"
            rec = RiskRecommendation(
                recommended_action="Access Frozen",
                reason="This session risk evaluations have been locked by system operators."
            )
            return self._build_result(state, trend, rec, [])

        # 1. Fetch configured risk policy
        policy = POLICIES_REGISTRY.get(state.policy_name, NormalBankingPolicy)

        # 2. Record previous score
        state.previous_risk_score = state.current_risk_score

        # 3. Calculate new risk parameters
        sub_scores, deltas, new_score = RiskCalculator.calculate_session_risk(
            event=event,
            behaviour_summary=behaviour_summary,
            trust_summary=trust_summary,
            historical_profile=historical_profile,
            policy=policy,
            previous_score=state.previous_risk_score
        )

        state.current_risk_score = round(new_score, 2)
        state.sub_scores = sub_scores

        # 4. Map score to discrete risk levels
        state.risk_level = self.map_score_to_level(new_score)

        # 5. Determine trend trajectory
        trend = "NEUTRAL"
        if state.current_risk_score > state.previous_risk_score:
            trend = "UPWARD"
        elif state.current_risk_score < state.previous_risk_score:
            trend = "DOWNWARD"

        # 6. Append delta reasons and timeline snapshots
        RiskHistoryStore.log_delta_reasons(state, timestamp, deltas)
        RiskTimelineTracker.record_snapshot(state, timestamp, event_id, trend)

        # 7. Analyze contributions for breakdown breakdown
        policy_weights = policy.weights
        state.breakdown = RiskBreakdownAnalyzer.analyze_contributions(
            sub_scores=sub_scores,
            weights=policy_weights,
            previous_risk_score=state.previous_risk_score
        )

        # 8. Compile recommended actions
        recommendation = RiskRecommendationEngine.generate_recommendation(
            score=state.current_risk_score,
            reasons=deltas
        )

        return self._build_result(state, trend, recommendation, deltas)

    def _build_result(
        self,
        state: RiskState,
        trend: str,
        recommendation: RiskRecommendation,
        active_deltas: List[Dict[str, Any]]
    ) -> RiskEvaluationResult:
        """
        Utility mapping internal states to evaluation schema outputs.
        """
        return RiskEvaluationResult(
            session_id=state.session_id,
            username=state.username,
            current_risk_score=state.current_risk_score,
            risk_level=state.risk_level,
            risk_trend=trend,
            sub_scores=state.sub_scores.model_dump(),
            breakdown=state.breakdown.model_dump(),
            reasons=active_deltas,
            timeline=state.timeline_history,
            recommendation=recommendation
        )

    @staticmethod
    def map_score_to_level(score: float) -> str:
        """
        Helper returning risk level groups.
        """
        if score >= 85.0:
            return "Critical"
        elif score >= 70.0:
            return "High"
        elif score >= 50.0:
            return "Medium"
        elif score >= 30.0:
            return "Low"
        else:
            return "Very Low"
