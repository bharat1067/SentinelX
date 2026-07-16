from typing import Dict, Any, List
from app.risk_engine.scoring.models import RiskState

class RiskTimelineTracker:
    @staticmethod
    def record_snapshot(
        state: RiskState,
        timestamp: str,
        event_id: str,
        trend: str
    ) -> None:
        """
        Records a timestamped risk evaluation snapshot in the session's risk timeline history.
        """
        snapshot = {
            "timestamp": timestamp,
            "event_id": event_id,
            "score": state.current_risk_score,
            "level": state.risk_level,
            "trend": trend
        }
        state.timeline_history.append(snapshot)
