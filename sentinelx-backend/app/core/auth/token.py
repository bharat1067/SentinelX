import hmac
import hashlib
import base64
import json
import time
from typing import Optional

SECRET_KEY = "sentinelx_secret_key_change_in_prod"

def create_access_token(data: dict, expires_in: int = 3600) -> str:
    """
    Generates a secure cryptographically-signed access token (JWT-like).
    """
    payload = data.copy()
    payload["exp"] = int(time.time()) + expires_in
    
    # Base64 encode header and payload
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    
    signing_input = f"{header_b64}.{payload_b64}"
    
    # Signature
    signature = hmac.new(SECRET_KEY.encode(), signing_input.encode(), hashlib.sha256).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def decode_access_token(token: str) -> Optional[dict]:
    """
    Decodes and verifies a signature-signed token, returning the payload if valid.
    """
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature_b64 = parts
        
        signing_input = f"{header_b64}.{payload_b64}"
        
        # Verify signature
        expected_sig = hmac.new(SECRET_KEY.encode(), signing_input.encode(), hashlib.sha256).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")
        
        if not hmac.compare_digest(signature_b64, expected_sig_b64):
            return None
            
        # Add padding to base64 string
        pad_len = len(payload_b64) % 4
        if pad_len:
            payload_b64 += "=" * (4 - pad_len)
            
        payload = json.loads(base64.urlsafe_b64decode(payload_b64.encode()).decode())
        
        # Verify expiration
        if payload.get("exp", 0) < time.time():
            return None
            
        return payload
    except Exception:
        return None
