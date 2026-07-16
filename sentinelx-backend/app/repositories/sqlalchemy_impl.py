import json
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.repositories.base import (
    AbstractAuditRepository,
    AbstractBehaviourProfileRepository,
    AbstractTrustStateRepository,
    AbstractRiskStateRepository,
    AbstractSessionRepository,
    AbstractAlertRepository,
    AbstractApprovalRepository,
    AbstractExecutionHistoryRepository,
    AbstractSimulationStateRepository
)
from app.database.models import (
    AuditRecordModel,
    BehaviourProfileModel,
    TrustStateModel,
    RiskStateModel,
    LiveSessionModel,
    AlertModel,
    ApprovalModel,
    ExecutionHistoryModel,
    SimulationStateModel
)
from app.audit_chain.models import AuditRecord
from app.behaviour_intelligence.profiles.models import BehaviourProfile
from app.trust_engine.metrics.models import TrustState
from app.risk_engine.scoring.models import RiskState

class SQLAlchemyAuditRepository(AbstractAuditRepository):
    def __init__(self, db: Session):
        self.db = db

    def append_record(self, record: AuditRecord) -> None:
        db_record = AuditRecordModel(
            index=int(record.index),
            timestamp=str(record.timestamp),
            user=str(record.user),
            session_id=str(record.session_id),
            event_id=str(record.event_id),
            trust_score=float(record.trust_score),
            risk_score=float(record.risk_score),
            decision=str(record.decision),
            reviewer=str(record.reviewer),
            response_executed=str(record.response_executed),
            evidence=json.dumps(record.evidence),
            previous_hash=str(record.previous_hash),
            current_hash=str(record.current_hash),
            quantum_signature=str(record.quantum_signature),
            algorithm_marker=str(record.algorithm_marker)
        )
        self.db.add(db_record)
        self.db.commit()

    def get_record(self, index: int) -> Optional[AuditRecord]:
        row = self.db.query(AuditRecordModel).filter(AuditRecordModel.index == index).first()
        if not row:
            return None
        return AuditRecord(
            index=int(row.index),
            timestamp=str(row.timestamp),
            user=str(row.user),
            session_id=str(row.session_id),
            event_id=str(row.event_id),
            trust_score=float(row.trust_score),
            risk_score=float(row.risk_score),
            decision=str(row.decision),
            reviewer=str(row.reviewer),
            response_executed=str(row.response_executed),
            evidence=json.loads(str(row.evidence)),
            previous_hash=str(row.previous_hash),
            current_hash=str(row.current_hash),
            quantum_signature=str(row.quantum_signature),
            algorithm_marker=str(row.algorithm_marker)
        )

    def get_all_records(self) -> List[AuditRecord]:
        rows = self.db.query(AuditRecordModel).order_by(AuditRecordModel.index.asc()).all()
        return [
            AuditRecord(
                index=int(r.index),
                timestamp=str(r.timestamp),
                user=str(r.user),
                session_id=str(r.session_id),
                event_id=str(r.event_id),
                trust_score=float(r.trust_score),
                risk_score=float(r.risk_score),
                decision=str(r.decision),
                reviewer=str(r.reviewer),
                response_executed=str(r.response_executed),
                evidence=json.loads(str(r.evidence)),
                previous_hash=str(r.previous_hash),
                current_hash=str(r.current_hash),
                quantum_signature=str(r.quantum_signature),
                algorithm_marker=str(r.algorithm_marker)
            ) for r in rows
        ]

    def get_latest_record(self) -> Optional[AuditRecord]:
        row = self.db.query(AuditRecordModel).order_by(AuditRecordModel.index.desc()).first()
        if not row:
            return None
        return AuditRecord(
            index=int(row.index),
            timestamp=str(row.timestamp),
            user=str(row.user),
            session_id=str(row.session_id),
            event_id=str(row.event_id),
            trust_score=float(row.trust_score),
            risk_score=float(row.risk_score),
            decision=str(row.decision),
            reviewer=str(row.reviewer),
            response_executed=str(row.response_executed),
            evidence=json.loads(str(row.evidence)),
            previous_hash=str(row.previous_hash),
            current_hash=str(row.current_hash),
            quantum_signature=str(row.quantum_signature),
            algorithm_marker=str(row.algorithm_marker)
        )

    def clear_ledger(self) -> None:
        self.db.query(AuditRecordModel).delete()
        self.db.commit()


