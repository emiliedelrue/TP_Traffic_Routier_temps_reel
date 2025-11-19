from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Traffic Monitor API",
    description="API temps réel pour monitoring de trafic",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Traffic Monitor API", 
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/api/zones/live")
def get_live_zones():
    """Retourne des données mockées pour tester"""
    return [
        {
            "zone_id": "1",
            "zone_name": "Champs-Élysées",
            "latitude": 48.8698,
            "longitude": 2.3078,
            "current_speed": 35.5,
            "free_flow_speed": 50.0,
            "congestion_level": 29.0,
            "status": "Modéré",
            "timestamp": "2025-11-19T15:30:00"
        },
        {
            "zone_id": "2",
            "zone_name": "Périphérique Nord",
            "latitude": 48.8975,
            "longitude": 2.3397,
            "current_speed": 15.0,
            "free_flow_speed": 70.0,
            "congestion_level": 78.6,
            "status": "Dense",
            "timestamp": "2025-11-19T15:30:00"
        },
        {
            "zone_id": "3",
            "zone_name": "A6 Sud",
            "latitude": 48.8235,
            "longitude": 2.3589,
            "current_speed": 8.0,
            "free_flow_speed": 90.0,
            "congestion_level": 91.1,
            "status": "Bloqué",
            "timestamp": "2025-11-19T15:30:00"
        },
        {
            "zone_id": "4",
            "zone_name": "Porte de Versailles",
            "latitude": 48.8322,
            "longitude": 2.2869,
            "current_speed": 25.0,
            "free_flow_speed": 50.0,
            "congestion_level": 50.0,
            "status": "Dense",
            "timestamp": "2025-11-19T15:30:00"
        },
        {
            "zone_id": "5",
            "zone_name": "Place de la Concorde",
            "latitude": 48.8656,
            "longitude": 2.3212,
            "current_speed": 40.0,
            "free_flow_speed": 50.0,
            "congestion_level": 20.0,
            "status": "Fluide",
            "timestamp": "2025-11-19T15:30:00"
        }
    ]

@app.get("/api/zones/top-congested")
def get_top_congested(limit: int = 5):
    """Top zones les plus congestionnées"""
    zones = get_live_zones()
    sorted_zones = sorted(zones, key=lambda x: x['congestion_level'], reverse=True)
    return sorted_zones[:limit]

@app.get("/api/aggregates/stats")
def get_aggregate_stats():
    """Retourne des stats mockées"""
    return {
        "total_zones": 30,
        "fluide": 8,
        "modere": 12,
        "dense": 7,
        "bloque": 3,
        "avg_global_speed": 42.5,
        "avg_global_congestion": 48.3
    }

@app.get("/api/zones/history/{zone_id}")
def get_zone_history(zone_id: str, hours: int = 24):
    """Historique mockée d'une zone"""
    from datetime import datetime, timedelta
    
    history = []
    now = datetime.now()
    
    for i in range(hours):
        timestamp = now - timedelta(hours=hours-i)
        base_speed = 40 + (i % 10) * 2
        history.append({
            "timestamp": timestamp.isoformat(),
            "avg_speed": base_speed,
            "congestion_level": (1 - base_speed/50) * 100
        })
    
    return history