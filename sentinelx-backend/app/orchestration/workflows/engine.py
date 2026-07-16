import time
from typing import Dict, Any, List
from app.orchestration.models import OrchestrationWorkflow, OrchestrationResult
from app.orchestration.executors.actions import ResponseActionExecutor

class OrchestrationWorkflowEngine:
    @staticmethod
    def execute_playbook(
        playbook: OrchestrationWorkflow,
        approval_status: str,
        reviewer: str,
        context: Dict[str, Any]
    ) -> OrchestrationResult:
        """
        Executes playbook actions sequentially. Stops or suspends actions
        if manager approval holds are triggered and approval_status is pending.
        """
        completed = []
        pending = []
        timeline = []
        status = "Completed"

        # Log start
        timeline.append(f"Ingested trigger: Executing Playbook '{playbook.name}' [{playbook.id}]")

        is_suspended = False

        for action in playbook.actions:
            if is_suspended:
                pending.append(action)
                continue

            if action == "Require Manager Approval":
                if approval_status == "Approved":
                    timeline.append(f"Manager approval signature confirmed by reviewer '{reviewer}'. Proceeding.")
                    log = ResponseActionExecutor.execute(action, context)
                    completed.append(action)
                    timeline.append(f"Executed: {log}")
                elif approval_status == "Rejected":
                    timeline.append("Manager rejected approval request. Halting playbook actions.")
                    status = "Suspended"
                    is_suspended = True
                    pending.append(action)
                else:
                    timeline.append("Pre-requisite Manager Approval signature is missing. Playbook execution suspended.")
                    status = "Suspended"
                    is_suspended = True
                    pending.append(action)
            else:
                log = ResponseActionExecutor.execute(action, context)
                completed.append(action)
                timeline.append(f"Executed: {log}")

        summary = f"Playbook '{playbook.name}' execution status: {status}. "
        if is_suspended:
            summary += f"{len(pending)} actions held pending review."
        else:
            summary += "All actions completed successfully."

        return OrchestrationResult(
            execution_status=status,
            completed_actions=completed,
            pending_actions=pending,
            execution_timeline=timeline,
            execution_summary=summary
        )
