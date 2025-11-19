from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import Zone, ZoneHistory
from app.services.kafka_consumer import get_latest_zones
from app.services.hdfs_reader import get_zone_history

router = APIRouter()

@router.get("/live", response_model=List[Zone])
async def get_live_zones():
    """Récupère les données temps réel depuis Kafka/PostgreSQL"""
    try:
        zones = get_latest_zones()
        return zones
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{zone_id}", response_model=List[ZoneHistory])
async def get_zone_history_data(zone_id: str, hours: int = 24):
    """Récupère l'historique d'une zone depuis HDFS"""
    try:
        history = get_zone_history(zone_id, hours)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-congested", response_model=List[Zone])
async def get_top_congested(limit: int = 5):
    """Top zones les plus congestionnées"""
    try:
        zones = get_latest_zones()
        sorted_zones = sorted(zones, key=lambda x: x.congestion_level, reverse=True)
        return sorted_zones[:limit]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))