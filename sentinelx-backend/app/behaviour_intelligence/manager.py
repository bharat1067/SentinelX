from typing import Dict, Any, List
from app.behaviour_intelligence.profiles.models import BehaviourProfile
from app.behaviour_intelligence.feature_extractor.extractor import EventFeatureExtractor
from app.behaviour_intelligence.baseline.learner import BaselineLearner
from app.behaviour_intelligence.deviation.detector import EventDeviationDetector

class BehaviourIntelligenceManager:
    def __init__(self):
        self._profiles: Dict[str, BehaviourProfile] = {}
        self._evaluation_history: List[Dict[str, Any]] = []
        self._feature_extractor = EventFeatureExtractor()
        self._deviation_detector = EventDeviationDetector()

    def get_or_create_profile(self, username: str) -> BehaviourProfile:
        """
        Retrieves or initializes a behavior profile for a user operator.
        """
        if username not in self._profiles:
            # Seed profile with typical administrator bounds
            profile = BehaviourProfile(
                username=username,
                normal_login_hours=[9, 18],
                normal_device_ips=["10.15.2.14"],
                normal_devices=["BOM-DBA-087"],
                allowed_locations=["PUNE_HQ_F4"],
                normal_command_types=["session-initialize", "session-terminate", "db-query-select", "db-maintenance-command"]
            )
            self._profiles[username] = profile
            print(f"[BEHAVIOUR-MANAGER] Instantiated new profile baseline registry for {username}.")
        return self._profiles[username]

    def freeze_profile(self, username: str) -> bool:
        if username in self._profiles:
            self._profiles[username].is_frozen = True
            return True
        return False

    def reset_profile(self, username: str) -> bool:
        if username in self._profiles:
            del self._profiles[username]
            return True
        return False

    def get_evaluation_history(self) -> List[Dict[str, Any]]:
        return self._evaluation_history

    def evaluate_incoming_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates a normalized event, extracts features, detects baseline deviation,
        and slowly evolves the profile baseline.
        """
        username = event.get("username", "System")
        
        # 1. Fetch user profile baseline registry
        profile = self.get_or_create_profile(username)
        
        # 2. Extract features
        features = self._feature_extractor.extract_features(event)
        
        # 3. Detect deviation distance vs baseline
        deviation_result = self._deviation_detector.calculate_deviation(profile, features)
        
        # 4. Evolve baseline metrics slowly (if normal)
        BaselineLearner.update_profile_baseline(profile, features)
        
        # 5. Construct final Behaviour Evaluation Summary (no Risk score)
        summary = {
            "timestamp": event.get("timestamp"),
            "event_id": event.get("event_id"),
            "username": username,
            "session_id": event.get("session_id"),
            "deviation_percentage": deviation_result["deviation_percentage"],
            "deviation_reasons": deviation_result["deviation_reasons"],
            "confidence_score": deviation_result["confidence_score"],
            "changed_features": deviation_result["changed_features"],
            "features_snapshot": features
        }
        
        self._evaluation_history.append(summary)
        return summary
