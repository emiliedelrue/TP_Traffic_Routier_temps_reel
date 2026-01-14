import json
import time
import random
from datetime import datetime
from kafka import KafkaProducer

# Configuration
KAFKA_BOOTSTRAP = 'kafka:29092'
TOPIC = 'traffic-data'

# Zones de Paris
ZONES = [
    {"id": "champs_elysees", "name": "Champs-Élysées", "lat": 48.8698, "lon": 2.3078},
    {"id": "peripherique_nord", "name": "Périphérique Nord", "lat": 48.8975, "lon": 2.3397},
    {"id": "a6_sud", "name": "A6 Sud", "lat": 48.8235, "lon": 2.3589},
    {"id": "porte_versailles", "name": "Porte de Versailles", "lat": 48.8322, "lon": 2.2869},
    {"id": "concorde", "name": "Place de la Concorde", "lat": 48.8656, "lon": 2.3212}
]

def generate_traffic_data():
    """Génère des données de trafic réalistes"""
    zone = random.choice(ZONES)
    free_flow = 60.0
    current_speed = random.uniform(30, 60)
    congestion = ((free_flow - current_speed) / free_flow) * 100
    
    if congestion < 15:
        status = "Fluide"
    elif congestion < 40:
        status = "Modéré"
    else:
        status = "Dense"
    
    return {
        "zone_id": zone["id"],
        "zone_name": zone["name"],
        "latitude": zone["lat"],
        "longitude": zone["lon"],
        "current_speed": round(current_speed, 1),
        "free_flow_speed": free_flow,
        "congestion_level": round(congestion, 2),
        "status": status,
        "timestamp": datetime.now().isoformat()
    }

def main():
    print("🚀 Démarrage du producteur Kafka...")
    
    producer = KafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP,
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
    
    print(f"✅ Connecté à Kafka: {KAFKA_BOOTSTRAP}")
    print(f"📡 Topic: {TOPIC}")
    print("🔄 Génération de données (Ctrl+C pour arrêter)...\n")
    
    count = 0
    try:
        while True:
            data = generate_traffic_data()
            producer.send(TOPIC, value=data)
            count += 1
            
            if count % 10 == 0:
                print(f"✅ {count} messages envoyés | Dernière zone: {data['zone_name']} - {data['status']}")
            
            time.sleep(2)  # Envoi toutes les 2 secondes
            
    except KeyboardInterrupt:
        print(f"\n⏹️  Arrêt du producteur. Total: {count} messages")
    finally:
        producer.close()

if __name__ == "__main__":
    main()
