from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.schemas import AggregateStats
from app.services.postgres_service import postgres_service

router = APIRouter()

@router.get("/stats", response_model=AggregateStats)
async def get_aggregate_stats(db: Session = Depends(get_db)):
    """Statistiques globales du réseau"""
    return postgres_service.get_aggregate_stats(db)