from fastapi import FastAPI, HTTPException, Query, Depends, status, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
import uuid
import datetime
from sqlalchemy.orm import Session

# Database Core Setup
from app.database.connection import get_db, init_db
from app.repositories.sqlalchemy_impl import (
    SQLAlchemyAuditRepository,
    SQLAlchemyBehaviourProfileRepository,
    SQLAlchemyTrustStateRepository,
    SQLAlchemyRiskStateRepository,
    SQLAlchemySessionRepository,
    SQLAlchemyAlertRepository,
    SQLAlchemyApprovalRepository,
    SQLAlchemyExecutionHistoryRepository,
    SQLAlchemySimulationStateRepository
)

# Authentication & Authorization (JWT + RBAC)
from app.core.auth.token import create_access_token, decode_access_token
from app.core.auth.rbac import get_current_user, RoleGuard

# Core SentinelX engines
from app.event_pipeline.bus import global_event_bus
from app.behaviour_intelligence.manager import BehaviourIntelligenceManager
from app.behaviour_intelligence.baseline.learner import BaselineLearner
from app.trust_engine.manager import TrustEngineManager
from app.risk_engine import RiskEngineManager
from app.decision_trace import DecisionTraceManager
from app.pdp import PDPManager
from app.orchestration import ResponseOrchestrationManager
from app.audit_chain import AuditChainManager
from app.simulation.scenarios.workflows import SCENARIOS_REGISTRY
from app.behaviour_intelligence.profiles.models import BehaviourProfile
from app.trust_engine.metrics.models import TrustState
from app.risk_engine.scoring.models import RiskState

