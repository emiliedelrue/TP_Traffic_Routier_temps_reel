from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.sql import func
from app.db.database import Base

class ZoneLatest(Base):
    __tablename__ = "zones_latest"
    
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String, unique=True, index=True)
    zone_name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    current_speed = Column(Float)
    free_flow_speed = Column(Float)
    congestion_level = Column(Float)
    status = Column(String)
    timestamp = Column(DateTime)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Incident(Base):
    __tablename__ = "incidents"
    
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String, index=True)
    incident_type = Column(String)
    severity = Column(String)
    speed_drop = Column(Float)
    timestamp = Column(DateTime)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())