from pydantic import BaseModel, Field
from typing import List, Dict, Any

class BehaviourProfile(BaseModel):
    username: str = Field(..., description="Unique operator login ID username")
    normal_login_hours: List[int] = Field(default_factory=lambda: [9, 18], description="Normal active hours in IST (e.g. 9 to 18)")
    normal_device_ips: List[str] = Field(default_factory=list, description="List of typical connection source IPs")
    normal_devices: List[str] = Field(default_factory=list, description="List of typical terminal device names")
    allowed_locations: List[str] = Field(default_factory=list, description="Typical geographical workspace tags")
    normal_command_types: List[str] = Field(default_factory=list, description="List of typical operations performed")
    max_download_size_mb: float = Field(50.0, description="Typical upper limit of file sizes downloaded in MB")
    normal_working_days: List[int] = Field(default_factory=lambda: [1, 2, 3, 4, 5], description="Working days: 1 (Mon) to 7 (Sun)")
    is_frozen: bool = Field(False, description="Toggles update operations profile modifications")
    history_weights_count: int = Field(0, description="Weight of historical events integrated into the profile")
