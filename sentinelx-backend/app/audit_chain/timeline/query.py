from typing import List, Optional
from app.audit_chain.models import AuditRecord
from app.audit_chain.history.store import AuditLedgerStore

class AuditTimelineQuery:
    @staticmethod
    def search(query: str) -> List[AuditRecord]:
        """
        Searches record attributes matching a keyword.
        """
        records = AuditLedgerStore.get_all_records()
        q = query.lower()
        results = []

        for rec in records:
            if (q in rec.user.lower() or
                q in rec.session_id.lower() or
                q in rec.event_id.lower() or
                q in rec.decision.lower() or
                any(q in e.lower() for e in rec.evidence)):
                results.append(rec)

        return results

    @staticmethod
    def filter(
        user: Optional[str] = None,
        session_id: Optional[str] = None,
        decision: Optional[str] = None
    ) -> List[AuditRecord]:
        """
        Filters ledger records by exact matching attributes.
        """
        records = AuditLedgerStore.get_all_records()
        results = []

        for rec in records:
            if user and rec.user != user:
                continue
            if session_id and rec.session_id != session_id:
                continue
            if decision and rec.decision != decision:
                continue
            results.append(rec)

        return results
