import time
from typing import Dict, Any
from app.simulation.timelines.controller import SimulationController
from app.event_pipeline.bus import global_event_bus
from app.behaviour_intelligence.manager import BehaviourIntelligenceManager
from app.trust_engine.manager import TrustEngineManager
from app.risk_engine import RiskEngineManager
from app.decision_trace import DecisionTraceManager
from app.decision_trace.reports.generator import DecisionReportGenerator
from app.decision_trace.exports.document import DecisionReportExporter
from app.decision_trace.formatter.view import DecisionTraceFormatter
from app.pdp import PDPManager
from app.orchestration import ResponseOrchestrationManager
from app.audit_chain import AuditChainManager
from app.audit_chain.exports.document import AuditDocumentExporter

# Initialize UEBA, Trust, Risk, and PDP managers coordinators
behaviour_manager = BehaviourIntelligenceManager()
trust_manager = TrustEngineManager()
risk_manager = RiskEngineManager()

def integrated_evaluator_listener(event: Dict[str, Any]) -> None:
    """
    Callback stream subscriber evaluating normalized event behaviors, session trust scores,
    unified risk levels, decision traces, and executing Policy Decision Point (PDP) checks.
    """
    print(f"  [INGESTED] Event ID: {event['event_id']}")
    print(f"    Action: {event['action']} | Device: {event['device']} | Location: {event['location']}")
    
    # 1. Evaluate user behavior
    behaviour_eval = behaviour_manager.evaluate_incoming_event(event)
    
    # 2. Evaluate session trust state
    username = event.get("username", "System")
    trust_eval = trust_manager.evaluate_session_trust(username, behaviour_eval)
    
    # 3. Evaluate unified risk score
    session_id = event.get("session_id", "SES-GENERIC")
    profile = behaviour_manager.get_or_create_profile(username)
    risk_eval = risk_manager.evaluate_session_risk(
        session_id=session_id,
        event=event,
        behaviour_summary=behaviour_eval,
        trust_summary=trust_eval,
        historical_profile=profile
    )
    
    # 4. Generate Decision Trace
    session_history = global_event_bus.get_session_history(session_id)
    trace = DecisionTraceManager.build_trace(
        session_id=session_id,
        username=username,
        events=session_history,
        behaviour_summary=behaviour_eval,
        trust_summary=trust_eval,
        risk_evaluation=risk_eval
    )
    
    # 5. Evaluate Policy Decision Point (PDP)
    # Choose appropriate policy profiles depending on session types for testing
    policy_profile = "Normal Banking Operations"
    if session_id == "SES-99912":
        policy_profile = "Production Database"
    elif event.get("role") == "Manager":
        policy_profile = "Privileged Administration"
        
    pdp_decision = PDPManager.evaluate_policy(
        event=event,
        behaviour_summary=behaviour_eval,
        trust_summary=trust_eval,
        risk_evaluation=risk_eval,
        policy_profile_name=policy_profile
    )
    
    # 6. Format and print the Decision Trace summary
    print(DecisionTraceFormatter.format_trace(trace))
    print("\n  [CHRONOLOGICAL TIMELINE]")
    print(DecisionTraceFormatter.format_timeline(trace.timeline))
    print("-" * 60)
    
    # 7. Print PDP Evaluation Results
    print(f"    [POLICY DECISION POINT] Decision Outcome: {pdp_decision.decision}")
    print(f"      Reason: {pdp_decision.reason}")
    print(f"      Triggered Policy Profile: {pdp_decision.triggered_policy}")
    print(f"      Approval Required: {pdp_decision.approval_requirement} (Reviewer: {pdp_decision.required_reviewer})")
    print(f"      Recommended Action Code: {pdp_decision.recommended_response}")
    print("      Supporting Evidence Logs:")
    for evidence in pdp_decision.supporting_evidence:
        print(f"        - {evidence}")
    print("-" * 60)
    
    # 8. Execute Response Orchestration (SOAR Playbook Workflows)
    # Determine simulated approval status
    # For testing, let's say after a critical event (like USB Mount or Audit Tamper), subsequent steps are "Approved" by manager to see playbooks proceed.
    approval_status = "Pending"
    reviewer = "None"
    if event.get("action") in ["backdoor-admin-deploy", "session-kill-action"]:
        approval_status = "Approved"
        reviewer = "IT Governance Manager"
        
    orchestrator_result = ResponseOrchestrationManager.execute_orchestration(
        pdp_decision=pdp_decision,
        approval_status=approval_status,
        reviewer=reviewer,
        event=event,
        risk_score=getattr(risk_eval, "current_risk_score", 10.0)
    )
    
    print("    [SOAR RESPONSE ORCHESTRATION] Playbook Timeline:")
    print(f"      Summary: {orchestrator_result.execution_summary}")
    print(f"      Status: {orchestrator_result.execution_status}")
    print("      Timeline steps:")
    for log in orchestrator_result.execution_timeline:
        print(f"        - {log}")
    print(f"      Completed: {orchestrator_result.completed_actions}")
    print(f"      Pending: {orchestrator_result.pending_actions}")
    print("-" * 60)
    
    # 9. Commit Security Decision Event to Continuous Quantum Audit Chain
    audit_record = AuditChainManager.commit_to_audit_chain(
        event=event,
        trust_score=trust_eval.get("current_trust_score", 90.0),
        risk_score=getattr(risk_eval, "current_risk_score", 10.0),
        decision=pdp_decision.decision,
        reviewer=pdp_decision.required_reviewer,
        response_executed=", ".join(orchestrator_result.completed_actions),
        evidence=pdp_decision.supporting_evidence
    )
    
    print("    [QUANTUM AUDIT CHAIN] Chained Record Sealed:")
    print(f"      Block Index: {audit_record.index} | Algorithm: {audit_record.algorithm_marker}")
    print(f"      Cryptographic Hash : {audit_record.current_hash}")
    print(f"      Quantum Signature  : {audit_record.quantum_signature}")
    print(f"      Linked Parent Hash : {audit_record.previous_hash}")
    print("-" * 60)
    
    # 10. Run Real-Time Ledger Verification Integrity Audit Check
    verification = AuditChainManager.run_chain_verification()
    print("    [QUANTUM AUDIT CHAIN] Integrity Audit Status:")
    print(f"      Status: {'PASSED' if verification.chain_valid else 'FAILED'}")
    print(f"      Summary: {verification.summary}")
    print("-" * 60)
    
    # 11. Compile & Export Forensic Evidence Package for Critical Sessions
    if event.get("action") == "session-kill-action":
        forensic_pack = AuditChainManager.compile_forensic_package(
            session_id=session_id,
            incident_summary=pdp_decision.reason,
            decision_trace=trace.decision_summary,
            risk_timeline=[f"[{pt.timestamp}] {pt.action} - Risk delta: {pt.risk_change}" for pt in trace.timeline],
            trust_timeline=[f"[{pt.timestamp}] {pt.action} - Trust delta: {pt.trust_change}" for pt in trace.timeline],
            execution_timeline=orchestrator_result.execution_timeline
        )
        forensic_md = AuditDocumentExporter.generate_forensic_markdown(forensic_pack)
        AuditDocumentExporter.export_to_file(
            content=forensic_md,
            filename=f"forensic_evidence_package_{session_id}.md",
            directory="app/decision_trace/exports"
        )
        print("-" * 60)

    # 12. Export Decision Trace Reports
    soc_report = DecisionReportGenerator.generate_soc_report(trace)
    incident_summary = DecisionReportGenerator.generate_incident_summary(trace)
    decision_report = DecisionReportGenerator.generate_decision_report(trace)
    audit_summary = DecisionReportGenerator.generate_audit_summary(trace)
    
    export_dir = "app/decision_trace/exports"
    DecisionReportExporter.export_to_file(soc_report, export_dir)
    DecisionReportExporter.export_to_file(incident_summary, export_dir)
    DecisionReportExporter.export_to_file(decision_report, export_dir)
    DecisionReportExporter.export_to_file(audit_summary, export_dir)
    print("=" * 60)


