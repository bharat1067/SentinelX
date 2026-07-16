from abc import ABC, abstractmethod
from typing import Dict, Any
from datetime import datetime

class BaseFeatureExtractor(ABC):
    @abstractmethod
    def extract_features(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Abstract signature to extract behavior features dictionary from normalized event dictionary.
        Allows seamless replacement with deep neural embeddings or CNN extractors.
        """
        pass

class EventFeatureExtractor(BaseFeatureExtractor):
    def extract_features(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extracts statistical and operational feature metrics from normalized security logs.
        """
        metadata = event.get("metadata", {})
        
        # 1. Parse time indices from timestamp
        ts_str = event.get("timestamp", "")
        login_hour = 12
        day_of_week = 1
        
        if ts_str:
            try:
                # Standard ISO 8601 parsing support (handles trailing Z or offset)
                clean_ts = ts_str.replace("Z", "")
                if "+" in clean_ts:
                    clean_ts = clean_ts.split("+")[0]
                dt = datetime.fromisoformat(clean_ts)
                login_hour = dt.hour
                day_of_week = dt.isoweekday() # 1 to 7
            except Exception:
                pass

        # 2. Extract size variables if download or report file
        download_size_mb = 0.0
        # If size is given (e.g. "18.2 MB" or in bytes)
        size_str = metadata.get("size", "")
        if size_str:
            try:
                if "MB" in size_str:
                    download_size_mb = float(size_str.replace("MB", "").strip())
                elif "GB" in size_str:
                    download_size_mb = float(size_str.replace("GB", "").strip()) * 1024
            except Exception:
                pass

        # 3. Detect flag anomalies
        action = event.get("action", "")
        
        features = {
            "login_hour": login_hour,
            "day_of_week": day_of_week,
            "action": action,
            "device": event.get("device", "UNKNOWN"),
            "location": event.get("location", "UNKNOWN"),
            "ip_address": event.get("ip_address", "127.0.0.1"),
            "resource": event.get("resource", "unknown"),
            "is_usb_mounted": action == "usb-hardware-mount",
            "is_audit_disabled": action == "audit-deactivate-attempt",
            "is_backdoor_admin_deploy": action == "backdoor-admin-deploy",
            "is_privilege_bypass": action == "db-privilege-bypass",
            "affected_rows": int(metadata.get("affected_rows", 0)),
            "download_size_mb": download_size_mb
        }
        return features
