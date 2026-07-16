from typing import List, Dict, Any, Optional
from app.simulation.scenarios.workflows import SCENARIOS_REGISTRY
from app.event_pipeline.parsers.event_parser import EventParser
from app.event_pipeline.validators.event_validator import EventValidator
from app.event_pipeline.normalizers.event_normalizer import EventNormalizer
from app.event_pipeline.bus import global_event_bus

class SimulationController:
    def __init__(self):
        self.active_scenario_id: Optional[str] = None
        self.current_step_index: int = 0
        self.is_running: bool = False
        self.speed_multiplier: int = 1

    def load_scenario(self, scenario_id: str) -> bool:
        if scenario_id in SCENARIOS_REGISTRY:
            self.active_scenario_id = scenario_id
            self.current_step_index = 0
            self.is_running = False
            print(f"[SIMULATOR] Loaded scenario {scenario_id}. Steps count: {len(SCENARIOS_REGISTRY[scenario_id])}")
            return True
        print(f"[SIMULATOR] Scenario {scenario_id} not found in registry.")
        return False

    def start(self) -> None:
        if self.active_scenario_id:
            self.is_running = True
            print(f"[SIMULATOR] Simulation run started for {self.active_scenario_id}.")

    def pause(self) -> None:
        self.is_running = False
        print(f"[SIMULATOR] Simulation run paused at step {self.current_step_index}.")

    def resume(self) -> None:
        if self.active_scenario_id:
            self.is_running = True
            print(f"[SIMULATOR] Simulation run resumed.")

    def reset(self) -> None:
        self.current_step_index = 0
        self.is_running = False
        print(f"[SIMULATOR] Simulation reset to step 0.")

    def set_speed(self, speed: int) -> None:
        self.speed_multiplier = speed
        print(f"[SIMULATOR] Playback speed set to {speed}x.")

    def step_forward(self) -> Optional[Dict[str, Any]]:
        if not self.active_scenario_id:
            return None
        
        steps = SCENARIOS_REGISTRY[self.active_scenario_id]
        if self.current_step_index < len(steps):
            raw_event = steps[self.current_step_index]
            
            # 1. Parse raw workflow action
            parsed_event = EventParser.parse_raw_event(raw_event)
            
            # 2. Validate parsed event integrity
            is_valid, err_msg = EventValidator.validate_event(parsed_event)
            if not is_valid:
                print(f"[SIMULATOR][VALIDATION-REJECTED] Step index {self.current_step_index}: {err_msg}")
                self.current_step_index += 1
                return None
                
            # 3. Normalize values
            normalized_event = EventNormalizer.normalize_event(parsed_event)
            
            # 4. Ingest normalized event to the Event Bus
            global_event_bus.publish(normalized_event)
            
            print(f"[SIMULATOR][STEP-FORWARD] Index {self.current_step_index}: Ingested normalized {normalized_event['event_id']} ({normalized_event['action']})")
            self.current_step_index += 1
            return normalized_event
        else:
            print("[SIMULATOR] End of scenario timeline steps reached.")
            self.is_running = False
            return None

    def step_backward(self) -> Optional[Dict[str, Any]]:
        if not self.active_scenario_id or self.current_step_index <= 0:
            return None
        
        self.current_step_index -= 1
        steps = SCENARIOS_REGISTRY[self.active_scenario_id]
        raw_event = steps[self.current_step_index]
        
        # Re-derive reverted state event details
        parsed_event = EventParser.parse_raw_event(raw_event)
        normalized_event = EventNormalizer.normalize_event(parsed_event)
        
        print(f"[SIMULATOR][STEP-BACKWARD] Index {self.current_step_index}: Reverting to state after {normalized_event['event_id']}")
        return normalized_event

    def get_progress_percentage(self) -> int:
        if not self.active_scenario_id:
            return 0
        steps_count = len(SCENARIOS_REGISTRY[self.active_scenario_id])
        if steps_count == 0:
            return 0
        return int((self.current_step_index / steps_count) * 100)
