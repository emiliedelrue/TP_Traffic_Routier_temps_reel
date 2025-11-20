from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.schemas import Zone, ZoneHistory, AggregateStats
from app.services.postgres_service import postgres_service
from app.services.kafka_service import kafka_service
from app.services.postgres_service import postgres_service
from app.services.hdfs_service import hdfs_service

router = APIRouter()

@router.get("/live", response_model=List[Zone])
async def get_live_zones(db: Session = Depends(get_db)):
    """Récupère les données temps réel depuis PostgreSQL"""
    try:
        zones = postgres_service.get_latest_zones(db)
        
        # Si pas de données en DB, essayer Kafka
        if not zones:
            zones = kafka_service.get_latest_zones()
        
        return zones
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-congested", response_model=List[Zone])
async def get_top_congested(limit: int = 5, db: Session = Depends(get_db)):
    """Top zones les plus congestionnées"""
    try:
        return postgres_service.get_top_congested(db, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{zone_id}", response_model=List[ZoneHistory])
async def get_zone_history(zone_id: str, hours: int = 24):
    """Historique d'une zone (mockée pour l'instant)"""
    from datetime import datetime, timedelta
    
    history = []
    now = datetime.now()
    
    for i in range(hours):
        timestamp = now - timedelta(hours=hours-i)
        base_speed = 40 + (i % 10) * 2
        history.append(ZoneHistory(
            timestamp=timestamp,
            avg_speed=base_speed,
            congestion_level=(1 - base_speed/50) * 100
        ))
    
    return history

@router.get("/daily-aggregates")
async def get_daily_aggregates(date: str = None):
    """Agrégats journaliers depuis HDFS"""
    try:
        aggregates = hdfs_service.get_daily_aggregates(date)
        return aggregates
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hdfs-stats")
async def get_hdfs_stats():
    """Statistiques HDFS"""
    try:
        stats = hdfs_service.get_hdfs_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))