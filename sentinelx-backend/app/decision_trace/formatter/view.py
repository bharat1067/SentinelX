from typing import List
from app.decision_trace.models import DecisionTrace, DecisionTimelineEvent

class DecisionTraceFormatter:
    @staticmethod
    def format_timeline(timeline: List[DecisionTimelineEvent]) -> str:
        """
        Formats a chronological timeline list into a clean, vertical cascading string representation.
        """
        if not timeline:
            return "No timeline events recorded."

        lines = []
        for i, event in enumerate(timeline):
            # Extract clean time representation (e.g. HH:MM:SS) from timestamp
            ts_str = event.timestamp
            if "T" in ts_str:
                ts_str = ts_str.split("T")[1].replace("Z", "")
            
            trust_delta_str = f"{event.trust_change:+.1f}" if event.trust_change != 0.0 else "0.0"
            risk_delta_str = f"{event.risk_change:+.1f}" if event.risk_change != 0.0 else "0.0"

            lines.append(f"[{ts_str}] {event.action.upper()}")
            lines.append(f"  |-- Info: {event.description}")
            lines.append(f"  \\__ Trust Delta: {trust_delta_str} | Risk Delta: {risk_delta_str}")
            
            # Draw connecting arrow to next event
            if i < len(timeline) - 1:
                lines.append("        v")
        
        return "\n".join(lines)

    @staticmethod
    def format_trace(trace: DecisionTrace) -> str:
        """
        Builds a comprehensive text summary block of the trace evaluation.
        """
        lines = []
        lines.append("============================================================")
        lines.append("                  DECISION TRACE EVALUATION                  ")
        lines.append("============================================================")
        lines.append(f"Session ID  : {trace.session_id}")
        lines.append(f"Operator    : {trace.username}")
        lines.append(f"Confidence  : {trace.confidence:.1f}%")
        lines.append("------------------------------------------------------------")
        lines.append("SUMMARY:")
        lines.append(trace.decision_summary)
        lines.append("------------------------------------------------------------")
        lines.append("ACTIVE REASONS:")
        if trace.reasons:
            for reason in trace.reasons:
                lines.append(f"  * [X] {reason}")
        else:
            lines.append("  * [ ] None (Normal operational bounds)")
        lines.append("------------------------------------------------------------")
        lines.append("FACTOR CONTRIBUTION BREAKDOWN:")
        for factor, pct in trace.risk_contribution.items():
            clean_factor = factor.replace("_contribution", "").replace("_", " ").title()
            lines.append(f"  * {clean_factor:<12}: {pct:>5.1f}%")
        lines.append("------------------------------------------------------------")
        lines.append(f"RECOMMENDATION: {trace.recommended_action}")
        lines.append("============================================================")
        return "\n".join(lines)
