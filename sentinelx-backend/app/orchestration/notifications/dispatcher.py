from typing import Dict, Any

class OrchestrationNotificationDispatcher:
    @staticmethod
    def notify_soc(message: str, incident_id: str) -> str:
        """
        Sends simulated notification to the SOC analysts channel.
        """
        log = f"[NOTIFICATION][SOC-ALERT] Incident: {incident_id} | Msg: {message}"
        print(f"    {log}")
        return log

    @staticmethod
    def notify_manager(message: str, user: str) -> str:
        """
        Sends simulated notification to the Manager escalation channel.
        """
        log = f"[NOTIFICATION][MANAGER-ESCALATION] Target User: {user} | Msg: {message}"
        print(f"    {log}")
        return log
