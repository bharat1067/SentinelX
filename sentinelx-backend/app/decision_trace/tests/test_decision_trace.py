import os
import shutil
import pytest
from app.decision_trace import DecisionTraceManager
from app.decision_trace.reports.generator import DecisionReportGenerator
from app.decision_trace.exports.document import DecisionReportExporter
from app.decision_trace.timeline.builder import DecisionTimelineBuilder
from app.decision_trace.explainer.reasoner import DecisionReasoner
from app.risk_engine.manager import RiskEngineManager
from app.behaviour_intelligence.profiles.models import BehaviourProfile

def test_timeline_builder():
    events = [
        {
            "event_id": "EVT-01",
            "session_id": "SES-100",
            "username": "Amit Verma",
            "role": "Employee",
            "action": "session-initialize",
            "resource": "bom_ledger.customer_accounts",
            "device": "BOM-DBA-087",
            "location": "PUNE_HQ_F4",
            "timestamp": "2026-07-15T09:00:00Z"
        },
        {
            "event_id": "EVT-02",
            "session_id": "SES-100",
            "username": "Amit Verma",
            "role": "Employee",
            "action": "db-query-select",
            "resource": "bom_ledger.customer_accounts",
            "device": "BOM-DBA-087",
            "location": "PUNE_HQ_F4",
            "timestamp": "2026-07-15T09:05:00Z"
        }
    ]
    
    trust_history = [
        {"event_id": "EVT-01", "score": 90.0},
        {"event_id": "EVT-02", "score": 90.0}
    ]
    
    risk_history = [
        {"event_id": "EVT-01", "score": 10.0},
        {"event_id": "EVT-02", "score": 10.0}
    ]
    
    timeline = DecisionTimelineBuilder.build_timeline("SES-100", events, trust_history, risk_history)
    
    assert len(timeline) == 2
    assert timeline[0].event_id == "EVT-01"
    assert timeline[0].trust_change == 0.0
    assert timeline[0].risk_change == 0.0
    assert "Session initialized" in timeline[0].description
    assert "db-query-select" in timeline[1].action

def test_reasoner_rules():
    behaviour_summary = {
        "deviation_percentage": 60.0,
        "deviation_reasons": ["Late Login", "Unknown Device IP source: 198.51.100.42"]
    }
    
    trust_summary = {
        "current_trust_score": 50.0
    }
    
    risk_reasons = [
        {"delta": 20.0, "reason": "Late Login"},
        {"delta": 25.0, "reason": "Targeting critical asset: bom_ledger.customer_accounts"}
    ]
    
    event = {
        "action": "db-query-mass-select",
        "resource": "bom_ledger.customer_accounts"
    }
    
    reasons = DecisionReasoner.generate_reasons(behaviour_summary, trust_summary, risk_reasons, event)
    
    assert "Late Login" in reasons
    assert "Unknown Device" in reasons
    assert "Bulk Export" in reasons  # from mass-select action
    assert "Sensitive Database" in reasons  # from resource
    
    summary = DecisionReasoner.generate_decision_summary(75.0, reasons, "Amit Verma")
    assert "High risk" in summary
    assert "Amit Verma" in summary

def test_full_decision_trace_flow():
    session_id = "SES-TEST"
    username = "Amit Verma"
    
    events = [
        {
            "event_id": "EVT-T1",
            "session_id": session_id,
            "username": username,
            "role": "Employee",
            "action": "usb-hardware-mount",
            "resource": "system_hardware.usb_drive",
            "device": "SANDISK-USB",
            "location": "PUNE_HQ_F4",
            "timestamp": "2026-07-15T10:00:00Z"
        }
    ]
    
    behaviour_summary = {
        "deviation_percentage": 80.0,
        "deviation_reasons": ["Unknown USB device"],
        "confidence_score": 0.95,
        "changed_features": ["terminal_id"]
    }
    
    trust_summary = {
        "current_trust_score": 10.0,
        "trust_history": [{"event_id": "EVT-T1", "score": 10.0}]
    }
    
    risk_manager = RiskEngineManager()
    profile = BehaviourProfile(username=username)
    risk_eval = risk_manager.evaluate_session_risk(session_id, events[0], behaviour_summary, trust_summary, profile)
    
    trace = DecisionTraceManager.build_trace(
        session_id=session_id,
        username=username,
        events=events,
        behaviour_summary=behaviour_summary,
        trust_summary=trust_summary,
        risk_evaluation=risk_eval
    )
    
    assert trace.session_id == session_id
    assert trace.username == username
    assert trace.confidence == 95.0
    assert "USB Mount Anomaly" in trace.reasons
    assert "behaviour_contribution" in trace.risk_contribution
    assert "Terminal Id" in trace.behaviour_contribution
    assert "Critical Plunge Signature" in trace.trust_contribution

def test_report_generation_and_export(tmp_path):
    trace_data = {
        "session_id": "SES-EXPORT-TEST",
        "username": "Amit Verma",
        "decision_summary": "Test summary of decision.",
        "timeline": [
            {
                "timestamp": "2026-07-15T12:00:00Z",
                "event_id": "EVT-E1",
                "action": "db-query-select",
                "description": "Select query run",
                "trust_change": 0.0,
                "risk_change": 0.0
            }
        ],
        "reasons": ["Late Login"],
        "risk_contribution": {"behaviour": 100.0},
        "trust_contribution": {"Baseline Compliance": 100.0},
        "behaviour_contribution": {"Baseline Compliance": 100.0},
        "recommended_action": "Prompt Session Re-Verification via SMS/OTP",
        "confidence": 98.0
    }
    
    from app.decision_trace.models import DecisionTrace
    trace = DecisionTrace(**trace_data)
    
    # Generate reports
    inc_summary = DecisionReportGenerator.generate_incident_summary(trace)
    dec_report = DecisionReportGenerator.generate_decision_report(trace)
    soc_report = DecisionReportGenerator.generate_soc_report(trace)
    aud_summary = DecisionReportGenerator.generate_audit_summary(trace)
    
    assert inc_summary.report_type == "Incident Summary"
    assert dec_report.report_type == "Decision Report"
    assert soc_report.report_type == "SOC Investigation Report"
    assert aud_summary.report_type == "Audit Evidence Summary"
    
    # Export reports
    export_dir = str(tmp_path / "reports_export")
    path_inc = DecisionReportExporter.export_to_file(inc_summary, export_dir)
    path_soc = DecisionReportExporter.export_to_file(soc_report, export_dir)
    
    assert os.path.exists(path_inc)
    assert os.path.exists(path_soc)
    assert os.path.basename(path_inc) == "incident_summary_SES-EXPORT-TEST.md"