def run_ueba_and_trust_simulation():
    """
    Demonstrates integrated logs stream parsing, baseline profiling, and continuous trust mapping.
    """
    print("=" * 60)
    print("SENTINELX: CONTINUOUS TRUST MONITORING DEMO RUN")
    print("=" * 60)

    # 1. Subscribe evaluator callback
    global_event_bus.subscribe(integrated_evaluator_listener)
    print("[INIT] Subscribed unified trust stream listener to Event Bus.")

    # 2. Seed DBA baseline registry
    profile = behaviour_manager.get_or_create_profile("Amit Verma")
    profile.normal_device_ips = ["10.15.2.14"]
    profile.normal_devices = ["BOM-DBA-087"]
    profile.allowed_locations = ["PUNE_HQ_F4"]
    profile.normal_command_types = [
        "session-initialize", "session-terminate",
        "db-query-select", "db-maintenance-command",
        "system-service-connect", "integrity-check-run",
        "report-export-pdf"
    ]
    profile.history_weights_count = 5

    # Seed starting base trust state
    trust_state = trust_manager.get_or_create_state("Amit Verma")
    trust_state.current_trust = 90.0

    controller = SimulationController()

    # --- PHASE 1: NORMAL ROUTINE ACCESS ---
    print("\n" + "#" * 40)
    print("  PHASE 1: NORMAL WORKFLOW RUN")
    print("#" * 40)
    
    success = controller.load_scenario("SCN-001")
    if not success:
        return

    controller.start()
    while True:
        event = controller.step_forward()
        if not event:
            break
        time.sleep(0.01)

    # --- PHASE 2: ROGUE THREAT ACTIONS ---
    print("\n" + "#" * 40)
    print("  PHASE 2: ROGUE DBA ABUSE TIMELINE")
    print("#" * 40)
    
    success = controller.load_scenario("SCN-002")
    if not success:
        return

    controller.start()
    while True:
        event = controller.step_forward()
        if not event:
            break
        time.sleep(0.01)

    print("\n[TRUST MANAGER] Simulation runs and trust metrics finalized successfully.")
    print("=" * 60)

if __name__ == "__main__":
    run_ueba_and_trust_simulation()
