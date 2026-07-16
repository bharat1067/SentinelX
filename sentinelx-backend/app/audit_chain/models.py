from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class AuditRecord(BaseModel):
    index: int = Field(..., description="Chronological sequential block index")
    timestamp: str = Field(..., description="Timestamp when signed into ledger")
    user: str = Field(..., description="Subject operator user ID")
    session_id: str = Field(..., description="Active session ID")
    event_id: str = Field(..., description="Trigger security event ID")
    trust_score: float = Field(..., description="Current evaluated trust score index")
    risk_score: float = Field(..., description="Current evaluated unified risk score index")
    decision: str = Field(..., description="PDP outcome decision (Allow, Reject, etc.)")
    reviewer: str = Field(..., description="Identity of reviewing authority")
    response_executed: str = Field(..., description="Playbook response actions executed")
    evidence: List[str] = Field(default_factory=list, description="Anomalous triggers and indicators list")
    previous_hash: str = Field(..., description="SHA-256 cryptographic hash of the parent block")
    current_hash: str = Field(..., description="SHA-256 cryptographic hash of this block's payload")
    quantum_signature: str = Field(..., description="Post-quantum digital signature string")
    algorithm_marker: str = Field("ML-DSA-87", description="Crypto-agile signature algorithm identifier")

class VerificationReport(BaseModel):
    chain_valid: bool = Field(..., description="Integrity check validation status")
    missing_indices: List[int] = Field(default_factory=list, description="Indices of missing or skipped blocks")
    modified_indices: List[int] = Field(default_factory=list, description="Indices of tampered blocks (hash mismatch)")
    invalid_signatures: List[int] = Field(default_factory=list, description="Indices of corrupted signatures")
    summary: str = Field(..., description="Integrity audit verification summary")

class ForensicPackage(BaseModel):
    package_id: str = Field(..., description="Unique investigation evidence package ID")
    incident_summary: str = Field(..., description="Text summary of security incident")
    decision_trace: str = Field(..., description="Chronological decision trace steps")
    risk_timeline: List[str] = Field(default_factory=list, description="Risk levels shifts log timeline")
    trust_timeline: List[str] = Field(default_factory=list, description="Trust levels shifts log timeline")
    execution_timeline: List[str] = Field(default_factory=list, description="Orchestration playbook execution timeline")
    audit_chain_slice: List[AuditRecord] = Field(default_factory=list, description="Associated cryptographic ledger records")
