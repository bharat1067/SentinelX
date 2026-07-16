from datetime import datetime
from typing import Dict, Any, Tuple, List
from app.risk_engine.scoring.models import RiskSubScores
from app.risk_engine.policies.profiles import RiskPolicy
from app.risk_engine.weights.config import ACTION_BASE_RISK, RESOURCE_SENSITIVITY, ROLE_SENSITIVITY

class RiskCalculator:
    @staticmethod
    def calculate_session_risk(
        event: Dict[str, Any],
        behaviour_summary: Dict[str, Any],
        trust_summary: Dict[str, Any],
        historical_profile: Any,
        policy: RiskPolicy,
        previous_score: float
    ) -> Tuple[RiskSubScores, List[Dict[str, Any]], float]:
        """
        Deterministically calculates the session's risk sub-scores, compiles
        explainable delta logs, and computes the final risk score.
        """
        deltas: List[Dict[str, Any]] = []

        # 1. Calculate Behaviour Risk (derived from deviation percentage)
        dev_pct = behaviour_summary.get("deviation_percentage", 0.0)
        behaviour_risk = float(dev_pct)
        if dev_pct > 0.0:
            deltas.append({
                "delta": dev_pct * policy.get_weight("behaviour"),
                "reason": f"Behaviour deviation detected: {dev_pct}% ({', '.join(behaviour_summary.get('deviation_reasons', []))})"
            })

        # 2. Calculate Trust Risk (inverse of trust score)
        trust_score = trust_summary.get("current_trust_score", 90.0)
        trust_risk = 100.0 - trust_score
        if trust_score < 90.0:
            trust_drop = 90.0 - trust_score
            deltas.append({
                "delta": trust_drop * policy.get_weight("trust"),
                "reason": f"Declining session trust standing (Score: {trust_score})"
            })

        # 3. Calculate Device Risk (anomaly check)
        event_device = event.get("device", "UNKNOWN").upper()
        profile_devices = [d.upper() for d in getattr(historical_profile, "normal_devices", [])]
        
        if profile_devices and event_device not in profile_devices:
            device_risk = 100.0
            deltas.append({
                "delta": 20.0 * policy.get_weight("device"),
                "reason": f"Unknown workstation terminal: {event_device}"
            })
        else:
            device_risk = 0.0

        # 4. Calculate Location Risk (anomaly check)
        event_location = event.get("location", "UNKNOWN").upper()
        profile_locations = [l.upper() for l in getattr(historical_profile, "allowed_locations", [])]
        
        if profile_locations and event_location not in profile_locations:
            location_risk = 100.0
            deltas.append({
                "delta": 20.0 * policy.get_weight("location"),
                "reason": f"Access from unauthorized location: {event_location}"
            })
        else:
            location_risk = 0.0

        # 5. Calculate Time Risk (working hours check)
        time_risk = 0.0
        ts_str = event.get("timestamp", "")
        if ts_str:
            try:
                # Expect ISO format like 2026-07-15T02:15:00Z or similar
                clean_ts = ts_str.replace("Z", "")
                if "T" in clean_ts:
                    time_part = clean_ts.split("T")[1]
                    hour = int(time_part.split(":")[0])
                else:
                    hour = datetime.strptime(clean_ts, "%Y-%m-%d %H:%M:%S").hour
                
                normal_hours = getattr(historical_profile, "normal_login_hours", [9, 18])
                if hour < normal_hours[0] or hour > normal_hours[1]:
                    time_risk = 100.0
                    deltas.append({
                        "delta": 15.0 * policy.get_weight("time"),
                        "reason": f"Off-hours access attempt (Hour: {hour:02d}:00, Normal: {normal_hours[0]}-{normal_hours[1]})"
                    })
            except Exception:
                pass

        # 6. Calculate Action Risk (derived from operational severity config)
        action_name = event.get("action", "").lower().replace("_", "-")
        action_base = ACTION_BASE_RISK.get(action_name, 15.0)
        action_risk = action_base
        if action_base > 20.0:
            deltas.append({
                "delta": (action_base - 15.0) * policy.get_weight("action"),
                "reason": f"Execution of sensitive operation: {action_name}"
            })

        # 7. Calculate Resource Risk (derived from asset criticality)
        resource_name = event.get("resource", "")
        resource_mult = RESOURCE_SENSITIVITY.get(resource_name, 1.0)
        resource_risk = min(100.0, 50.0 * resource_mult)
        if resource_mult > 1.0:
            deltas.append({
                "delta": 25.0 * (resource_mult - 1.0) * policy.get_weight("resource"),
                "reason": f"Targeting critical asset: {resource_name}"
            })

        # Combine into sub-score models
        sub_scores = RiskSubScores(
            behaviour_risk=behaviour_risk,
            trust_risk=trust_risk,
            device_risk=device_risk,
            location_risk=location_risk,
            time_risk=time_risk,
            action_risk=action_risk,
            resource_risk=resource_risk
        )

        # 8. Compute weighted base score
        raw_weighted = (
            behaviour_risk * policy.get_weight("behaviour") +
            trust_risk * policy.get_weight("trust") +
            device_risk * policy.get_weight("device") +
            location_risk * policy.get_weight("location") +
            time_risk * policy.get_weight("time") +
            action_risk * policy.get_weight("action") +
            resource_risk * policy.get_weight("resource")
        )

        # 9. Apply role & resource multipliers
        role = event.get("role", "Employee")
        role_mult = policy.get_role_multiplier(role)
        final_resource_mult = policy.get_resource_multiplier(resource_name)

        # Base offset from policy
        aggregated_score = (raw_weighted * role_mult * final_resource_mult) + policy.base_offset
        
        # Soft-mix with previous historical score (20% history, 80% current)
        final_score = (0.8 * aggregated_score) + (0.2 * previous_score)
        final_score = max(0.0, min(100.0, final_score))

        return sub_scores, deltas, final_score
