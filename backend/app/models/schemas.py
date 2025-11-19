from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Zone(BaseModel):
    zone_id: str
    zone_name: str
    latitude: float
    longitude: float
    current_speed: float
    free_flow_speed: float
    congestion_level: float
    status: str  
    timestamp: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "zone_id": "paris_champs_elysees",
                "zone_name": "Champs-Élysées",
                "latitude": 48.8698,
                "longitude": 2.3078,
                "current_speed": 35.5,
                "free_flow_speed": 50.0,
                "congestion_level": 29.0,
                "status": "Modéré",
                "timestamp": "2025-11-19T15:30:00"
            }
        }

class ZoneHistory(BaseModel):
    timestamp: datetime
    avg_speed: float
    congestion_level: float

class AggregateStats(BaseModel):
    total_zones: int
    fluide: int
    modere: int
    dense: int
    bloque: int
    avg_global_speed: float
    avg_global_congestion: float