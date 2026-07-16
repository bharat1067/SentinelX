from typing import Dict, Any
from app.shared.events.schema import SecurityEvent
from app.simulation.personas.profiles import PERSONAS_REGISTRY

class EventParser:
    @staticmethod
    def parse_raw_event(raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Converts raw simulation workflow event format into standard SentinelX schema mapping.
        """
        payload = raw_data.get("payload", {})
        username = raw_data.get("user", "System")
        role = raw_data.get("role", "System")

        # Dynamic user profile registry lookup
        persona = PERSONAS_REGISTRY.get(role)
        user_id = "SYS-000"
        dept = "System Infrastructure"
        location = "Pune Head Office"
        device = "BOM-TERMINAL-GEN"

        if persona and persona.name == username:
            user_id = "EMP-101" if role == "Employee" else ("EMP-103" if role == "SOC Analyst" else "EMP-102")
            dept = persona.department
            location = persona.office_location
            device = persona.normal_device

        # Deduce resource type
        resource = raw_data.get("resource", "unknown")
        res_type = "DATABASE_TABLE"
        if "hardware." in resource:
            res_type = "HARDWARE_DEVICE"
        elif "system_services." in resource:
            res_type = "OS_SERVICE"
        elif "reports." in resource or "/shared/" in resource:
            res_type = "REPORT_FILE"
        elif "backup." in resource:
            res_type = "BACKUP_STORE"

        # Construct raw parsed fields
        parsed = {
            "event_id": raw_data.get("event_id", "EVT-UNKNOWN"),
            "timestamp": raw_data.get("timestamp", ""),
            "session_id": raw_data.get("session_id", "SES-UNKNOWN"),
            "user_id": user_id,
            "username": username,
            "role": role,
            "department": dept,
            "action": raw_data.get("event_type", "UNKNOWN_ACTION"),
            "resource": resource,
            "resource_type": res_type,
            "severity": raw_data.get("severity", "low"),
            "source": raw_data.get("source", "system_daemon"),
            "device": payload.get("terminal_id", payload.get("device_model", device)),
            "location": location,
            "ip_address": payload.get("ip_address", "127.0.0.1"),
            "status": "SUCCESS" if raw_data.get("event_type") != "SESSION_KILL_ACTION" else "TERMINATED",
            "metadata": {k: v for k, v in payload.items() if k not in ["terminal_id", "ip_address"]}
        }
        return parsed
