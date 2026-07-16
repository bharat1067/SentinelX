from typing import Dict, Any, List
from app.trust_engine.metrics.models import TrustState
from app.trust_engine.calculator.engine import DynamicTrustCalculator

class TrustEngineManager:
    def __init__(self):
        self._states: Dict[str, TrustState] = {}
        self._calculator = DynamicTrustCalculator()

    def get_or_create_state(self, username: str) -> TrustState:
        """
        Retrieves or initializes a continuous trust state for a session operator.
        """
        if username not in self._states:
            state = TrustState(
                username=username,
                current_trust=90.0, # default starting base score
                previous_trust=90.0,
                trust_level="High"
            )
            self._states[username] = state
            print(f"[TRUST-MANAGER] Initialized trust index registry for {username}.")
        return self._states[username]

    def freeze_trust(self, username: str) -> bool:
        if username in self._states:
            self._states[username].is_frozen = True
            return True
        return False

    def reset_trust(self, username: str) -> bool:
        if username in self._states:
            del self._states[username]
            return True
        return False

    def evaluate_session_trust(self, username: str, evaluation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates score changes, records logs, and updates trust level variables.
        """
        state = self.get_or_create_state(username)
        
        if state.is_frozen:
            return self._build_summary(state)

        # 1. Store previous score
        state.previous_trust = state.current_trust

        # 2. Evaluate new trust score deltas
        new_score, deltas = self._calculator.evaluate_trust(state, evaluation)
        state.current_trust = new_score
        state.trust_level = DynamicTrustCalculator.map_score_to_level(new_score)

        # 3. Log reasons
        for delta_item in deltas:
            state.reasons_history.append({
                "timestamp": evaluation.get("timestamp"),
                "delta": delta_item["delta"],
                "reason": delta_item["reason"]
            })

        # 4. Log timeline snapshots
        state.timeline_history.append({
            "timestamp": evaluation.get("timestamp"),
            "event_id": evaluation.get("event_id"),
            "session_id": evaluation.get("session_id"),
            "score": new_score,
            "level": state.trust_level
        })

        return self._build_summary(state, deltas)

    def _build_summary(self, state: TrustState, last_deltas: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Builds the summary dictionary output.
        """
        if last_deltas is None:
            last_deltas = []

        trend = "NEUTRAL"
        if state.current_trust > state.previous_trust:
            trend = "UPWARD"
        elif state.current_trust < state.previous_trust:
            trend = "DOWNWARD"

        return {
            "username": state.username,
            "current_trust_score": state.current_trust,
            "trust_level": state.trust_level,
            "trust_trend": trend,
            "trust_reasons": last_deltas,
            "trust_history": state.timeline_history,
            "trust_summary": f"User {state.username} trust standing evaluated at {state.trust_level} ({state.current_trust}/100)"
        }
