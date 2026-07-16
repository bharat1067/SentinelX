from typing import List, Optional
from app.audit_chain.models import AuditRecord

class AuditLedgerStore:
    _ledger: List[AuditRecord] = []

    @classmethod
    def append_record(cls, record: AuditRecord) -> None:
        cls._ledger.append(record)

    @classmethod
    def get_record(cls, index: int) -> Optional[AuditRecord]:
        if 0 <= index < len(cls._ledger):
            return cls._ledger[index]
        return None

    @classmethod
    def get_all_records(cls) -> List[AuditRecord]:
        return list(cls._ledger)

    @classmethod
    def get_latest_record(cls) -> Optional[AuditRecord]:
        if cls._ledger:
            return cls._ledger[-1]
        return None

    @classmethod
    def clear_ledger(cls) -> None:
        cls._ledger.clear()