app = FastAPI(title="SentinelX Security Decision Intelligence Platform API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)

# Initialize database schema tables on server launch
init_db()

# Core Business Engine instantiations
behaviour_manager = BehaviourIntelligenceManager()
trust_manager = TrustEngineManager()
risk_manager = RiskEngineManager()

@app.post("/api/auth/login")
def login(payload: dict):
    """
    Mock enterprise login returning signed JWT access token for security personnel.
    """
    username = payload.get("username", "analyst")
    role = "Viewer"
    
    if username in ["amit.verma", "amit"]:
        role = "Privileged DBA"
    elif username in ["soc.analyst", "analyst"]:
        role = "SOC Analyst"
    elif username in ["soc.manager", "manager"]:
        role = "SOC Manager"
    elif username in ["admin", "secops"]:
        role = "Security Admin"
        
    token = create_access_token({"sub": username, "role": role})
    return {"token": token, "username": username, "role": role}

@app.get("/api/health")
def health_check():
    return {"status": "OPERATIONAL", "service": "SentinelX Backend Integration Node"}

@app.get("/api/simulation/status")
def get_simulation_status(db: Session = Depends(get_db)):
    sim_repo = SQLAlchemySimulationStateRepository(db)
    return sim_repo.get_status()

@app.post("/api/simulation/load")
def load_scenario(
    scenario_id: str = Query(..., description="ID of target scenario to load"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleGuard(["SOC Analyst", "SOC Manager", "Security Admin"]))
):
    if scenario_id not in SCENARIOS_REGISTRY:
        raise HTTPException(status_code=404, detail="Scenario ID not recognized in registry.")
    
    # 1. Clear database caches on reload to guarantee scenario determinism
    sim_repo = SQLAlchemySimulationStateRepository(db)
    session_repo = SQLAlchemySessionRepository(db)
    alert_repo = SQLAlchemyAlertRepository(db)
    approval_repo = SQLAlchemyApprovalRepository(db)
    audit_repo = SQLAlchemyAuditRepository(db)
    exec_repo = SQLAlchemyExecutionHistoryRepository(db)
    behaviour_repo = SQLAlchemyBehaviourProfileRepository(db)
    trust_repo = SQLAlchemyTrustStateRepository(db)
    risk_repo = SQLAlchemyRiskStateRepository(db)
    
    session_repo.clear_sessions()
    alert_repo.clear_alerts()
    approval_repo.clear_approvals()
    audit_repo.clear_ledger()
    exec_repo.clear_history()
    
    # 2. Reset simulator status variables
    sim_repo.update_status({
        "activeScenarioId": scenario_id,
        "currentStepIndex": 0,
        "isRunning": False,
        "progress": 0
    })
    
    # 3. Seed DBA baseline profile
    profile = BehaviourProfile(
        username="Amit Verma",
        normal_login_hours=[9, 18],
        normal_device_ips=["10.15.2.14"],
        normal_devices=["BOM-DBA-087"],
        allowed_locations=["PUNE_HQ_F4"],
        normal_command_types=[
            "session-initialize", "session-terminate",
            "db-query-select", "db-maintenance-command",
            "system-service-connect", "integrity-check-run",
            "report-export-pdf"
        ],
        history_weights_count=5
    )
    behaviour_repo.save_profile(profile)

    # 4. Seed trust state
    trust_state = TrustState(
        username="Amit Verma",
        current_trust=90.0,
        previous_trust=90.0,
        trust_level="High"
    )
    trust_repo.save_state(trust_state)

    # 5. Clear intermediate bus state
    global_event_bus._subscribers.clear()

    return {"status": "LOADED", "scenario_id": scenario_id, "steps_count": len(SCENARIOS_REGISTRY[scenario_id])}

@app.post("/api/simulation/step")
def step_simulation(
    approval_status: str = "Pending",
    reviewer: str = "None",
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleGuard(["SOC Analyst", "SOC Manager", "Security Admin"]))
):
    sim_repo = SQLAlchemySimulationStateRepository(db)
    session_repo = SQLAlchemySessionRepository(db)
    alert_repo = SQLAlchemyAlertRepository(db)
    approval_repo = SQLAlchemyApprovalRepository(db)
    audit_repo = SQLAlchemyAuditRepository(db)
    exec_repo = SQLAlchemyExecutionHistoryRepository(db)
    behaviour_repo = SQLAlchemyBehaviourProfileRepository(db)
    trust_repo = SQLAlchemyTrustStateRepository(db)
    risk_repo = SQLAlchemyRiskStateRepository(db)

    status_data = sim_repo.get_status()
    scenario_id = status_data["activeScenarioId"]
    if not scenario_id:
        raise HTTPException(status_code=400, detail="No active scenario loaded.")

    steps = SCENARIOS_REGISTRY[scenario_id]
    current_idx = status_data["currentStepIndex"]

    if current_idx >= len(steps):
        sim_repo.update_status({"isRunning": False})
        return {"status": "FINISHED", "message": "All scenario steps ingested."}

    event = steps[current_idx]
    username = event.get("user", "System")
    session_id = event.get("session_id", "SES-GENERIC")

    # Ingest event to global bus
    global_event_bus.publish(event)

    # 1. Behavior checks
    profile = behaviour_repo.get_profile(username)
    if not profile:
        profile = BehaviourProfile(username=username)
        behaviour_repo.save_profile(profile)

    behaviour_eval = behaviour_manager.evaluate_incoming_event(event)

    # 2. Poisoning protection parameters check
    alerts = alert_repo.get_all_alerts()
    has_open_incident = any(a["status"] == "open" and a["severity"] in ["high", "critical"] for a in alerts)
    
    # Get previous risk score to inspect thresholds
    prev_risk_state = risk_repo.get_state(session_id)
    prev_risk_score = prev_risk_state.current_risk_score if prev_risk_state else 10.0
    
    is_session_suspicious = prev_risk_score >= 50.0
    is_investigation_pending = any(a["status"] == "Pending" for a in approval_repo.get_all_approvals())

    # Evolve profile baseline only if protected checks pass
    features = behaviour_manager._feature_extractor.extract_features(event)
    BaselineLearner.update_profile_baseline(
        profile=profile,
        features=features,
        current_risk_score=prev_risk_score,
        has_open_incident=has_open_incident,
        is_session_suspicious=is_session_suspicious,
        is_investigation_pending=is_investigation_pending
    )
    behaviour_repo.save_profile(profile)

    # 3. Trust checks
    trust_state = trust_repo.get_state(username)
    if not trust_state:
        trust_state = TrustState(username=username)
    
    # Evaluate score changes
    trust_eval = trust_manager.evaluate_session_trust(username, behaviour_eval)
    trust_state.current_trust = trust_eval.get("current_trust_score", 90.0)
    trust_state.trust_level = trust_eval.get("trust_level", "High")
    trust_state.reasons_history = trust_eval.get("trust_history", [])
    trust_repo.save_state(trust_state)

    # 4. Risk scoring
    risk_state = risk_repo.get_state(session_id)
    if not risk_state:
        risk_state = RiskState(session_id=session_id, username=username)

    policy_profile = "Normal Banking Operations"
    if session_id == "SES-99912":
        policy_profile = "Production Database"
    elif event.get("role") == "Manager":
        policy_profile = "Privileged Administration"

    risk_eval = risk_manager.evaluate_session_risk(
        session_id=session_id,
        event=event,
        behaviour_summary=behaviour_eval,
        trust_summary=trust_eval,
        historical_profile=profile
    )
    risk_state.current_risk_score = risk_eval.current_risk_score
    risk_state.risk_level = risk_eval.risk_level
    risk_state.reasons_history = [r for r in risk_eval.reasons]
    risk_repo.save_state(risk_state)

    # 5. Explanations trace compiling
    session_history = global_event_bus.get_session_history(session_id)
    trace = DecisionTraceManager.build_trace(
        session_id=session_id,
        username=username,
        events=session_history,
        behaviour_summary=behaviour_eval,
        trust_summary=trust_eval,
        risk_evaluation=risk_eval,
        historical_profile=profile
    )

    # 6. PDP evaluations
    pdp_decision = PDPManager.evaluate_policy(
        event=event,
        behaviour_summary=behaviour_eval,
        trust_summary=trust_eval,
        risk_evaluation=risk_eval,
        policy_profile_name=policy_profile
    )

    # 7. SOAR playbooks
    orchestrator_result = ResponseOrchestrationManager.execute_orchestration(
        pdp_decision=pdp_decision,
        approval_status=approval_status,
        reviewer=reviewer,
        event=event,
        risk_score=risk_eval.current_risk_score
    )
    exec_repo.save_execution(orchestrator_result.model_dump())

    # 8. Cryptographic quantum-audit chain commit
    audit_record = AuditChainManager.commit_to_audit_chain(
        event=event,
        trust_score=trust_state.current_trust,
        risk_score=risk_state.current_risk_score,
        decision=pdp_decision.decision,
        reviewer=reviewer,
        response_executed=", ".join(orchestrator_result.completed_actions),
        evidence=pdp_decision.supporting_evidence
    )
    audit_repo.append_record(audit_record)

    # Check alert feed additions
    if risk_state.risk_level in ["Medium", "High", "Critical"]:
        alert_exists = any(a["id"] == f"ALT-{event['event_id']}" for a in alert_repo.get_all_alerts())
        if not alert_exists:
            alert_repo.add_alert({
                "id": f"ALT-{event['event_id']}",
                "title": f"Anomalous {event['event_type'].replace('_', ' ').title()}",
                "source": event.get("source", "System Core"),
                "severity": event.get("severity", "medium"),
                "status": "open",
                "user": username,
                "ip": event.get("payload", {}).get("ip_address", "10.15.2.14"),
                "score": int(risk_state.current_risk_score),
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "description": pdp_decision.reason
            })

    # Sessions management
    session_exists = any(s["sessionId"] == session_id for s in session_repo.get_all_sessions())
    if event.get("event_type") == "SESSION_INITIALIZE" and not session_exists:
        session_repo.add_session({
            "sessionId": session_id,
            "username": username,
            "role": event.get("role", "Employee"),
            "action": event.get("event_type"),
            "device": event.get("payload", {}).get("terminal_id", "BOM-DBA-087"),
            "location": event.get("payload", {}).get("location", "PUNE_HQ_F4"),
            "duration": "1m",
            "database": event.get("resource", "bom_ledger.customer_accounts")
        })
    elif event.get("event_type") == "SESSION_TERMINATE":
        session_repo.remove_session(session_id)

    # Manager dual approvals trigger
    if pdp_decision.decision == "Require Manager Approval" and approval_status == "Pending":
        app_exists = any(a["id"] == f"APP-{event['event_id']}" for a in approval_repo.get_all_approvals())
        if not app_exists:
            approval_repo.add_approval({
                "id": f"APP-{event['event_id']}",
                "sessionId": session_id,
                "user": username,
                "action": event.get("event_type"),
                "sensitivity": "High" if session_id == "SES-99912" else "Medium",
                "status": "Pending",
                "reviewer": pdp_decision.required_reviewer,
                "time": datetime.datetime.now().strftime("%H:%M:%S"),
                "reason": pdp_decision.reason
            })

    # Progress simulator status index
    next_idx = current_idx + 1
    progress = int((next_idx / len(steps)) * 100)
    sim_repo.update_status({
        "currentStepIndex": next_idx,
        "progress": progress
    })

    return {
        "status": "STEPPED",
        "current_step": next_idx,
        "progress": progress,
        "event": event,
        "trust_score": trust_state.current_trust,
        "risk_score": risk_state.current_risk_score,
        "risk_level": risk_state.risk_level,
        "pdp_decision": pdp_decision.model_dump(),
        "orchestration": orchestrator_result.model_dump(),
        "audit_record": audit_record.model_dump()
    }

