from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime, timedelta
from app.db.models import ZoneLatest, Incident
from app.models.schemas import Zone, AggregateStats

class PostgresService:
    
    @staticmethod
    def get_latest_zones(db: Session) -> List[Zone]:
        """Récupère toutes les zones depuis PostgreSQL"""
        zones = db.query(ZoneLatest).all()
        return [Zone.from_orm(zone) for zone in zones]
    
    @staticmethod
    def upsert_zone(db: Session, zone_data: dict):
        """Insert ou update une zone"""
        zone = db.query(ZoneLatest).filter(
            ZoneLatest.zone_id == zone_data['zone_id']
        ).first()
        
        if zone:
            for key, value in zone_data.items():
                setattr(zone, key, value)
        else:
            zone = ZoneLatest(**zone_data)
            db.add(zone)
        
        db.commit()
        db.refresh(zone)
        return zone
    
    @staticmethod
    def get_aggregate_stats(db: Session) -> AggregateStats:
        """Calcule les statistiques agrégées"""
        total = db.query(func.count(ZoneLatest.id)).scalar() or 0
        
        fluide = db.query(func.count(ZoneLatest.id)).filter(
            ZoneLatest.congestion_level < 20
        ).scalar() or 0
        
        modere = db.query(func.count(ZoneLatest.id)).filter(
            and_(ZoneLatest.congestion_level >= 20, ZoneLatest.congestion_level < 50)
        ).scalar() or 0
        
        dense = db.query(func.count(ZoneLatest.id)).filter(
            and_(ZoneLatest.congestion_level >= 50, ZoneLatest.congestion_level < 80)
        ).scalar() or 0
        
        bloque = db.query(func.count(ZoneLatest.id)).filter(
            ZoneLatest.congestion_level >= 80
        ).scalar() or 0
        
        avg_speed = db.query(func.avg(ZoneLatest.current_speed)).scalar() or 0
        avg_congestion = db.query(func.avg(ZoneLatest.congestion_level)).scalar() or 0
        
        return AggregateStats(
            total_zones=total,
            fluide=fluide,
            modere=modere,
            dense=dense,
            bloque=bloque,
            avg_global_speed=float(avg_speed),
            avg_global_congestion=float(avg_congestion)
        )
    
    @staticmethod
    def get_top_congested(db: Session, limit: int = 5) -> List[Zone]:
        """Récupère les zones les plus congestionnées"""
        zones = db.query(ZoneLatest).order_by(
            ZoneLatest.congestion_level.desc()
        ).limit(limit).all()
        
        return [Zone.from_orm(zone) for zone in zones]
    
    @staticmethod
    def create_incident(db: Session, incident_data: dict):
        """Crée un incident"""
        incident = Incident(**incident_data)
        db.add(incident)
        db.commit()
        db.refresh(incident)
        return incident
    
    @staticmethod
    def get_active_incidents(db: Session) -> List[Incident]:
        """Récupère les incidents actifs"""
        return db.query(Incident).filter(Incident.resolved == False).all()

postgres_service = PostgresService()