from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ZoneBase(BaseModel):
    zone_id: str
    zone_name: str
    latitude: float
    longitude: float
    current_speed: float
    free_flow_speed: float
    congestion_level: float
    status: str
    timestamp: datetime

class Zone(ZoneBase):
    class Config:
        from_attributes = True

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

class IncidentCreate(BaseModel):
    zone_id: str
    incident_type: str
    severity: str
    speed_drop: float
    timestamp: datetime

class Incident(IncidentCreate):
    id: int
    resolved: bool
    created_at: datetime
    
    class Config:
        from_attributes = True