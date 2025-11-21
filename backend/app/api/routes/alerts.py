"""
Router pour les alertes trafic en temps réel
"""

from fastapi import APIRouter, HTTPException
from typing import List
import json
import os

router = APIRouter()

ALERTS_FILE = '/tmp/alerts_realtime.json'

@router.get("/")
def get_alerts():
    """
    Récupère toutes les alertes en temps réel depuis Kafka
    """
    try:
        if os.path.exists(ALERTS_FILE):
            with open(ALERTS_FILE, 'r') as f:
                alerts = json.load(f)
            
            # Trier par timestamp (plus récentes en premier)
            alerts.sort(key=lambda x: x.get('time', ''), reverse=True)
            
            return alerts
        else:
            # Si le fichier n'existe pas encore, retourner une liste vide
            return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lecture alertes: {str(e)}")

@router.get("/stats")
def get_alerts_stats():
    """
    Retourne des statistiques sur les alertes
    """
    try:
        if os.path.exists(ALERTS_FILE):
            with open(ALERTS_FILE, 'r') as f:
                alerts = json.load(f)
            
            stats = {
                "total": len(alerts),
                "by_type": {
                    "critical": len([a for a in alerts if a.get('type') == 'critical']),
                    "warning": len([a for a in alerts if a.get('type') == 'warning']),
                    "info": len([a for a in alerts if a.get('type') == 'info']),
                },
                "by_status": {
                    "active": len([a for a in alerts if a.get('status') == 'active']),
                    "ongoing": len([a for a in alerts if a.get('status') == 'ongoing']),
                    "resolved": len([a for a in alerts if a.get('status') == 'resolved']),
                },
                "average_speed": round(
                    sum([a.get('current_speed', 0) for a in alerts]) / len(alerts), 1
                ) if alerts else 0,
                "average_congestion": round(
                    sum([a.get('congestion_level', 0) for a in alerts]) / len(alerts), 1
                ) if alerts else 0
            }
            
            return stats
        else:
            return {
                "total": 0,
                "by_type": {"critical": 0, "warning": 0, "info": 0},
                "by_status": {"active": 0, "ongoing": 0, "resolved": 0},
                "average_speed": 0,
                "average_congestion": 0
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur calcul stats: {str(e)}")

@router.get("/zones/{zone_id}")
def get_alerts_by_zone(zone_id: str):
    """
    Récupère les alertes pour une zone spécifique
    """
    try:
        if os.path.exists(ALERTS_FILE):
            with open(ALERTS_FILE, 'r') as f:
                alerts = json.load(f)
            
            # Filtrer par zone_id
            zone_alerts = [a for a in alerts if a.get('id', '').startswith(zone_id)]
            
            # Trier par timestamp
            zone_alerts.sort(key=lambda x: x.get('time', ''), reverse=True)
            
            return zone_alerts
        else:
            return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lecture alertes: {str(e)}")

@router.delete("/clear")
def clear_alerts():
    """
    Supprime toutes les alertes (pour tests)
    """
    try:
        if os.path.exists(ALERTS_FILE):
            os.remove(ALERTS_FILE)
            return {"message": "Alertes supprimées avec succès"}
        else:
            return {"message": "Aucune alerte à supprimer"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur suppression alertes: {str(e)}")