@app.post("/api/simulation/start")
def start_simulation(
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleGuard(["SOC Analyst", "SOC Manager", "Security Admin"]))
):
    sim_repo = SQLAlchemySimulationStateRepository(db)
    sim_repo.update_status({"isRunning": True})
    return {"status": "RUNNING"}

@app.post("/api/simulation/pause")
def pause_simulation(
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleGuard(["SOC Analyst", "SOC Manager", "Security Admin"]))
):
    sim_repo = SQLAlchemySimulationStateRepository(db)
    sim_repo.update_status({"isRunning": False})
    return {"status": "PAUSED"}

@app.post("/api/simulation/reset")
def reset_simulation(
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleGuard(["SOC Analyst", "SOC Manager", "Security Admin"]))
):
    sim_repo = SQLAlchemySimulationStateRepository(db)
    sim_repo.reset_status()
    
    # Wipe database state values
    SQLAlchemySessionRepository(db).clear_sessions()
    SQLAlchemyAlertRepository(db).clear_alerts()
    SQLAlchemyApprovalRepository(db).clear_approvals()
    SQLAlchemyAuditRepository(db).clear_ledger()
    SQLAlchemyExecutionHistoryRepository(db).clear_history()

    return {"status": "RESET"}

@app.post("/api/simulation/speed")
def change_simulation_speed(
    speed: int = Query(..., description="Simulation multiplier speed values"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleGuard(["SOC Analyst", "SOC Manager", "Security Admin"]))
):
    sim_repo = SQLAlchemySimulationStateRepository(db)
    sim_repo.update_status({"speed": speed})
    return {"status": "SPEED_UPDATED", "speed": speed}

