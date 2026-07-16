import hashlib
from typing import List
from app.audit_chain.models import VerificationReport, AuditRecord
from app.audit_chain.signatures.interface import QuantumSignatureProvider
from app.audit_chain.history.store import AuditLedgerStore

class AuditChainVerifier:
    @staticmethod
    def verify_ledger() -> VerificationReport:
        """
        Audits the entire chronological ledger chain.
        Detects missing indices, modified block payloads, and validates signatures.
        """
        records = AuditLedgerStore.get_all_records()
        
        missing = []
        modified = []
        invalid_sigs = []

        if not records:
            return VerificationReport(
                chain_valid=True,
                summary="Audit ledger is empty. Chain is clean."
            )

        for i, rec in enumerate(records):
            # 1. Check Sequence Continuity
            if rec.index != i:
                missing.append(i)

            # 2. Check Cryptographic Chaining
            if i > 0:
                parent = records[i - 1]
                if rec.previous_hash != parent.current_hash:
                    modified.append(rec.index)

            # 3. Check Payload Tampering (Re-hashing)
            payload = f"{rec.index}|{rec.timestamp}|{rec.user}|{rec.session_id}|{rec.event_id}|{rec.trust_score}|{rec.risk_score}|{rec.decision}|{rec.reviewer}|{rec.response_executed}|{rec.previous_hash}"
            expected_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()
            if rec.current_hash != expected_hash:
                if rec.index not in modified:
                    modified.append(rec.index)

            # 4. Check Quantum Digital Signature Integrity
            sig_provider = QuantumSignatureProvider(algorithm=rec.algorithm_marker)
            if not sig_provider.verify_signature(rec.current_hash, rec.quantum_signature):
                invalid_sigs.append(rec.index)

        # Reconcile validity
        is_valid = (len(missing) == 0 and len(modified) == 0 and len(invalid_sigs) == 0)

        summary_parts = []
        if is_valid:
            summary_parts.append("Continuous Audit Chain verification SUCCESS: Cryptographic hashes and quantum signatures are fully intact.")
        else:
            summary_parts.append("Continuous Audit Chain verification FAILED:")
            if missing:
                summary_parts.append(f"Missing blocks found at indices: {missing}.")
            if modified:
                summary_parts.append(f"Tampered/modified blocks found at indices: {modified}.")
            if invalid_sigs:
                summary_parts.append(f"Invalid cryptographic signatures found at indices: {invalid_sigs}.")

        return VerificationReport(
            chain_valid=is_valid,
            missing_indices=missing,
            modified_indices=modified,
            invalid_signatures=invalid_sigs,
            summary=" ".join(summary_parts)
        )
