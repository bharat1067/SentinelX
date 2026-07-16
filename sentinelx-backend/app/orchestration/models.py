from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class OrchestrationWorkflow(BaseModel):
    id: str = Field(..., description="Unique workflow ID")
    name: str = Field(..., description="Name of the orchestration workflow")
    trigger: str = Field(..., description="Action trigger name or PDP decision")
    conditions: Dict[str, Any] = Field(default_factory=dict, description="Pre-conditions dictionary mapping")
    required_approvals: List[str] = Field(default_factory=list, description="List of approval stages required")
    actions: List[str] = Field(default_factory=list, description="Sequence of playbook response actions to execute")
    status: str = Field("Pending", description="Workflow execution status (Pending, In Progress, Completed, Failed)")

class OrchestrationResult(BaseModel):
    execution_status: str = Field(..., description="Outcome status (Completed, Suspended, Rolled Back)")
    completed_actions: List[str] = Field(default_factory=list, description="List of successfully completed actions")
    pending_actions: List[str] = Field(default_factory=list, description="List of pending actions held for review")
    execution_timeline: List[str] = Field(default_factory=list, description="Chronological log entries of execution")
    execution_summary: str = Field(..., description="Human-readable execution description")

class ExecutionRecord(BaseModel):
    execution_id: str = Field(..., description="Unique execution record ID")
    timestamp: str = Field(..., description="Timestamp of execution")
    decision: str = Field(..., description="PDP Decision code being handled")
    reviewer: str = Field("None", description="Approving reviewer identity")
    actions_executed: List[str] = Field(default_factory=list, description="Successful actions logged")
    result: str = Field(..., description="Execution status")
    rolled_back: bool = Field(False, description="Whether this execution has been rolled back")
