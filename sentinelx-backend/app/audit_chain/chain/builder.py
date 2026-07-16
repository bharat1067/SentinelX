import datetime
import hashlib
from typing import Dict, Any, List
from app.audit_chain.models import AuditRecord
from app.audit_chain.signatures.interface import QuantumSignatureProvider
from app.audit_chain.history.store import AuditLedgerStore

class AuditChainBuilder:
    @staticmethod
    def build_next_record(
        event: Dict[str, Any],
        trust_score: float,
        risk_score: float,
        decision: str,
        reviewer: str,
        response_executed: str,
        evidence: List[str],
        algorithm: str = "ML-DSA-87"
    ) -> AuditRecord:
        """
        Builds the next chained AuditRecord block, linking it mathematically
        to the preceding block's hash signature.
        """
        latest = AuditLedgerStore.get_latest_record()
        
        if latest:
            index = latest.index + 1
            previous_hash = latest.current_hash
        else:
            index = 0
            previous_hash = "0" * 64

        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        user = event.get("username", "System")
        session_id = event.get("session_id", "SES-GENERIC")
        event_id = event.get("event_id", "EVT-GENERIC")

        # Compile payload string for hashing
        payload = f"{index}|{timestamp}|{user}|{session_id}|{event_id}|{trust_score}|{risk_score}|{decision}|{reviewer}|{response_executed}|{previous_hash}"
        current_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()

        # Sign the block using quantum signature provider
        sig_provider = QuantumSignatureProvider(algorithm=algorithm)
        signature = sig_provider.sign_payload(current_hash)

        return AuditRecord(
            index=index,
            timestamp=timestamp,
            user=user,
            session_id=session_id,
            event_id=event_id,
            trust_score=trust_score,
            risk_score=risk_score,
            decision=decision,
            reviewer=reviewer,
            response_executed=response_executed,
            evidence=evidence,
            previous_hash=previous_hash,
            current_hash=current_hash,
            quantum_signature=signature,
            algorithm_marker=algorithm
        )
