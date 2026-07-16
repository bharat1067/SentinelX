import uuid
from typing import Dict, Any, List
from app.audit_chain.models import ForensicPackage
from app.audit_chain.history.store import AuditLedgerStore

class ForensicPackageBuilder:
    @staticmethod
    def compile_package(
        session_id: str,
        incident_summary: str,
        decision_trace: str,
        risk_timeline: List[str],
        trust_timeline: List[str],
        execution_timeline: List[str]
    ) -> ForensicPackage:
        """
        Compiles and aggregates timelines alongside matching cryptographic ledger audit slices
        to construct a digital evidence forensic archive.
        """
        all_records = AuditLedgerStore.get_all_records()
        slice_records = [rec for rec in all_records if rec.session_id == session_id]

        package_id = f"FOR-{uuid.uuid4().hex[:8].upper()}"

        return ForensicPackage(
            package_id=package_id,
            incident_summary=incident_summary,
            decision_trace=decision_trace,
            risk_timeline=risk_timeline,
            trust_timeline=trust_timeline,
            execution_timeline=execution_timeline,
            audit_chain_slice=slice_records
        )
