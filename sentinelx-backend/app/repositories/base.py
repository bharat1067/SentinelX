from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.audit_chain.models import AuditRecord
from app.behaviour_intelligence.profiles.models import BehaviourProfile
from app.trust_engine.metrics.models import TrustState
from app.risk_engine.scoring.models import RiskState

class AbstractAuditRepository(ABC):
    @abstractmethod
    def append_record(self, record: AuditRecord) -> None:
        pass

    @abstractmethod
    def get_record(self, index: int) -> Optional[AuditRecord]:
        pass

    @abstractmethod
    def get_all_records(self) -> List[AuditRecord]:
        pass

    @abstractmethod
    def get_latest_record(self) -> Optional[AuditRecord]:
        pass

    @abstractmethod
    def clear_ledger(self) -> None:
        pass

class AbstractBehaviourProfileRepository(ABC):
    @abstractmethod
    def get_profile(self, username: str) -> Optional[BehaviourProfile]:
        pass

    @abstractmethod
    def save_profile(self, profile: BehaviourProfile) -> None:
        pass

    @abstractmethod
    def delete_profile(self, username: str) -> None:
        pass

class AbstractTrustStateRepository(ABC):
    @abstractmethod
    def get_state(self, username: str) -> Optional[TrustState]:
        pass

    @abstractmethod
    def save_state(self, state: TrustState) -> None:
        pass

    @abstractmethod
    def delete_state(self, username: str) -> None:
        pass

class AbstractRiskStateRepository(ABC):
    @abstractmethod
    def get_state(self, session_id: str) -> Optional[RiskState]:
        pass

    @abstractmethod
    def save_state(self, state: RiskState) -> None:
        pass

    @abstractmethod
    def delete_state(self, session_id: str) -> None:
        pass

class AbstractSessionRepository(ABC):
    @abstractmethod
    def get_all_sessions(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def add_session(self, session: Dict[str, Any]) -> None:
        pass

    @abstractmethod
    def remove_session(self, session_id: str) -> None:
        pass

    @abstractmethod
    def clear_sessions(self) -> None:
        pass

class AbstractAlertRepository(ABC):
    @abstractmethod
    def get_all_alerts(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def add_alert(self, alert: Dict[str, Any]) -> None:
        pass

    @abstractmethod
    def update_alert_status(self, alert_id: str, status: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def add_feedback(self, alert_id: str, feedback: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def clear_alerts(self) -> None:
        pass

class AbstractApprovalRepository(ABC):
    @abstractmethod
    def get_all_approvals(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def add_approval(self, approval: Dict[str, Any]) -> None:
        pass

    @abstractmethod
    def update_approval(self, approval_id: str, status: str, reviewer: str, comment: Optional[str] = None) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def clear_approvals(self) -> None:
        pass

class AbstractExecutionHistoryRepository(ABC):
    @abstractmethod
    def save_execution(self, execution: Dict[str, Any]) -> None:
        pass

    @abstractmethod
    def get_execution(self, execution_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_all_executions(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def clear_history(self) -> None:
        pass

class AbstractSimulationStateRepository(ABC):
    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    def update_status(self, updates: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def reset_status(self) -> Dict[str, Any]:
        pass
