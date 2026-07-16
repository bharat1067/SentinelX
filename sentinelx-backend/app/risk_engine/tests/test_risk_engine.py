import pytest
from app.risk_engine.manager import RiskEngineManager
from app.risk_engine.policies.profiles import POLICIES_REGISTRY
from app.behaviour_intelligence.profiles.models import BehaviourProfile

def test_risk_state_initialization():
    manager = RiskEngineManager()
    state = manager.get_or_create_state("SES-12345", "Amit Verma")
    
    assert state.session_id == "SES-12345"
    assert state.username == "Amit Verma"
    assert state.current_risk_score == 10.0
    assert state.risk_level == "Very Low"
    assert not state.is_frozen

def test_risk_state_freeze_and_reset():
    manager = RiskEngineManager()
    session_id = "SES-12345"
    
    manager.get_or_create_state(session_id, "Amit Verma")
    assert manager.freeze_risk(session_id) is True
    
    state = manager.get_or_create_state(session_id, "Amit Verma")
    assert state.is_frozen is True
    
    assert manager.reset_risk(session_id) is True
    assert session_id not in manager._states

def test_deterministic_risk_calculation():
    manager = RiskEngineManager()
    session_id = "SES-999"
    username = "Amit Verma"
    
    # Mock event outside normal working hours (normal: 9-18, event: 02:00)
    event = {
        "event_id": "EVT-MOCK-01",
        "session_id": session_id,
        "username": username,
        "role": "Employee",
        "action": "db-query-mass-select",
        "resource": "bom_ledger.customer_accounts",
        "device": "BOM-DBA-UNKNOWN",  # anomalous device
        "location": "MUMBAI_SOC_C3",  # anomalous location
        "timestamp": "2026-07-15T02:15:00Z"
    }
    
    behaviour_summary = {
        "deviation_percentage": 50.0,
        "deviation_reasons": ["Unusual query volume"]
    }
    
    trust_summary = {
        "current_trust_score": 60.0  # Trust dropped from 90 to 60 (Trust Risk = 40)
    }
    
    # Establish baseline profile
    profile = BehaviourProfile(
        username=username,
        normal_login_hours=[9, 18],
        normal_devices=["BOM-DBA-087"],
        allowed_locations=["PUNE_HQ_F4"]
    )
    
    # Evaluate risk
    result = manager.evaluate_session_risk(
        session_id=session_id,
        event=event,
        behaviour_summary=behaviour_summary,
        trust_summary=trust_summary,
        historical_profile=profile
    )
    
    assert result.current_risk_score > 10.0  # risk score should definitely increase
    assert result.risk_level in ["Medium", "High", "Critical"]
    assert result.risk_trend == "UPWARD"
    
    # Sub-scores validation
    sub = result.sub_scores
    assert sub["behaviour_risk"] == 50.0
    assert sub["trust_risk"] == 40.0
    assert sub["device_risk"] == 100.0  # since BOM-DBA-UNKNOWN != BOM-DBA-087
    assert sub["location_risk"] == 100.0  # since MUMBAI_SOC_C3 != PUNE_HQ_F4
    assert sub["time_risk"] == 100.0  # since 2:00 is outside 9-18
    assert sub["action_risk"] == 90.0  # db-query-mass-select base is 90
    assert sub["resource_risk"] == 100.0  # 50.0 * 2.0 multiplier

    # Breakdown verification (must sum to 100.0)
    bd = result.breakdown
    total_bd = (
        bd["behaviour_contribution"] +
        bd["trust_contribution"] +
        bd["device_contribution"] +
        bd["location_contribution"] +
        bd["action_contribution"] +
        bd["asset_contribution"] +
        bd["historical_contribution"]
    )
    assert abs(total_bd - 100.0) < 1e-2

    # Recommendation validation
    rec = result.recommendation
    assert rec.recommended_action != ""
    assert rec.reason != ""

def test_high_security_policy_evaluation():
    # Verify that High Security Policy generates higher risk score than Normal Banking Policy
    manager_normal = RiskEngineManager()
    manager_high = RiskEngineManager()
    
    session_normal = "SES-NORMAL"
    session_high = "SES-HIGH"
    
    event = {
        "event_id": "EVT-MOCK-02",
        "username": "Amit Verma",
        "role": "Manager",
        "action": "db-query-select",
        "resource": "bom_ledger.customer_accounts",
        "device": "BOM-DBA-087",
        "location": "PUNE_HQ_F4",
        "timestamp": "2026-07-15T12:00:00Z"
    }
    
    behaviour_summary = {
        "deviation_percentage": 20.0,
        "deviation_reasons": ["Minor shift"]
    }
    
    trust_summary = {
        "current_trust_score": 80.0
    }
    
    profile = BehaviourProfile(
        username="Amit Verma",
        normal_login_hours=[9, 18],
        normal_devices=["BOM-DBA-087"],
        allowed_locations=["PUNE_HQ_F4"]
    )
    
    # 1. Normal Policy
    state_normal = manager_normal.get_or_create_state(session_normal, "Amit Verma", "Normal Banking Policy")
    res_normal = manager_normal.evaluate_session_risk(session_normal, event, behaviour_summary, trust_summary, profile)
    
    # 2. High Security Policy
    state_high = manager_high.get_or_create_state(session_high, "Amit Verma", "High Security Policy")
    res_high = manager_high.evaluate_session_risk(session_high, event, behaviour_summary, trust_summary, profile)
    
    # High security policy should result in a higher risk score due to policy flat offset and stricter weights
    assert res_high.current_risk_score > res_normal.current_risk_score
