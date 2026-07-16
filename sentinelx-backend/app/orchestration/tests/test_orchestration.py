import pytest
from app.orchestration.manager import ResponseOrchestrationManager
from app.orchestration.playbooks.catalog import PlaybookMatcher, PLAYBOOKS_REGISTRY
from app.orchestration.executors.actions import ResponseActionExecutor
from app.orchestration.workflows.engine import OrchestrationWorkflowEngine
from app.orchestration.history.store import ExecutionHistoryStore
from app.orchestration.rollback.manager import OrchestrationRollbackManager

def test_playbook_matching():
    # db-query-mass-select matches Database Export Abuse
    playbook = PlaybookMatcher.match_playbook({"action": "db-query-mass-select"}, 10.0)
    assert playbook.name == "Database Export Abuse"

    # db-privilege-bypass matches Privilege Escalation
    playbook = PlaybookMatcher.match_playbook({"action": "db-privilege-bypass"}, 10.0)
    assert playbook.name == "Privilege Escalation"

    # audit-deactivate-attempt matches Audit Log Tampering
    playbook = PlaybookMatcher.match_playbook({"action": "audit-deactivate-attempt"}, 10.0)
    assert playbook.name == "Audit Log Tampering"

    # Late Login anomaly matches Late Night Activity
    playbook = PlaybookMatcher.match_playbook({"action": "view-dashboard", "anomalies": ["Late Login"]}, 10.0)
    assert playbook.name == "Late Night Activity"

def test_action_executor_handlers():
    context = {"username": "Amit Verma", "session_id": "SES-99912", "action": "rotate-keys"}
    
    log = ResponseActionExecutor.execute("Request MFA", context)
    assert "MFA" in log

    log = ResponseActionExecutor.execute("Rotate Credentials", context)
    assert "Rotate Credentials" in log or "key rotation" in log.lower()

    log = ResponseActionExecutor.execute("Terminate Current Session", context)
    assert "Terminated active connection" in log

def test_playbook_workflow_engine_suspension():
    playbook = PLAYBOOKS_REGISTRY["Database Export Abuse"]
    context = {"username": "Amit Verma", "session_id": "SES-99912", "action": "db-query-mass-select"}

    # Case 1: Approval status is Pending -> Playbook should suspend at Require Manager Approval step
    result = OrchestrationWorkflowEngine.execute_playbook(
        playbook=playbook,
        approval_status="Pending",
        reviewer="None",
        context=context
    )
    assert result.execution_status == "Suspended"
    assert "Require Manager Approval" in result.pending_actions
    assert "Pause Sensitive Operation" in result.completed_actions
    assert len(result.pending_actions) == 3  # Approval, Investigate Package, Terminate

    # Case 2: Approval status is Approved -> Playbook runs all steps successfully
    result = OrchestrationWorkflowEngine.execute_playbook(
        playbook=playbook,
        approval_status="Approved",
        reviewer="IT Manager",
        context=context
    )
    assert result.execution_status == "Completed"
    assert len(result.pending_actions) == 0
    assert len(result.completed_actions) == 5

def test_rollback_undo_sequence():
    actions = ["Pause Sensitive Operation", "Rotate Credentials", "Terminate Current Session"]
    logs = OrchestrationRollbackManager.execute_rollback("Credential Abuse", actions)
    
    # Timeline should reverse undo actions (Terminate first, then Credentials, then Pause)
    assert any("RESTORED" in log for log in logs)
    assert any("vault backup" in log for log in logs)
    assert any("Resumed" in log or "Cleared" in log for log in logs)

def test_orchestration_manager_lifecycle():
    event = {
        "username": "Amit Verma",
        "session_id": "SES-99912",
        "action": "db-query-mass-select",
        "resource": "bom_ledger.customer_accounts"
    }
    
    # Run Orchestration
    result = ResponseOrchestrationManager.execute_orchestration(
        pdp_decision="Require Manager Approval",
        approval_status="Pending",
        reviewer="None",
        event=event,
        risk_score=68.0
    )
    
    assert result.execution_status == "Suspended"
    assert len(ExecutionHistoryStore.get_all_records()) > 0
    
    record = ExecutionHistoryStore.get_all_records()[0]
    exec_id = record.execution_id
    
    # Run Rollback
    rollback_result = ResponseOrchestrationManager.rollback_orchestration(exec_id)
    assert rollback_result is not None
    assert rollback_result.execution_status == "Rolled Back"
    
    updated_rec = ExecutionHistoryStore.get_record(exec_id)
    assert updated_rec.rolled_back is True
    assert updated_rec.result == "Rolled Back"
