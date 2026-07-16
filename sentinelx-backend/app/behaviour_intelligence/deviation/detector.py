from abc import ABC, abstractmethod
from typing import Dict, Any, List
from app.behaviour_intelligence.profiles.models import BehaviourProfile

class BaseDeviationDetector(ABC):
    @abstractmethod
    def calculate_deviation(self, profile: BehaviourProfile, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Abstract signature to calculate behavior deviation comparing current features vs baseline.
        Enables seamless CNN/Transformer distance modeling conversions.
        """
        pass

class EventDeviationDetector(BaseDeviationDetector):
    def calculate_deviation(self, profile: BehaviourProfile, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compares active features list against the baseline profile parameters.
        Returns a dictionary including explainable reasons and deviation metrics.
        """
        deviation_score = 0.0
        reasons: List[str] = []
        changed_features: List[str] = []

        # 1. Evaluate Login Hours
        hour = features["login_hour"]
        h_min, h_max = profile.normal_login_hours[0], profile.normal_login_hours[1]
        if hour < h_min or hour > h_max:
            deviation_score += 25.0
            reasons.append(f"Late Login (Hour: {hour}:00 outside baseline {h_min}:00-{h_max}:00)")
            changed_features.append("login_hour")

        # 2. Evaluate Working Days
        day = features["day_of_week"]
        if day not in profile.normal_working_days:
            deviation_score += 15.0
            reasons.append("Out of Office Working Days Access")
            changed_features.append("day_of_week")

        # 3. Evaluate Connection Source IP
        ip = features["ip_address"]
        if profile.normal_device_ips and ip not in profile.normal_device_ips:
            deviation_score += 20.0
            reasons.append(f"Unknown Device IP source: {ip}")
            changed_features.append("ip_address")

        # 4. Evaluate Workstation Terminal ID
        device = features["device"]
        if profile.normal_devices and device not in profile.normal_devices:
            deviation_score += 20.0
            reasons.append(f"Unknown Workstation Terminal ID: {device}")
            changed_features.append("device")

        # 5. Evaluate Workspace Location
        location = features["location"]
        if profile.allowed_locations and location not in profile.allowed_locations:
            deviation_score += 25.0
            reasons.append(f"Geographical Distance Location Shift: {location}")
            changed_features.append("location")

        # 6. Evaluate Command Type Action
        action = features["action"]
        if profile.normal_command_types and action not in profile.normal_command_types:
            deviation_score += 15.0
            reasons.append(f"Unusual Command Type Action: {action}")
            changed_features.append("action")

        # 7. Evaluate Database Query Affected Rows
        rows = features["affected_rows"]
        if rows > 1000:
            deviation_score += 30.0
            reasons.append(f"Large Database Record Export (Affected rows: {rows})")
            changed_features.append("affected_rows")

        # 8. Evaluate Security Intrusion Overrides
        if features["is_usb_mounted"]:
            deviation_score += 40.0
            reasons.append("USB Hardware Storage Connected")
            changed_features.append("is_usb_mounted")

        if features["is_audit_disabled"]:
            deviation_score += 50.0
            reasons.append("Audit Logging Daemon Deactivation Attempt")
            changed_features.append("is_audit_disabled")

        if features["is_backdoor_admin_deploy"]:
            deviation_score += 50.0
            reasons.append("Privilege Escalation (Unauthorized Admin User Deployment)")
            changed_features.append("is_backdoor_admin_deploy")

        if features["is_privilege_bypass"]:
            deviation_score += 30.0
            reasons.append("Credential Abuse (CyberArk Vault Privilege Bypass)")
            changed_features.append("is_privilege_bypass")

        # Cap deviation score at 100%
        deviation_percentage = min(deviation_score, 100.0)

        # Baseline learning confidence calculation
        weight = profile.history_weights_count
        confidence_score = min(0.5 + (weight * 0.1), 1.0)

        return {
            "deviation_percentage": deviation_percentage,
            "deviation_reasons": reasons,
            "changed_features": changed_features,
            "confidence_score": confidence_score
        }
