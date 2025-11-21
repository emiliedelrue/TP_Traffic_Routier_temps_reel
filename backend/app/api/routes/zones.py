from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.schemas import Zone, ZoneHistory, AggregateStats
from app.services.postgres_service import postgres_service
from app.services.kafka_service import kafka_service

try:
    from app.services.hdfs_service import hdfs_service
    HDFS_AVAILABLE = True
except Exception as e:
    print(f"  HDFS service non disponible : {e}")
    HDFS_AVAILABLE = False

router = APIRouter()

@router.get("/live", response_model=List[Zone])
async def get_live_zones(db: Session = Depends(get_db)):
    """Récupère les données temps réel depuis PostgreSQL"""
    try:
        zones = postgres_service.get_latest_zones(db)
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
async def get_zone_history(zone_id: str, days: int = 7):
    """
    Historique d'une zone depuis HDFS
    Si HDFS non disponible, retourne des données mockées
    """
    if HDFS_AVAILABLE:
        try:
            history_data = hdfs_service.get_zone_history(zone_id, days)
            
            if history_data:
                return [
                    ZoneHistory(
                        timestamp=item["timestamp"],
                        avg_speed=item["avg_speed"],
                        congestion_level=item["avg_congestion"]
                    )
                    for item in history_data
                ]
        except Exception as e:
            print(f"  Erreur lecture HDFS, fallback sur mock : {e}")
    
    from datetime import datetime, timedelta
    history = []
    now = datetime.now()
    hours = days * 24
    
    for i in range(0, hours, 2):  
        timestamp = now - timedelta(hours=hours-i)
        base_speed = 40 + (i % 10) * 2
        history.append(ZoneHistory(
            timestamp=timestamp,
            avg_speed=base_speed,
            congestion_level=(1 - base_speed/50) * 100
        ))
    
    return history
@router.get("/weekly-data")
async def get_weekly_data(days: int = 7):
    """
    Données hebdomadaires agrégées depuis HDFS
    @param days: Nombre de jours à récupérer (défaut: 7)
    """
    if not HDFS_AVAILABLE:
        return generate_mock_weekly_data(days)
    
    try:
        data = hdfs_service.get_weekly_data(days)
        return data if data else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur HDFS : {str(e)}")

@router.get("/hourly-distribution")
async def get_hourly_distribution(days: int = 7):
    """
    Distribution horaire moyenne depuis HDFS
    @param days: Nombre de jours pour calculer la moyenne (défaut: 7)
    """
    if not HDFS_AVAILABLE:
        return generate_mock_hourly_data()
    
    try:
        data = hdfs_service.get_hourly_distribution(days)
        return data if data else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur HDFS : {str(e)}")

def generate_mock_weekly_data(days: int):
    """Génère des données mockées selon le nombre de jours"""
    from datetime import datetime, timedelta
    
    result = []
    for i in range(min(days, 7)): 
        date = datetime.now() - timedelta(days=days-i)
        result.append({
            "date": date.strftime("%Y-%m-%d"),
            "congestion": 45 + (i * 5) % 30,
            "speed": 40 + (i * 3) % 20,
            "measures": 120
        })
    return result


@router.get("/hdfs-stats")
async def get_hdfs_stats():
    """
    Statistiques sur les données HDFS
    Nombre d'enregistrements, plage de dates, etc.
    """
    if not HDFS_AVAILABLE:
        return {
            "available": False,
            "message": "Service HDFS non disponible"
        }
    
    try:
        stats = hdfs_service.get_hdfs_stats()
        return {
            "available": True,
            **stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur HDFS : {str(e)}")

@router.get("/health")
async def health_check():
    """Health check de l'API zones"""
    return {
        "status": "healthy",
        "hdfs_available": HDFS_AVAILABLE,
        "services": {
            "postgres": "available",
            "kafka": "available",
            "hdfs": "available" if HDFS_AVAILABLE else "unavailable"
        }
    }