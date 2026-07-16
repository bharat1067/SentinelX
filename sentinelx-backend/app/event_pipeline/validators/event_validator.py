import re
from typing import Dict, Any, Tuple
from pydantic import ValidationError
from app.shared.events.schema import SecurityEvent

class EventValidator:
    ISO_8601_REGEX = re.compile(
        r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$'
    )

    @classmethod
    def validate_event(cls, parsed_data: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Validates event structure, critical columns presence, session prefixes, and schema constraints.
        Returns (is_valid, error_message).
        """
        # 1. Check required fields exist and are not empty
        required = ["event_id", "timestamp", "session_id", "user_id", "action"]
        for field in required:
            if field not in parsed_data or not parsed_data[field]:
                return False, f"Missing required validation column: '{field}'"

        # 2. Verify timestamp ISO format matches regex pattern
        timestamp = parsed_data["timestamp"]
        if not cls.ISO_8601_REGEX.match(timestamp):
            return False, f"Invalid timestamp pattern format: '{timestamp}' (Expected ISO 8601)"

        # 3. Verify session_id starts with correct prefix 'SES-' or 'CYB-'
        session_id = parsed_data["session_id"]
        if not (session_id.startswith("SES-") or session_id.startswith("CYB-")):
            return False, f"Invalid session_id prefix: '{session_id}'"

        # 4. Instantiate Pydantic model to enforce deep typing checks
        try:
            SecurityEvent(**parsed_data)
        except ValidationError as e:
            return False, f"Pydantic schema constraints violation: {str(e)}"

        return True, ""
