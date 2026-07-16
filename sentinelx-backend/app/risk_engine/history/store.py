from typing import Dict, Any, List
from app.risk_engine.scoring.models import RiskState

class RiskHistoryStore:
    @staticmethod
    def log_delta_reasons(
        state: RiskState,
        timestamp: str,
        deltas: List[Dict[str, Any]]
    ) -> None:
        """
        Appends risk delta events with explanation reasons to the audit log trail.
        """
        for item in deltas:
            state.reasons_history.append({
                "timestamp": timestamp,
                "delta": round(item.get("delta", 0.0), 2),
                "reason": item.get("reason", "Standard Evaluation")
            })
