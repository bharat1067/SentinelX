import pytest
from app.pdp.manager import PDPManager
from app.pdp.policies.profiles import POL_PROFILES_REGISTRY
from app.pdp.policy_engine.engine import PDPPolicyEngine
from app.pdp.decision_matrix.evaluator import PDPDecisionMatrix
from app.pdp.approvals.workflow import PDPApprovalWorkflow
from app.pdp.evaluators.rules import PDPRuleEvaluator

def test_pdp_role_validation_reject():
    profile = POL_PROFILES_REGISTRY["Privileged Administration"]
    # Unauthorized role Employee (only Manager and SOC Analyst allowed)
    event = {
        "role": "Employee",
        "action": "create-admin-user"
    }
    decision, evidence = PDPRuleEvaluator.evaluate_rules(
        event=event,
        risk_score=10.0,
        trust_score=90.0,
        profile=profile
    )
    assert decision == "Reject"
    assert any("Unauthorized role" in e for e in evidence)

def test_pdp_hard_block_limits():
    profile = POL_PROFILES_REGISTRY["Normal Banking Operations"]
    event = {
        "role": "Employee",
        "action": "db-query-select"
    }
    # Risk exceeds policy max_risk_allowed (75.0)
    decision, evidence = PDPRuleEvaluator.evaluate_rules(
        event=event,
        risk_score=80.0,
        trust_score=90.0,
        profile=profile
    )
    assert decision == "Reject"
    assert any("exceeds maximum allowed risk" in e for e in evidence)

def test_decision_matrix_evaluation():
    # Critical action + Low trust/High risk -> Reject
    decision, reason = PDPDecisionMatrix.evaluate_matrix(
        risk_level="High",
        trust_level="Low",
        action_sensitivity="Critical",
        role="Employee"
    )
    assert decision == "Reject"

    # High sensitivity action + Normal risk/trust -> Allow + Log
    decision, reason = PDPDecisionMatrix.evaluate_matrix(
        risk_level="Low",
        trust_level="High",
        action_sensitivity="High",
        role="Employee"
    )
    assert decision == "Allow + Log"

    # Medium action + Elevated risk -> Require MFA
    decision, reason = PDPDecisionMatrix.evaluate_matrix(
        risk_level="High",
        trust_level="High",
        action_sensitivity="Medium",
        role="Employee"
    )
    assert decision == "Require MFA"

def test_approval_workflow_resolution():
    event = {
        "role": "Employee",
        "action": "db-query-mass-select"
    }
    # Require Manager Approval under Production Database policy -> Dual Approval
    app_req, reviewer, response = PDPApprovalWorkflow.resolve_approval_workflow(
        decision="Require Manager Approval",
        event=event,
        policy_name="Production Database"
    )
    assert app_req == "Dual Approval"
    assert reviewer == "Dual Reviewer"
    assert response == "SUSPEND_ACTION_UNTIL_DUAL_SIGNS"

    # Require Manager Approval under Emergency Operations policy -> Emergency Override
    app_req, reviewer, response = PDPApprovalWorkflow.resolve_approval_workflow(
        decision="Require Manager Approval",
        event=event,
        policy_name="Emergency Operations"
    )
    assert app_req == "Emergency Override"
    assert reviewer == "Dual Reviewer"
    assert response == "SUSPEND_ACTION_UNTIL_DUAL_OVERRIDE"

def test_pdp_reconciliation():
    # Rule = Require MFA, Matrix = Require Manager Approval -> Require Manager Approval
    final = PDPPolicyEngine.reconcile_outcomes("Require MFA", "Require Manager Approval")
    assert final == "Require Manager Approval"

    # Rule = Reject, Matrix = Allow -> Reject
    final = PDPPolicyEngine.reconcile_outcomes("Reject", "Allow")
    assert final == "Reject"

def test_pdp_manager_evaluate():
    event = {
        "role": "Employee",
        "action": "db-query-select",
        "resource": "bom_ledger.customer_accounts"
    }
    behaviour_summary = {"deviation_percentage": 0.0}
    trust_summary = {"current_trust_score": 90.0, "trust_level": "High"}
    
    class MockRiskEval:
        current_risk_score = 15.0
        risk_level = "Very Low"
        
    decision = PDPManager.evaluate_policy(
        event=event,
        behaviour_summary=behaviour_summary,
        trust_summary=trust_summary,
        risk_evaluation=MockRiskEval(),
        policy_profile_name="Normal Banking Operations"
    )
    
    assert decision.decision in ["Allow", "Allow + Log"]
    assert decision.triggered_policy == "Normal Banking Operations"
    assert decision.approval_requirement == "None"
