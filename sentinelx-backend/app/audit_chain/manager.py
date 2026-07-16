from typing import Dict, Any, List
from app.audit_chain.models import AuditRecord, VerificationReport, ForensicPackage
from app.audit_chain.chain.builder import AuditChainBuilder
from app.audit_chain.verification.auditor import AuditChainVerifier
from app.audit_chain.forensics.package_builder import ForensicPackageBuilder
from app.audit_chain.history.store import AuditLedgerStore

class AuditChainManager:
    @staticmethod
    def commit_to_audit_chain(
        event: Dict[str, Any],
        trust_score: float,
        risk_score: float,
        decision: str,
        reviewer: str,
        response_executed: str,
        evidence: List[str],
        algorithm: str = "ML-DSA-87"
    ) -> AuditRecord:
        """
        Commits a new signed block record to the ledger chain database.
        Returns the finalized AuditRecord object.
        """
        record = AuditChainBuilder.build_next_record(
            event=event,
            trust_score=trust_score,
            risk_score=risk_score,
            decision=decision,
            reviewer=reviewer,
            response_executed=response_executed,
            evidence=evidence,
            algorithm=algorithm
        )
        AuditLedgerStore.append_record(record)
        return record

    @staticmethod
    def run_chain_verification() -> VerificationReport:
        """
        Verifies all blockchain hashes and quantum digital signatures.
        """
        return AuditChainVerifier.verify_ledger()

    @staticmethod
    def compile_forensic_package(
        session_id: str,
        incident_summary: str,
        decision_trace: str,
        risk_timeline: List[str],
        trust_timeline: List[str],
        execution_timeline: List[str]
    ) -> ForensicPackage:
        """
        Compiles timelines and audit slices into a signed forensic evidence package.
        """
        return ForensicPackageBuilder.compile_package(
            session_id=session_id,
            incident_summary=incident_summary,
            decision_trace=decision_trace,
            risk_timeline=risk_timeline,
            trust_timeline=trust_timeline,
            execution_timeline=execution_timeline
        )