class SQLAlchemyBehaviourProfileRepository(AbstractBehaviourProfileRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_profile(self, username: str) -> Optional[BehaviourProfile]:
        row = self.db.query(BehaviourProfileModel).filter(BehaviourProfileModel.username == username).first()
        if not row:
            return None
        return BehaviourProfile(
            username=str(row.username),
            normal_login_hours=json.loads(str(row.normal_login_hours)),
            normal_device_ips=json.loads(str(row.normal_device_ips)),
            normal_devices=json.loads(str(row.normal_devices)),
            allowed_locations=json.loads(str(row.allowed_locations)),
            normal_command_types=json.loads(str(row.normal_command_types)),
            max_download_size_mb=float(row.max_download_size_mb),
            normal_working_days=json.loads(str(row.normal_working_days)),
            is_frozen=bool(row.is_frozen),
            history_weights_count=int(row.history_weights_count)
        )

    def save_profile(self, profile: BehaviourProfile) -> None:
        row = self.db.query(BehaviourProfileModel).filter(BehaviourProfileModel.username == profile.username).first()
        if not row:
            row = BehaviourProfileModel(username=profile.username)
            self.db.add(row)
        
        row_any: Any = row
        row_any.normal_login_hours = json.dumps(profile.normal_login_hours)
        row_any.normal_device_ips = json.dumps(profile.normal_device_ips)
        row_any.normal_devices = json.dumps(profile.normal_devices)
        row_any.allowed_locations = json.dumps(profile.allowed_locations)
        row_any.normal_command_types = json.dumps(profile.normal_command_types)
        row_any.max_download_size_mb = float(profile.max_download_size_mb)
        row_any.normal_working_days = json.dumps(profile.normal_working_days)
        row_any.is_frozen = bool(profile.is_frozen)
        row_any.history_weights_count = int(profile.history_weights_count)
        self.db.commit()

    def delete_profile(self, username: str) -> None:
        self.db.query(BehaviourProfileModel).filter(BehaviourProfileModel.username == username).delete()
        self.db.commit()


class SQLAlchemyTrustStateRepository(AbstractTrustStateRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_state(self, username: str) -> Optional[TrustState]:
        row = self.db.query(TrustStateModel).filter(TrustStateModel.username == username).first()
        if not row:
            return None
        return TrustState(
            username=str(row.username),
            current_trust=float(row.current_trust),
            previous_trust=float(row.previous_trust),
            trust_level=str(row.trust_level),
            reasons_history=json.loads(str(row.reasons_history)),
            is_frozen=bool(row.is_frozen)
        )

    def save_state(self, state: TrustState) -> None:
        row = self.db.query(TrustStateModel).filter(TrustStateModel.username == state.username).first()
        if not row:
            row = TrustStateModel(username=state.username)
            self.db.add(row)

        row_any: Any = row
        row_any.current_trust = float(state.current_trust)
        row_any.previous_trust = float(state.previous_trust)
        row_any.trust_level = str(state.trust_level)
        row_any.reasons_history = json.dumps(state.reasons_history)
        row_any.is_frozen = bool(state.is_frozen)
        self.db.commit()

    def delete_state(self, username: str) -> None:
        self.db.query(TrustStateModel).filter(TrustStateModel.username == username).delete()
        self.db.commit()


class SQLAlchemyRiskStateRepository(AbstractRiskStateRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_state(self, session_id: str) -> Optional[RiskState]:
        row = self.db.query(RiskStateModel).filter(RiskStateModel.session_id == session_id).first()
        if not row:
            return None
        return RiskState(
            session_id=str(row.session_id),
            username=str(row.username),
            current_risk_score=float(row.current_risk_score),
            previous_risk_score=float(row.previous_risk_score),
            risk_level=str(row.risk_level),
            policy_name=str(row.policy_name),
            reasons_history=json.loads(str(row.reasons_history)),
            is_frozen=bool(row.is_frozen)
        )

    def save_state(self, state: RiskState) -> None:
        row = self.db.query(RiskStateModel).filter(RiskStateModel.session_id == state.session_id).first()
        if not row:
            row = RiskStateModel(session_id=state.session_id)
            self.db.add(row)

        row_any: Any = row
        row_any.username = str(state.username)
        row_any.current_risk_score = float(state.current_risk_score)
        row_any.previous_risk_score = float(state.previous_risk_score)
        row_any.risk_level = str(state.risk_level)
        row_any.policy_name = str(state.policy_name)
        row_any.reasons_history = json.dumps(state.reasons_history)
        row_any.is_frozen = bool(state.is_frozen)
        self.db.commit()

    def delete_state(self, session_id: str) -> None:
        self.db.query(RiskStateModel).filter(RiskStateModel.session_id == session_id).delete()
        self.db.commit()


class SQLAlchemySessionRepository(AbstractSessionRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_all_sessions(self) -> List[Dict[str, Any]]:
        rows = self.db.query(LiveSessionModel).all()
        return [
            {
                "sessionId": str(r.session_id),
                "username": str(r.username),
                "role": str(r.role),
                "action": str(r.action),
                "device": str(r.device),
                "location": str(r.location),
                "duration": str(r.duration),
                "database": str(r.database)
            } for r in rows
        ]

    def add_session(self, session: Dict[str, Any]) -> None:
        row = LiveSessionModel(
            session_id=session["sessionId"],
            username=session["username"],
            role=session["role"],
            action=session["action"],
            device=session["device"],
            location=session["location"],
            duration=session["duration"],
            database=session["database"]
        )
        self.db.add(row)
        self.db.commit()

    def remove_session(self, session_id: str) -> None:
        self.db.query(LiveSessionModel).filter(LiveSessionModel.session_id == session_id).delete()
        self.db.commit()

    def clear_sessions(self) -> None:
        self.db.query(LiveSessionModel).delete()
        self.db.commit()


class SQLAlchemyAlertRepository(AbstractAlertRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_all_alerts(self) -> List[Dict[str, Any]]:
        rows = self.db.query(AlertModel).all()
        return [
            {
                "id": str(r.id),
                "title": str(r.title),
                "source": str(r.source),
                "severity": str(r.severity),
                "status": str(r.status),
                "user": str(r.user),
                "ip": str(r.ip),
                "score": int(r.score),
                "timestamp": str(r.timestamp),
                "description": str(r.description),
                "analyst_feedback": str(r.analyst_feedback) if r.analyst_feedback else None
            } for r in rows
        ]

    def add_alert(self, alert: Dict[str, Any]) -> None:
        row = AlertModel(
            id=alert["id"],
            title=alert["title"],
            source=alert["source"],
            severity=alert["severity"],
            status=alert["status"],
            user=alert["user"],
            ip=alert["ip"],
            score=alert["score"],
            timestamp=alert["timestamp"],
            description=alert["description"]
        )
        self.db.add(row)
        self.db.commit()

    def update_alert_status(self, alert_id: str, status: str) -> Optional[Dict[str, Any]]:
        row = self.db.query(AlertModel).filter(AlertModel.id == alert_id).first()
        if not row:
            return None
        row_any: Any = row
        row_any.status = status
        self.db.commit()
        return {
            "id": str(row.id),
            "title": str(row.title),
            "source": str(row.source),
            "severity": str(row.severity),
            "status": str(row.status),
            "user": str(row.user),
            "ip": str(row.ip),
            "score": int(row.score),
            "timestamp": str(row.timestamp),
            "description": str(row.description),
            "analyst_feedback": str(row.analyst_feedback) if row.analyst_feedback else None
        }

    def add_feedback(self, alert_id: str, feedback: str) -> Optional[Dict[str, Any]]:
        row = self.db.query(AlertModel).filter(AlertModel.id == alert_id).first()
        if not row:
            return None
        row_any: Any = row
        row_any.analyst_feedback = feedback
        self.db.commit()
        return {
            "id": str(row.id),
            "title": str(row.title),
            "source": str(row.source),
            "severity": str(row.severity),
            "status": str(row.status),
            "user": str(row.user),
            "ip": str(row.ip),
            "score": int(row.score),
            "timestamp": str(row.timestamp),
            "description": str(row.description),
            "analyst_feedback": str(row.analyst_feedback) if row.analyst_feedback else None
        }

    def clear_alerts(self) -> None:
        self.db.query(AlertModel).delete()
        self.db.commit()


class SQLAlchemyApprovalRepository(AbstractApprovalRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_all_approvals(self) -> List[Dict[str, Any]]:
        rows = self.db.query(ApprovalModel).all()
        return [
            {
                "id": str(r.id),
                "sessionId": str(r.session_id),
                "user": str(r.user),
                "action": str(r.action),
                "sensitivity": str(r.sensitivity),
                "status": str(r.status),
                "reviewer": str(r.reviewer),
                "time": str(r.time),
                "reason": str(r.reason),
                "comment": str(r.comment) if r.comment else None
            } for r in rows
        ]

    def add_approval(self, approval: Dict[str, Any]) -> None:
        row = ApprovalModel(
            id=approval["id"],
            session_id=approval["sessionId"],
            user=approval["user"],
            action=approval["action"],
            sensitivity=approval["sensitivity"],
            status=approval["status"],
            reviewer=approval["reviewer"],
            time=approval["time"],
            reason=approval["reason"],
            comment=approval.get("comment")
        )
        self.db.add(row)
        self.db.commit()

    def update_approval(self, approval_id: str, status: str, reviewer: str, comment: Optional[str] = None) -> Optional[Dict[str, Any]]:
        row = self.db.query(ApprovalModel).filter(ApprovalModel.id == approval_id).first()
        if not row:
            return None
        row_any: Any = row
        row_any.status = status
        row_any.reviewer = reviewer
        if comment is not None:
            row_any.comment = comment
        self.db.commit()
        return {
            "id": str(row.id),
            "sessionId": str(row.session_id),
            "user": str(row.user),
            "action": str(row.action),
            "sensitivity": str(row.sensitivity),
            "status": str(row.status),
            "reviewer": str(row.reviewer),
            "time": str(row.time),
            "reason": str(row.reason),
            "comment": str(row.comment) if row.comment else None
        }

    def clear_approvals(self) -> None:
        self.db.query(ApprovalModel).delete()
        self.db.commit()


class SQLAlchemyExecutionHistoryRepository(AbstractExecutionHistoryRepository):
    def __init__(self, db: Session):
        self.db = db

    def save_execution(self, execution: Dict[str, Any]) -> None:
        row = self.db.query(ExecutionHistoryModel).filter(ExecutionHistoryModel.execution_id == execution["execution_id"]).first()
        if not row:
            row = ExecutionHistoryModel(execution_id=execution["execution_id"])
            self.db.add(row)

        row_any: Any = row
        row_any.playbook_name = str(execution["playbook_name"])
        row_any.playbook_id = str(execution["playbook_id"])
        row_any.session_id = str(execution["session_id"])
        row_any.risk_score = float(execution["risk_score"])
        row_any.trigger_event = json.dumps(execution["trigger_event"])
        row_any.execution_status = str(execution["execution_status"])
        row_any.completed_actions = json.dumps(execution["completed_actions"])
        row_any.pending_actions = json.dumps(execution["pending_actions"])
        row_any.execution_timeline = json.dumps(execution["execution_timeline"])
        row_any.timestamp = str(execution.get("timestamp", ""))
        self.db.commit()

    def get_execution(self, execution_id: str) -> Optional[Dict[str, Any]]:
        row = self.db.query(ExecutionHistoryModel).filter(ExecutionHistoryModel.execution_id == execution_id).first()
        if not row:
            return None
        return {
            "execution_id": str(row.execution_id),
            "playbook_name": str(row.playbook_name),
            "playbook_id": str(row.playbook_id),
            "session_id": str(row.session_id),
            "risk_score": float(row.risk_score),
            "trigger_event": json.loads(str(row.trigger_event)),
            "execution_status": str(row.execution_status),
            "completed_actions": json.loads(str(row.completed_actions)),
            "pending_actions": json.loads(str(row.pending_actions)),
            "execution_timeline": json.loads(str(row.execution_timeline)),
            "timestamp": str(row.timestamp)
        }

    def get_all_executions(self) -> List[Dict[str, Any]]:
        rows = self.db.query(ExecutionHistoryModel).all()
        return [
            {
                "execution_id": str(r.execution_id),
                "playbook_name": str(r.playbook_name),
                "playbook_id": str(r.playbook_id),
                "session_id": str(r.session_id),
                "risk_score": float(r.risk_score),
                "trigger_event": json.loads(str(r.trigger_event)),
                "execution_status": str(r.execution_status),
                "completed_actions": json.loads(str(r.completed_actions)),
                "pending_actions": json.loads(str(r.pending_actions)),
                "execution_timeline": json.loads(str(r.execution_timeline)),
                "timestamp": str(r.timestamp)
            } for r in rows
        ]

    def clear_history(self) -> None:
        self.db.query(ExecutionHistoryModel).delete()
        self.db.commit()


class SQLAlchemySimulationStateRepository(AbstractSimulationStateRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_status(self) -> Dict[str, Any]:
        row = self.db.query(SimulationStateModel).filter(SimulationStateModel.id == 1).first()
        if not row:
            row = SimulationStateModel(id=1, active_scenario_id=None, current_step_index=0, is_running=False, speed=1, progress=0)
            self.db.add(row)
            self.db.commit()
        return {
            "activeScenarioId": str(row.active_scenario_id) if row.active_scenario_id else None,
            "currentStepIndex": int(row.current_step_index),
            "isRunning": bool(row.is_running),
            "speed": int(row.speed),
            "progress": int(row.progress)
        }

    def update_status(self, updates: Dict[str, Any]) -> Dict[str, Any]:
        row = self.db.query(SimulationStateModel).filter(SimulationStateModel.id == 1).first()
        if not row:
            row = SimulationStateModel(id=1)
            self.db.add(row)

        row_any: Any = row
        if "activeScenarioId" in updates:
            row_any.active_scenario_id = str(updates["activeScenarioId"]) if updates["activeScenarioId"] else None
        if "currentStepIndex" in updates:
            row_any.current_step_index = int(updates["currentStepIndex"])
        if "isRunning" in updates:
            row_any.is_running = bool(updates["isRunning"])
        if "speed" in updates:
            row_any.speed = int(updates["speed"])
        if "progress" in updates:
            row_any.progress = int(updates["progress"])

        self.db.commit()
        return {
            "activeScenarioId": str(row.active_scenario_id) if row.active_scenario_id else None,
            "currentStepIndex": int(row.current_step_index),
            "isRunning": bool(row.is_running),
            "speed": int(row.speed),
            "progress": int(row.progress)
        }

    def reset_status(self) -> Dict[str, Any]:
        row = self.db.query(SimulationStateModel).filter(SimulationStateModel.id == 1).first()
        if row:
            row_any: Any = row
            row_any.active_scenario_id = None
            row_any.current_step_index = 0
            row_any.is_running = False
            row_any.speed = 1
            row_any.progress = 0
            self.db.commit()
        return {
            "activeScenarioId": None,
            "currentStepIndex": 0,
            "isRunning": False,
            "speed": 1,
            "progress": 0
        }
