import datetime
from typing import Dict, Any, List, Optional
from app.orchestration.models import ExecutionRecord

class ExecutionHistoryStore:
    _history: Dict[str, ExecutionRecord] = {}

    @classmethod
    def save_record(cls, record: ExecutionRecord) -> None:
        cls._history[record.execution_id] = record

    @classmethod
    def get_record(cls, execution_id: str) -> Optional[ExecutionRecord]:
        return cls._history.get(execution_id)

    @classmethod
    def get_all_records(cls) -> List[ExecutionRecord]:
        return list(cls._history.values())

    @classmethod
    def clear_store(cls) -> None:
        cls._history.clear()
