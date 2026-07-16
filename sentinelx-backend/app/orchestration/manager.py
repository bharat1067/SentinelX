import datetime
import uuid
from typing import Dict, Any, List, Optional
from app.orchestration.models import OrchestrationResult, ExecutionRecord
from app.orchestration.playbooks.catalog import PlaybookMatcher, PLAYBOOKS_REGISTRY
from app.orchestration.workflows.engine import OrchestrationWorkflowEngine
from app.orchestration.rollback.manager import OrchestrationRollbackManager
from app.orchestration.history.store import ExecutionHistoryStore

class ResponseOrchestrationManager:
    @staticmethod
    def execute_orchestration(
        pdp_decision: Any,
        approval_status: str,
        reviewer: str,
        event: Dict[str, Any],
        risk_score: float
    ) -> OrchestrationResult:
        """
        Coordinates matching and executing the security orchestration playbook workflow.
        Returns the finalized OrchestrationResult output model.
        """
        # 1. Match active playbook
        playbook = PlaybookMatcher.match_playbook(event, risk_score)

        # 2. Build runtime context
        context = {
            "username": event.get("username", "System"),
            "session_id": event.get("session_id", "SES-GENERIC"),
            "action": event.get("action", "unknown-action"),
            "resource": event.get("resource", "none"),
            "database": event.get("resource", "none")
        }

        # 3. Execute workflow playbook steps
        result = OrchestrationWorkflowEngine.execute_playbook(
            playbook=playbook,
            approval_status=approval_status,
            reviewer=reviewer,
            context=context
        )

        # 4. Log Execution Record
        execution_id = f"EXEC-{uuid.uuid4().hex[:8].upper()}"
        record = ExecutionRecord(
            execution_id=execution_id,
            timestamp=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            decision=getattr(pdp_decision, "decision", str(pdp_decision)),
            reviewer=reviewer,
            actions_executed=result.completed_actions,
            result=result.execution_status
        )
        ExecutionHistoryStore.save_record(record)

        # Add execution ID to timeline log for trace tracking
        result.execution_timeline.insert(1, f"Registered Execution Tracker ID: {execution_id}")

        return result

    @staticmethod
    def rollback_orchestration(execution_id: str) -> Optional[OrchestrationResult]:
        """
        Retrieves a historical execution record, performs rollback steps,
        and saves the updated status.
        """
        record = ExecutionHistoryStore.get_record(execution_id)
        if not record:
            return None

        # Determine playbook mapping (fallback to Database Export Abuse)
        playbook_name = "Database Export Abuse"
        for name, play in PLAYBOOKS_REGISTRY.items():
            if play.trigger in record.actions_executed or any(act in play.actions for act in record.actions_executed):
                playbook_name = name
                break

        # Run rollback
        rollback_logs = OrchestrationRollbackManager.execute_rollback(
            playbook_name=playbook_name,
            actions_to_undo=record.actions_executed
        )

        # Update record
        record.rolled_back = True
        record.result = "Rolled Back"
        ExecutionHistoryStore.save_record(record)

        return OrchestrationResult(
            execution_status="Rolled Back",
            completed_actions=[],
            pending_actions=[],
            execution_timeline=rollback_logs,
            execution_summary=f"Rollback execution successfully completed for incident {execution_id}."
        )
