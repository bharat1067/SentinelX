from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple, List
from app.trust_engine.metrics.models import TrustState

class BaseTrustCalculator(ABC):
    @abstractmethod
    def evaluate_trust(self, state: TrustState, evaluation: Dict[str, Any]) -> Tuple[float, List[Dict[str, Any]]]:
        """
        Abstract signature to calculate active trust adjustments based on behaviour summaries.
        Allows swap-ins of LSTM/Autoencoder sequences models in future architecture releases.
        Returns (new_score, deltas_list).
        """
        pass

class DynamicTrustCalculator(BaseTrustCalculator):
    # Rule weight mapping configs
    RULE_PENALTIES = {
        "Late Login": -10.0,
        "Unknown Device IP": -15.0,
        "Unknown Workstation Terminal ID": -15.0,
        "Geographical Distance Location Shift": -20.0,
        "Unusual Command Type Action": -10.0,
        "Large Database Record Export": -25.0,
        "Credential Abuse": -40.0,
    }

    CRITICAL_TRIGGERS = {
        "USB Hardware Storage Connected": 10.0,
        "Audit Logging Daemon Deactivation Attempt": 5.0,
        "Privilege Escalation": 5.0
    }

    def evaluate_trust(self, state: TrustState, evaluation: Dict[str, Any]) -> Tuple[float, List[Dict[str, Any]]]:
        """
        Applies weighted evaluation rules on behavior deviation results.
        Enforces dynamic recovery and critical plunge indicators.
        """
        if state.is_frozen:
            return state.current_trust, []

        current = state.current_trust
        dev_pct = evaluation.get("deviation_percentage", 0.0)
        reasons = evaluation.get("deviation_reasons", [])
        
        deltas: List[Dict[str, Any]] = []

        # 1. Check for Critical Plunge Triggers
        critical_active = False
        target_critical_score = 100.0

        for crit_reason, score_limit in self.CRITICAL_TRIGGERS.items():
            # Match partial reason strings
            if any(crit_reason in r for r in reasons):
                critical_active = True
                target_critical_score = min(target_critical_score, score_limit)

        if critical_active:
            delta = target_critical_score - current
            deltas.append({
                "delta": delta,
                "reason": f"Critical compromise signature: {', '.join(reasons)}"
            })
            new_score = target_critical_score
        
        # 2. Check for normal baseline alignment (recovery)
        elif dev_pct == 0.0:
            if current < 100.0:
                delta = min(2.0, 100.0 - current)
                deltas.append({
                    "delta": delta,
                    "reason": "Consistent Baseline Activity"
                })
                new_score = current + delta
            else:
                new_score = 100.0
        
        # 3. Apply standard cumulative penalties
        else:
            total_penalty = 0.0
            applied_reasons = []

            for penalty_key, value in self.RULE_PENALTIES.items():
                if any(penalty_key in r for r in reasons):
                    total_penalty += value
                    applied_reasons.append(penalty_key)

            # Fallback minor penalty if deviation is positive but no specific rule matched
            if total_penalty == 0.0:
                total_penalty = -5.0
                applied_reasons.append("Minor Baseline Deviation Shift")

            deltas.append({
                "delta": total_penalty,
                "reason": f"Anomalous behaviors: {', '.join(applied_reasons)}"
            })
            new_score = max(0.0, current + total_penalty)

        return new_score, deltas

    @staticmethod
    def map_score_to_level(score: float) -> str:
        if score >= 90.0:
            return "Very High"
        elif score >= 70.0:
            return "High"
        elif score >= 50.0:
            return "Medium"
        elif score >= 30.0:
            return "Low"
        else:
            return "Critical"
