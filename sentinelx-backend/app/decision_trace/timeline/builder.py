from typing import List, Dict, Any
from app.decision_trace.models import DecisionTimelineEvent

class DecisionTimelineBuilder:
    @staticmethod
    def build_timeline(
        session_id: str,
        events: List[Dict[str, Any]],
        trust_history: List[Dict[str, Any]],
        risk_history: List[Dict[str, Any]]
    ) -> List[DecisionTimelineEvent]:
        """
        Chronologically stitches session events, trust scoring, and risk indexes
        into a step-by-step decision sequence.
        """
        timeline_events: List[DecisionTimelineEvent] = []
        
        # Sort events by timestamp to ensure chronological order
        sorted_events = sorted(events, key=lambda e: e.get("timestamp", ""))

        # Create quick lookups for scores by event_id
        trust_by_evt = {item.get("event_id"): item.get("score") for item in trust_history}
        risk_by_evt = {item.get("event_id"): item.get("score") for item in risk_history}

        # Track running state scores to calculate deltas
        prev_trust = 90.0  # trust default start is 90
        prev_risk = 10.0   # risk default start is 10

        for event in sorted_events:
            evt_id = event.get("event_id", "EVT-UNKNOWN")
            timestamp = event.get("timestamp", "")
            action = event.get("action", "unknown-action")
            resource = event.get("resource", "unknown-resource")
            device = event.get("device", "UNKNOWN")
            location = event.get("location", "UNKNOWN")
            
            # Fetch current scores at this event tick
            curr_trust = trust_by_evt.get(evt_id, prev_trust)
            curr_risk = risk_by_evt.get(evt_id, prev_risk)

            # Compute deltas
            trust_change = curr_trust - prev_trust
            risk_change = curr_risk - prev_risk

            # Generate description based on action type
            description = DecisionTimelineBuilder._generate_description(event, action, resource, device, location)

            timeline_events.append(DecisionTimelineEvent(
                timestamp=timestamp,
                event_id=evt_id,
                action=action,
                description=description,
                trust_change=round(trust_change, 2),
                risk_change=round(risk_change, 2)
            ))

            # Progress previous placeholders
            prev_trust = curr_trust
            prev_risk = curr_risk

        return timeline_events

    @staticmethod
    def _generate_description(
        event: Dict[str, Any],
        action: str,
        resource: str,
        device: str,
        location: str
    ) -> str:
        payload = event.get("payload", {})
        
        if action == "session-initialize":
            return f"Session initialized by operator on workstation terminal '{device}' at '{location}'."
        elif action == "session-terminate":
            return "Session terminated cleanly by operator."
        elif action == "db-query-select":
            sql = payload.get("sql_statement", "SELECT query")
            return f"Executed SELECT database query: '{sql}' targeting {resource}."
        elif action == "db-query-mass-select":
            rows = payload.get("affected_rows", 0)
            return f"CRITICAL: Massive query execution reading {rows} rows from {resource}."
        elif action == "db-privilege-bypass":
            return f"CRITICAL: Attempted supervisor credential bypass targeting {resource}."
        elif action == "usb-hardware-mount":
            model = payload.get("device_model", "USB storage device")
            return f"ALERT: Mounted external hardware USB device '{model}'."
        elif action == "audit-deactivate-attempt":
            return f"ALERT: Attempted to disable host system audit logging daemon: {resource}."
        elif action == "backdoor-admin-deploy":
            return f"ALERT: Attempted unauthorized persistent role deployment in {resource}."
        elif action == "session-kill-action":
            return f"SentinelX PDP intervention: Session terminated automatically. Reason: {payload.get('reason', 'Security Policy Threshold Exceeded')}."
        else:
            return f"Performed operation '{action}' targeting resource asset '{resource}'."
