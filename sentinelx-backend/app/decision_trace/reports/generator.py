from datetime import datetime
from app.decision_trace.models import DecisionTrace, ExportedReport
from app.decision_trace.formatter.view import DecisionTraceFormatter

class DecisionReportGenerator:
    @staticmethod
    def generate_incident_summary(trace: DecisionTrace) -> ExportedReport:
        """
        Brief dashboard incident summary report.
        """
        now_str = datetime.now().isoformat()
        reasons_str = ", ".join(trace.reasons) if trace.reasons else "No operational deviations."
        content = (
            f"# SENTINELX INCIDENT SUMMARY REPORT\n"
            f"**Generated At:** {now_str}\n"
            f"**Session ID:** {trace.session_id} | **Operator Username:** {trace.username}\n\n"
            f"## Executive Summary\n"
            f"{trace.decision_summary}\n\n"
            f"## Key Risk Profile Metrics\n"
            f"*   **Risk Level:** {trace.recommended_action}\n"
            f"*   **Active Risk Violations:** {reasons_str}\n"
            f"*   **Recommended Action:** **{trace.recommended_action}**\n"
        )
        return ExportedReport(
            report_type="Incident Summary",
            session_id=trace.session_id,
            generated_at=now_str,
            content=content
        )

    @staticmethod
    def generate_decision_report(trace: DecisionTrace) -> ExportedReport:
        """
        Mathematical decision-making validation breakdown report.
        """
        now_str = datetime.now().isoformat()
        
        breakdown_section = ""
        for factor, pct in trace.risk_contribution.items():
            clean_factor = factor.replace("_contribution", "").replace("_", " ").title()
            breakdown_section += f"*   **{clean_factor}:** {pct:.1f}%\n"

        content = (
            f"# SENTINELX RISK DECISION VALIDATION REPORT\n"
            f"**Generated At:** {now_str}\n"
            f"**Session Reference:** {trace.session_id}\n\n"
            f"## Mathematical Risk Factor Breakdown\n"
            f"Below is the relative percentage contribution of each active security vector to the final risk score:\n\n"
            f"{breakdown_section}\n"
            f"## Decision Confidence Metrics\n"
            f"The unified risk model calculated these metrics with **{trace.confidence:.1f}% confidence** based on mathematical indicators.\n"
        )
        return ExportedReport(
            report_type="Decision Report",
            session_id=trace.session_id,
            generated_at=now_str,
            content=content
        )

    @staticmethod
    def generate_soc_report(trace: DecisionTrace) -> ExportedReport:
        """
        Detailed operational report for SOC analyst investigation.
        """
        now_str = datetime.now().isoformat()
        timeline_str = DecisionTraceFormatter.format_timeline(trace.timeline)

        content = (
            f"# SOC CYBERSECURITY INVESTIGATION REPORT\n"
            f"**Session ID:** {trace.session_id} | **Subject Operator:** {trace.username}\n"
            f"**Clearance Classification:** CONFIDENTIAL // SECURITY OPERATIONS\n"
            f"**Report Generated:** {now_str}\n\n"
            f"## 1. Operational Threat Summary\n"
            f"{trace.decision_summary}\n\n"
            f"## 2. Chronological Action Sequence\n"
            f"The following vertical cascade lists actions performed in this session alongside trust and risk adjustments:\n\n"
            f"```text\n"
            f"{timeline_str}\n"
            f"```\n\n"
            f"## 3. Threat Indicator Violations\n"
            + "\n".join([f"*   [X] **{r}**" for r in trace.reasons]) + "\n\n"
            f"## 4. Analyst Action Playbook\n"
            f"**RECOMMENDED RESPONSE ACTION:** `{trace.recommended_action}`\n\n"
            f"**Analyst Notes:** Perform out-of-band verification with {trace.username} to validate session integrity. If compromised, initiate the incident response program immediately."
        )
        return ExportedReport(
            report_type="SOC Investigation Report",
            session_id=trace.session_id,
            generated_at=now_str,
            content=content
        )

    @staticmethod
    def generate_audit_summary(trace: DecisionTrace) -> ExportedReport:
        """
        Regulatory compliance audit report.
        """
        now_str = datetime.now().isoformat()
        
        events_rows = ""
        for evt in trace.timeline:
            events_rows += f"| {evt.timestamp} | {evt.event_id} | {evt.action.upper()} | Trust delta: {evt.trust_change:+.1f}, Risk delta: {evt.risk_change:+.1f} |\n"

        content = (
            f"# COMPLIANCE AUDIT EVIDENCE SUMMARY\n"
            f"**Audit Key Reference:** AUD-{trace.session_id}\n"
            f"**Audit Timestamp:** {now_str}\n\n"
            f"## Session Governance Information\n"
            f"| Metric Variable | Logged State Data Value |\n"
            f"| --- | --- |\n"
            f"| Target User | {trace.username} |\n"
            f"| Session ID | {trace.session_id} |\n"
            f"| Evaluated Decision | {trace.recommended_action} |\n"
            f"| Confidence Score | {trace.confidence:.1f}% |\n\n"
            f"## Transaction History Log\n"
            f"| Timestamp | Event ID | Action Type | Evaluation Outcome |\n"
            f"| --- | --- | --- | --- |\n"
            f"{events_rows}\n"
            f"## Integrity Attestation\n"
            f"This compliance trace was compiled deterministically from baseline profiles and is recorded in the immutable audit trail."
        )
        return ExportedReport(
            report_type="Audit Evidence Summary",
            session_id=trace.session_id,
            generated_at=now_str,
            content=content
        )
