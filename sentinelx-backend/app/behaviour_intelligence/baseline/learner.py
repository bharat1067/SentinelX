from typing import Dict, Any
from app.behaviour_intelligence.profiles.models import BehaviourProfile

class BaselineLearner:
    ALPHA = 0.05 # Learning rate factor for slow moving averages

    @classmethod
    def update_profile_baseline(
        cls,
        profile: BehaviourProfile,
        features: Dict[str, Any],
        current_risk_score: float = 0.0,
        has_open_incident: bool = False,
        is_session_suspicious: bool = False,
        is_investigation_pending: bool = False
    ) -> None:
        """
        Learns and evolves baseline metrics slowly using moving weights.
        Protects against baseline poisoning by ignoring features that are extremely anomalous
        or when risk thresholds are exceeded.
        """
        if profile.is_frozen:
            print(f"[BASELINE-LEARNER] Profile {profile.username} is explicitly frozen. Skipping adapt update.")
            return

        # 1. Flagged event anomalies protection check
        if (features.get("is_usb_mounted") or 
            features.get("is_audit_disabled") or 
            features.get("is_backdoor_admin_deploy") or 
            features.get("is_privilege_bypass")):
            print(f"[BASELINE-LEARNER] Flagged anomaly signature detected for {profile.username}. Skipping adapt update.")
            return

        # 2. Risk Engine & State based poisoning protections
        if current_risk_score >= 70.0:  # High/Critical risk threshold
            print(f"[BASELINE-LEARNER] Freezing baseline updates due to high risk profile score: {current_risk_score}.")
            return
        if has_open_incident:
            print(f"[BASELINE-LEARNER] Freezing baseline updates due to open active incident ticket.")
            return
        if is_session_suspicious:
            print(f"[BASELINE-LEARNER] Freezing baseline updates due to suspicious session tracking.")
            return
        if is_investigation_pending:
            print(f"[BASELINE-LEARNER] Freezing baseline updates due to pending manager signature validation.")
            return

        # 3. Check login hour deviation. If it is way outside typical hours, do not learn it.
        hour = features.get("login_hour", 12)
        normal_hours = profile.normal_login_hours or [9, 18]
        if hour < 5 or hour > 23:
            print(f"[BASELINE-LEARNER] Anomalous hour {hour}:00 for {profile.username}. Skipping baseline adapt update.")
            return

        # 4. Update categorical lists (devices, IPs, locations, commands)
        if features.get("ip_address") and features["ip_address"] not in profile.normal_device_ips:
            profile.normal_device_ips.append(features["ip_address"])
        if features.get("device") and features["device"] not in profile.normal_devices:
            profile.normal_devices.append(features["device"])
        if features.get("location") and features["location"] not in profile.allowed_locations:
            profile.allowed_locations.append(features["location"])
        if features.get("action") and features["action"] not in profile.normal_command_types:
            profile.normal_command_types.append(features["action"])

        # 5. Slowly evolve continuous metrics (e.g. max download limits)
        affected_rows = features.get("affected_rows", 0)
        if 0 < affected_rows < 1000: # ignore massive spikes
            profile.max_download_size_mb = (
                (1 - cls.ALPHA) * profile.max_download_size_mb + cls.ALPHA * (affected_rows * 0.01)
            )

        profile.history_weights_count += 1
        print(f"[BASELINE-LEARNER] Evolved behaviour baseline for {profile.username}. Weight count: {profile.history_weights_count}")

    @classmethod
    def reset_profile_baseline(cls, profile: BehaviourProfile) -> None:
        """
        Manually clears profile baseline metrics to system starting configurations.
        """
        profile.normal_login_hours = [9, 18]
        profile.normal_device_ips = []
        profile.normal_devices = []
        profile.allowed_locations = []
        profile.normal_command_types = []
        profile.max_download_size_mb = 50.0
        profile.history_weights_count = 0
        profile.is_frozen = False
        print(f"[BASELINE-LEARNER] Reset baseline values manually for {profile.username}.")
