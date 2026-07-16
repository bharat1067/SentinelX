import json
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime
from app.database.connection import Base
import datetime

class AuditRecordModel(Base):
    __tablename__ = "audit_ledger"

    id = Column(Integer, primary_key=True, index=True)
    index = Column(Integer, unique=True, nullable=False)
    timestamp = Column(String, nullable=False)
    user = Column(String, nullable=False)
    session_id = Column(String, nullable=False)
    event_id = Column(String, nullable=False)
    trust_score = Column(Float, nullable=False)
    risk_score = Column(Float, nullable=False)
    decision = Column(String, nullable=False)
    reviewer = Column(String, nullable=False)
    response_executed = Column(String, nullable=False)
    evidence = Column(Text, nullable=False)  # JSON-serialized list of strings
    previous_hash = Column(String, nullable=False)
    current_hash = Column(String, nullable=False)
    quantum_signature = Column(String, nullable=False)
    algorithm_marker = Column(String, nullable=False)

class BehaviourProfileModel(Base):
    __tablename__ = "behaviour_profiles"

    username = Column(String, primary_key=True, index=True)
    normal_login_hours = Column(Text, nullable=False)  # JSON list [int, int]
    normal_device_ips = Column(Text, nullable=False)   # JSON list of strings
    normal_devices = Column(Text, nullable=False)      # JSON list of strings
    allowed_locations = Column(Text, nullable=False)   # JSON list of strings
    normal_command_types = Column(Text, nullable=False) # JSON list of strings
    max_download_size_mb = Column(Float, default=50.0)
    normal_working_days = Column(Text, nullable=False) # JSON list [int]
    is_frozen = Column(Boolean, default=False)
    history_weights_count = Column(Integer, default=0)

class TrustStateModel(Base):
    __tablename__ = "trust_states"

    username = Column(String, primary_key=True, index=True)
    current_trust = Column(Float, nullable=False)
    previous_trust = Column(Float, nullable=False)
    trust_level = Column(String, nullable=False)
    reasons_history = Column(Text, nullable=False)  # JSON list of dicts
    is_frozen = Column(Boolean, default=False)

class RiskStateModel(Base):
    __tablename__ = "risk_states"

    session_id = Column(String, primary_key=True, index=True)
    username = Column(String, nullable=False)
    current_risk_score = Column(Float, nullable=False)
    previous_risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    policy_name = Column(String, nullable=False)
    reasons_history = Column(Text, nullable=False)  # JSON list of dicts
    is_frozen = Column(Boolean, default=False)

class LiveSessionModel(Base):
    __tablename__ = "live_sessions"

    session_id = Column(String, primary_key=True, index=True)
    username = Column(String, nullable=False)
    role = Column(String, nullable=False)
    action = Column(String, nullable=False)
    device = Column(String, nullable=False)
    location = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    database = Column(String, nullable=False)

class AlertModel(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)  # ALT-xxxx
    title = Column(String, nullable=False)
    source = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    status = Column(String, nullable=False)
    user = Column(String, nullable=False)
    ip = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    timestamp = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    analyst_feedback = Column(String, nullable=True)  # False Positive, True Positive, etc.

class ApprovalModel(Base):
    __tablename__ = "approvals"

    id = Column(String, primary_key=True, index=True)  # APP-xxxx
    session_id = Column(String, nullable=False)
    user = Column(String, nullable=False)
    action = Column(String, nullable=False)
    sensitivity = Column(String, nullable=False)
    status = Column(String, nullable=False)
    reviewer = Column(String, nullable=False)
    time = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    comment = Column(Text, nullable=True)

class ExecutionHistoryModel(Base):
    __tablename__ = "execution_history"

    execution_id = Column(String, primary_key=True, index=True)
    playbook_name = Column(String, nullable=False)
    playbook_id = Column(String, nullable=False)
    session_id = Column(String, nullable=False)
    risk_score = Column(Float, nullable=False)
    trigger_event = Column(Text, nullable=False)       # JSON string
    execution_status = Column(String, nullable=False)
    completed_actions = Column(Text, nullable=False)   # JSON list of strings
    pending_actions = Column(Text, nullable=False)     # JSON list of strings
    execution_timeline = Column(Text, nullable=False)  # JSON list of strings
    timestamp = Column(String, nullable=False)

class SimulationStateModel(Base):
    __tablename__ = "simulation_state"

    id = Column(Integer, primary_key=True, default=1)
    active_scenario_id = Column(String, nullable=True)
    current_step_index = Column(Integer, default=0)
    is_running = Column(Boolean, default=False)
    speed = Column(Integer, default=1)
    progress = Column(Integer, default=0)
