from typing import Dict, Any

class EventNormalizer:
    @staticmethod
    def normalize_event(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalizes keys parameters:
        - Time: ensures trailing Z and 'T' separator
        - Severity: UPPERCASE
        - Device: UPPERCASE
        - Location: harmonized enum format
        - Action Names: lowercase with hyphens
        """
        normalized = data.copy()

        # 1. Normalize Timestamp
        ts = normalized.get("timestamp", "")
        if ts:
            ts = ts.replace(" ", "T")
            if not ts.endswith("Z") and not ("+" in ts or "-" in ts[10:]):
                ts = ts + "Z"
            normalized["timestamp"] = ts

        # 2. Normalize Severity
        severity = normalized.get("severity", "LOW").upper()
        if severity == "WARN":
            severity = "MEDIUM"
        normalized["severity"] = severity

        # 3. Normalize Device
        device = normalized.get("device", "UNKNOWN").upper()
        normalized["device"] = device

        # 4. Normalize Location
        loc = normalized.get("location", "PUNE HEAD OFFICE").upper()
        if "PUNE" in loc:
            loc = "PUNE_HQ_F4"
        elif "SOC" in loc or "CYBER COMMAND" in loc:
            loc = "MUMBAI_SOC_C3"
        elif "MUMBAI" in loc or "HEAD OFFICE" in loc:
            loc = "MUMBAI_HQ_F1"
        normalized["location"] = loc

        # 5. Normalize Action Names (e.g. DB_QUERY_SELECT -> db-query-select)
        action = normalized.get("action", "unknown_action").lower()
        action = action.replace("_", "-")
        normalized["action"] = action

        return normalized
