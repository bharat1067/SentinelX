import pytest
from app.audit_chain.manager import AuditChainManager
from app.audit_chain.history.store import AuditLedgerStore
from app.audit_chain.models import AuditRecord
from app.audit_chain.signatures.interface import QuantumSignatureProvider
from app.audit_chain.verification.auditor import AuditChainVerifier
from app.audit_chain.forensics.package_builder import ForensicPackageBuilder
from app.audit_chain.timeline.query import AuditTimelineQuery
from app.audit_chain.exports.document import AuditDocumentExporter

@pytest.fixture(autouse=True)
def clean_ledger():
    AuditLedgerStore.clear_ledger()

def test_quantum_signature_verification():
    payload = "d7a8f9b2c3d4e5f6"
    
    # ML-DSA-87
    sig_provider = QuantumSignatureProvider(algorithm="ML-DSA-87")
    sig = sig_provider.sign_payload(payload)
    assert sig.startswith("SIG-ML-DSA-87-")
    assert sig_provider.verify_signature(payload, sig) is True
    assert sig_provider.verify_signature(payload + "tamper", sig) is False

    # SLH-DSA-sha256
    sig_provider_slh = QuantumSignatureProvider(algorithm="SLH-DSA-sha256")
    sig_slh = sig_provider_slh.sign_payload(payload)
    assert sig_slh.startswith("SIG-SLH-DSA-sha256-")
    assert sig_provider_slh.verify_signature(payload, sig_slh) is True

def test_chained_hashes():
    event_1 = {"username": "Amit Verma", "session_id": "SES-99912", "event_id": "EVT-001"}
    event_2 = {"username": "Amit Verma", "session_id": "SES-99912", "event_id": "EVT-002"}

    # Commit block 0
    rec_0 = AuditChainManager.commit_to_audit_chain(
        event=event_1, trust_score=90.0, risk_score=10.0,
        decision="Allow", reviewer="None", response_executed="None",
        evidence=["Normal base"]
    )
    assert rec_0.index == 0
    assert rec_0.previous_hash == "0" * 64

    # Commit block 1
    rec_1 = AuditChainManager.commit_to_audit_chain(
        event=event_2, trust_score=85.0, risk_score=20.0,
        decision="Allow + Log", reviewer="None", response_executed="None",
        evidence=["Elevated risk"]
    )
    assert rec_1.index == 1
    assert rec_1.previous_hash == rec_0.current_hash

def test_ledger_verifier_detect_tampering():
    event = {"username": "Amit Verma", "session_id": "SES-99912", "event_id": "EVT-001"}
    
    AuditChainManager.commit_to_audit_chain(
        event=event, trust_score=90.0, risk_score=10.0,
        decision="Allow", reviewer="None", response_executed="None",
        evidence=[]
    )
    AuditChainManager.commit_to_audit_chain(
        event=event, trust_score=85.0, risk_score=20.0,
        decision="Allow + Log", reviewer="None", response_executed="None",
        evidence=[]
    )

    # Valid chain check
    report = AuditChainManager.run_chain_verification()
    assert report.chain_valid is True
    assert len(report.modified_indices) == 0

    # Simulate payload tampering on block 1
    records = AuditLedgerStore.get_all_records()
    records[1].trust_score = 5.0  # Change trust value maliciously
    
    report_tampered = AuditChainManager.run_chain_verification()
    assert report_tampered.chain_valid is False
    assert 1 in report_tampered.modified_indices

def test_ledger_verifier_detect_missing_record():
    event = {"username": "Amit Verma", "session_id": "SES-99912", "event_id": "EVT-001"}
    
    AuditChainManager.commit_to_audit_chain(
        event=event, trust_score=90.0, risk_score=10.0,
        decision="Allow", reviewer="None", response_executed="None",
        evidence=[]
    )
    AuditChainManager.commit_to_audit_chain(
        event=event, trust_score=85.0, risk_score=20.0,
        decision="Allow + Log", reviewer="None", response_executed="None",
        evidence=[]
    )

    # Maliciously delete index 0 from ledger store
    ledger = AuditLedgerStore._ledger
    del ledger[0]

    report = AuditChainVerifier.verify_ledger()
    assert report.chain_valid is False
    # Chain verifier detects index mismatches
    assert len(report.missing_indices) > 0 or len(report.modified_indices) > 0

def test_timeline_search_and_filter():
    event_1 = {"username": "Amit Verma", "session_id": "SES-99912", "event_id": "EVT-001"}
    event_2 = {"username": "Neha Singh", "session_id": "SES-90812", "event_id": "EVT-002"}

    AuditChainManager.commit_to_audit_chain(
        event=event_1, trust_score=90.0, risk_score=10.0,
        decision="Allow", reviewer="None", response_executed="None",
        evidence=["Late Login"]
    )
    AuditChainManager.commit_to_audit_chain(
        event=event_2, trust_score=95.0, risk_score=5.0,
        decision="Allow", reviewer="None", response_executed="None",
        evidence=[]
    )

    # Search keyword
    results = AuditTimelineQuery.search("Neha")
    assert len(results) == 1
    assert results[0].user == "Neha Singh"

    results_anomaly = AuditTimelineQuery.search("Late")
    assert len(results_anomaly) == 1
    assert results_anomaly[0].user == "Amit Verma"

    # Filter
    filtered = AuditTimelineQuery.filter(user="Amit Verma")
    assert len(filtered) == 1
    assert filtered[0].session_id == "SES-99912"

def test_forensic_package_and_export():
    event = {"username": "Amit Verma", "session_id": "SES-99912", "event_id": "EVT-001"}
    AuditChainManager.commit_to_audit_chain(
        event=event, trust_score=90.0, risk_score=10.0,
        decision="Allow", reviewer="None", response_executed="None",
        evidence=[]
    )

    package = AuditChainManager.compile_forensic_package(
        session_id="SES-99912",
        incident_summary="Suspicious db readings",
        decision_trace="UEBA -> PDP -> SOC Approval",
        risk_timeline=["[02:15] Risk increased to 15.0"],
        trust_timeline=["[02:15] Trust dropped to 90.0"],
        execution_timeline=["Executed: Pause Sensitive Operation"]
    )

    assert package.audit_chain_slice[0].session_id == "SES-99912"
    assert len(package.audit_chain_slice) == 1

    # Generate Markdown
    md_report = AuditDocumentExporter.generate_forensic_markdown(package)
    assert "# SentinelX Forensic Evidence Archive:" in md_report
    assert "Incident Executive Summary" in md_report
    assert "Cryptographic Chained Audit Ledger Slice" in md_report
