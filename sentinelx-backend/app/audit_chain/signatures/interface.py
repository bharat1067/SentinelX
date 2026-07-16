import hashlib
from typing import Dict, Any

class QuantumSignatureProvider:
    """
    Abstractions for Post-Quantum Cryptography (PQC) digital signatures.
    Designed so real ML-KEM/Kyber or ML-DSA/Dilithium libraries can replace
    these interfaces without modifying application business layers.
    """
    def __init__(self, algorithm: str = "ML-DSA-87"):
        self.algorithm = algorithm

    def sign_payload(self, payload: str) -> str:
        """
        Generates a mock quantum signature using the selected algorithm marker
        and payload hash value.
        """
        payload_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16].upper()
        return f"SIG-{self.algorithm}-{payload_hash}"

    def verify_signature(self, payload: str, signature: str) -> bool:
        """
        Verifies that the signature string matches the expected signature
        for the given payload hash.
        """
        expected = self.sign_payload(payload)
        return expected == signature
