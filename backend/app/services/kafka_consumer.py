import json
import logging
from kafka import KafkaConsumer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.database import SessionLocal 
from app.db.models import ZoneLatest 
from datetime import datetime
# Configuration des logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def save_to_db(db: Session, data: dict):
    try:
        # --- CORRECTION DU MAPPING (Adaptation au schéma) ---
        # Si le producer envoie 'name', on le mappe vers 'zone_id' ET 'zone_name'
        if 'name' in data:
            valeur_nom = data.pop('name')
            data['zone_id'] = data.get('zone_id', valeur_nom)
            data['zone_name'] = data.get('zone_name', valeur_nom)

        # Gestion du timestamp (conversion si c'est une chaîne)
        if isinstance(data.get('timestamp'), str):
            data['timestamp'] = datetime.fromisoformat(data['timestamp'])

        zone_id = data.get('zone_id')
        if not zone_id:
            logger.warning("⚠️ Donnée ignorée : zone_id manquant.")
            return

        # --- LOGIQUE UPSERT (Mise à jour ou Insertion) ---
        existing_zone = db.query(ZoneLatest).filter(ZoneLatest.zone_id == zone_id).first()

        if existing_zone:
            # On met à jour l'existant avec les nouvelles valeurs
            for key, value in data.items():
                if hasattr(existing_zone, key):
                    setattr(existing_zone, key, value)
        else:
            # On crée une nouvelle entrée
            new_zone = ZoneLatest(**data)
            db.add(new_zone)

        db.commit()
        logger.info(f"💾 Zone {zone_id} enregistrée avec succès.")

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Erreur DB : {e}")

def run():
    logger.info(f"🚀 Consumer en écoute sur : {settings.KAFKA_TOPIC}")
    
    try:
        consumer = KafkaConsumer(
            settings.KAFKA_TOPIC,
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS, # Doit être kafka:29092
            value_deserializer=lambda x: json.loads(x.decode('utf-8')),
            auto_offset_reset='earliest',
            group_id='traffic_consumer_final_v3', # Nouveau groupe pour forcer la lecture
            enable_auto_commit=True
        )

        db = SessionLocal()
        
        for message in consumer:
            logger.info(f"📥 Message reçu du topic {message.topic}")
            save_to_db(db, message.value)

    except Exception as e:
        logger.error(f"❌ Erreur fatale : {e}")
    finally:
        if 'db' in locals():
            db.close()

if __name__ == "__main__":
    run()