@app.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return SQLAlchemyAlertRepository(db).get_all_alerts()

@app.post("/api/alerts/{alert_id}/status")
def update_alert_feed_status(
    alert_id: str,
    status: str = Query(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleGuard(["SOC Analyst", "SOC Manager", "Security Admin"]))
):
    alert_repo = SQLAlchemyAlertRepository(db)
    res = alert_repo.update_alert_status(alert_id, status)
    if not res:
        raise HTTPException(status_code=404, detail="Alert ID not found in database feed.")
    return {"status": "UPDATED", "alert": res}

@app.post("/api/alerts/{alert_id}/feedback")
def log_analyst_feedback(
    alert_id: str,
    feedback: str = Query(..., description="False Positive, True Positive, Needs Monitoring, Expected Behaviour"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleGuard(["SOC Analyst", "SOC Manager", "Security Admin"]))
):
    """
    Log SOC analyst classification feedback for subsequent audit reviews.
    """
    if feedback not in ["False Positive", "True Positive", "Needs Monitoring", "Expected Behaviour"]:
        raise HTTPException(status_code=400, detail="Invalid analyst feedback classification.")
        
    alert_repo = SQLAlchemyAlertRepository(db)
    res = alert_repo.add_feedback(alert_id, feedback)
    if not res:
        raise HTTPException(status_code=404, detail="Alert ID not found in database feed.")
    return {"status": "FEEDBACK_LOGGED", "alert": res}

@app.get("/api/sessions")
def get_sessions(db: Session = Depends(get_db)):
    return SQLAlchemySessionRepository(db).get_all_sessions()

@app.post("/api/sessions/{session_id}/terminate")
def terminate_live_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleGuard(["SOC Analyst", "SOC Manager", "Security Admin"]))
):
    session_repo = SQLAlchemySessionRepository(db)
    session_repo.remove_session(session_id)
    return {"status": "TERMINATED", "session_id": session_id}

@app.post("/api/sessions/{session_id}/challenge")
def challenge_live_session_mfa(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleGuard(["SOC Analyst", "SOC Manager", "Security Admin"]))
):
    return {"status": "CHALLENGED", "session_id": session_id}

@app.get("/api/approvals")
def get_approvals(db: Session = Depends(get_db)):
    return SQLAlchemyApprovalRepository(db).get_all_approvals()

@app.post("/api/approvals/{app_id}/action")
def execute_approval_override(
    app_id: str,
    action: str = Query(..., description="Action value (Approved or Rejected)"),
    reviewer: str = "Manager",
    db: Session = Depends(get_db),
    current_user: dict = Depends(RoleGuard(["SOC Manager", "Security Admin"]))
):
    approval_repo = SQLAlchemyApprovalRepository(db)
    res = approval_repo.update_approval(app_id, action, reviewer)
    if not res:
        raise HTTPException(status_code=404, detail="Approval ID not found in database queue.")
    return {"status": "PROCESSED", "approval": res}

@app.get("/api/audit")
def get_audit_chain(db: Session = Depends(get_db)):
    audit_repo = SQLAlchemyAuditRepository(db)
    records = audit_repo.get_all_records()
    return [r.model_dump() for r in records]

@app.get("/api/verification")
def get_audit_verification_status(db: Session = Depends(get_db)):
    audit_repo = SQLAlchemyAuditRepository(db)
    # Patch ledger store with SQLAlchemy state for verifier logic compliance
    from app.audit_chain.history.store import AuditLedgerStore
    AuditLedgerStore.clear_ledger()
    for rec in audit_repo.get_all_records():
        AuditLedgerStore.append_record(rec)
        
    verification = AuditChainManager.run_chain_verification()
    return verification.model_dump()
