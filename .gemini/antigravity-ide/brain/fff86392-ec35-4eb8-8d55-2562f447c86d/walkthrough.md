# Walkthrough - Unified Risk Engine Implementation

The **Unified Risk Engine** has been successfully built, integrated, and verified within the SentinelX backend (`sentinelx-backend`).

---

## 1. Directory & Package Structure

We created the requested structure under `app/risk_engine/`:

*   [models.py](file:///c:/Users/bhara/OneDrive/Desktop/SentinelX/sentinelx-backend/app/risk_engine/scoring/models.py) – Contains Pydantic schemas for `RiskState`, sub-scores, breakdown metrics, and evaluations.
*   [config.py](file:///c:/Users/bhara/OneDrive/Desktop/SentinelX/sentinelx-backend/app/risk_engine/weights/config.py) – Defines default factor weights, role sensitivities, action base risks, and resource sensitivity multipliers.
*   [profiles.py](file:///c:/Users/bhara/OneDrive/Desktop/SentinelX/sentinelx-backend/app/risk_engine/policies/profiles.py) – Defines configurable risk policies: *Normal Banking Policy*, *High Security Policy*, *Maintenance Window Policy*, and *Emergency Operations Policy*.
*   [engine.py (Calculator)](file:///c:/Users/bhara/OneDrive/Desktop/SentinelX/sentinelx-backend/app/risk_engine/calculator/engine.py) – Coordinates sub-score computations across dimensions: Behaviour, Trust, Device, Location, Time, Action, and Resource.
*   [analyzer.py (Breakdown)](file:///c:/Users/bhara/OneDrive/Desktop/SentinelX/sentinelx-backend/app/risk_engine/breakdown/analyzer.py) – Analyzes and computes the exact percentage contribution of each factor.
*   [tracker.py (Timeline)](file:///c:/Users/bhara/OneDrive/Desktop/SentinelX/sentinelx-backend/app/risk_engine/timeline/tracker.py) – Tracks timestamped session risk history snapshots.
*   [store.py (History)](file:///c:/Users/bhara/OneDrive/Desktop/SentinelX/sentinelx-backend/app/risk_engine/history/store.py) – Logs audit trails of risk changes and reasons.
*   [engine.py (Recommendations)](file:///c:/Users/bhara/OneDrive/Desktop/SentinelX/sentinelx-backend/app/risk_engine/recommendations/engine.py) – Translates aggregated risk into human-readable action recommendations.
*   [manager.py (Orchestrator)](file:///c:/Users/bhara/OneDrive/Desktop/SentinelX/sentinelx-backend/app/risk_engine/manager.py) – Handles lifecycle states (`initialize_risk`, `update_session_risk`, `freeze_risk`, `reset_risk`).

---

## 2. Test Verification

We added 4 comprehensive unit test suites in [test_risk_engine.py](file:///c:/Users/bhara/OneDrive/Desktop/SentinelX/sentinelx-backend/app/risk_engine/tests/test_risk_engine.py). All tests pass successfully:

```bash
.venv\Scripts\python -m pytest
============================== 4 passed in 0.26s ==============================
```

These unit tests validated:
1.  **State Initialization:** Session risk states start at `10.0` (Very Low risk).
2.  **Freeze & Reset Lifecycle:** Risk manager supports freezing state calculations and resetting sessions.
3.  **Deterministic Scoring Logic:** Sub-score calculations, reasons audit logs, and breakdown normalization operate correctly.
4.  **Multi-Policy Support:** Stricter policies like *High Security Policy* produce higher risk scores for the same activities.

---

## 3. Simulation Run Output

We integrated the `RiskEngineManager` into [generator.py](file:///c:/Users/bhara/OneDrive/Desktop/SentinelX/sentinelx-backend/app/simulation/generator.py) to run on every step in the simulation event bus loop. 

Here is an example snippet of the console logs showing the Unified Risk Engine in action:

```text
  [INGESTED] Event ID: EVT-999004
    Action: usb-hardware-mount | Device: SANDISK EXTREME PRO USB | Location: PUNE_HQ_F4
    [BEHAVIOUR] Deviation: 100.0%
    [TRUST ENGINE] Score: 10.0/100 | Level: Critical | Trend: UPWARD
    [RISK ENGINE] Score: 76.78/100 | Level: High | Trend: UPWARD
      Risk increases applied:
        - Delta: +20.0 | Reason: Behaviour deviation detected: 100.0% (Late Login, Unknown IP, Unknown Terminal, Unusual Action)
        - Delta: +20.0 | Reason: Declining session trust standing (Score: 10.0)
        - Delta: +3.0 | Reason: Unknown workstation terminal: SANDISK EXTREME PRO USB
        - Delta: +0.75 | Reason: Off-hours access attempt (Hour: 02:00, Normal: 9-18)
        - Delta: +7.0 | Reason: Execution of sensitive operation: usb-hardware-mount
        - Delta: +2.0 | Reason: Targeting critical asset: system_hardware.usb_drive
      Breakdown:
        * Behaviour: 21.56%
        * Trust: 24.25%
        * Device: 16.17%
        * Location: 0.0%
        * Action: 9.16%
        * Asset: 9.7%
        * Historical: 19.16%
      Recommended Action: Require Manager Approval for Database Transactions
      Reason: High risk activities: Off-hours access attempt (Hour: 02:00, Normal: 9-18), Execution of sensitive operation: usb-hardware-mount, Targeting critical asset: system_hardware.usb_drive.
```
