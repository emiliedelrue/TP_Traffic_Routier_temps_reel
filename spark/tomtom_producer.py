#!/usr/bin/env python3
"""
Producteur Kafka - API TomTom Traffic
Récupère les données de trafic en temps réel et les envoie à Kafka
"""

import requests
import json
import time
from kafka import KafkaProducer
from datetime import datetime
import sys
import os
from dotenv import load_dotenv

load_dotenv()

TOMTOM_API_KEY = os.getenv('TOMTOM_API_KEY', 'VOTRE_CLE_API')
KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
KAFKA_TOPIC = os.getenv('KAFKA_TOPIC_RAW', 'traffic_raw')

ZONES = [
    {"name": "Champs-Élysées", "lat": 48.8698, "lon": 2.3078},
    {"name": "Périphérique Nord", "lat": 48.8975, "lon": 2.3397},
    {"name": "A6 Sud", "lat": 48.8235, "lon": 2.3589},
    {"name": "Porte de Versailles", "lat": 48.8322, "lon": 2.2869},
    {"name": "Place de la Concorde", "lat": 48.8656, "lon": 2.3212},
    {"name": "Porte d'Orléans", "lat": 48.8234, "lon": 2.3266},
    {"name": "La Défense", "lat": 48.8920, "lon": 2.2380},
    {"name": "Gare du Nord", "lat": 48.8809, "lon": 2.3553},
]

class TomTomProducer:
    def __init__(self):
        self.producer = KafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS.split(','),
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8') if k else None
        )
        print(f" Producteur Kafka connecté: {KAFKA_BOOTSTRAP_SERVERS}")
    
    def fetch_traffic_data(self, lat, lon):
        """Récupère les données de trafic depuis TomTom API"""
        url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
        
        params = {
            'key': TOMTOM_API_KEY,
            'point': f"{lat},{lon}",
            'unit': 'KMPH'
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f" Erreur API TomTom: {e}")
            return None
    
    def format_message(self, zone, traffic_data):
        """Formate les données pour Kafka"""
        if not traffic_data or 'flowSegmentData' not in traffic_data:
            return None
        
        flow_data = traffic_data['flowSegmentData']
        
        return {
            'zone_id': zone['name'].lower().replace(' ', '_').replace("'", ''),
            'zone_name': zone['name'],
            'latitude': zone['lat'],
            'longitude': zone['lon'],
            'current_speed': flow_data.get('currentSpeed', 0),
            'free_flow_speed': flow_data.get('freeFlowSpeed', 50),
            'current_travel_time': flow_data.get('currentTravelTime', 0),
            'free_flow_travel_time': flow_data.get('freeFlowTravelTime', 0),
            'confidence': flow_data.get('confidence', 0),
            'timestamp': datetime.utcnow().isoformat(),
            'source': 'tomtom_api'
        }
    
    def send_to_kafka(self, message, key):
        """Envoie le message à Kafka"""
        try:
            future = self.producer.send(KAFKA_TOPIC, value=message, key=key)
            result = future.get(timeout=10)
            return result
        except Exception as e:
            print(f" Erreur envoi Kafka: {e}")
            return None
    
    def run(self, interval=60, continuous=True):
        """Boucle principale"""
        print(f"\n Démarrage producteur TomTom → Kafka")
        print(f" Zones surveillées: {len(ZONES)}")
        print(f"  Intervalle: {interval}s")
        print(f" Mode: {'Continu' if continuous else 'Unique'}\n")
        
        iteration = 0
        
        try:
            while True:
                iteration += 1
                print(f"{'='*60}")
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Itération #{iteration}")
                print(f"{'='*60}")
                
                for zone in ZONES:
                    print(f"\n📡 Zone: {zone['name']}")
                    
                    traffic_data = self.fetch_traffic_data(zone['lat'], zone['lon'])
                    
                    if traffic_data:
                        message = self.format_message(zone, traffic_data)
                        
                        if message:
                            result = self.send_to_kafka(message, message['zone_id'])
                            
                            if result:
                                print(f"   Envoyé: {message['current_speed']:.1f} km/h")
                                print(f"   Partition: {result.partition}, Offset: {result.offset}")
                            else:
                                print(f"   Échec envoi")
                        else:
                            print(f"    Données invalides")
                    else:
                        print(f"   Échec récupération API")
                    
                    time.sleep(2)
                
                print(f"\n{'='*60}")
                print(f"Itération #{iteration} terminée")
                print(f"{'='*60}\n")
                
                if not continuous:
                    break
                
                # Attendre avant la prochaine itération
                print(f"⏳ Attente {interval}s avant prochaine itération...\n")
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n\n Arrêt du producteur...")
        finally:
            self.producer.close()
            print(" Producteur fermé proprement\n")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Producteur TomTom → Kafka')
    parser.add_argument('--interval', type=int, default=60, help='Intervalle en secondes (défaut: 60)')
    parser.add_argument('--continuous', action='store_true', help='Mode continu')
    
    args = parser.parse_args()
    
    if not TOMTOM_API_KEY or TOMTOM_API_KEY == 'VOTRE_CLE_API':
        print(" ERREUR: Clé API TomTom manquante!")
        print("Définissez TOMTOM_API_KEY dans .env ou en variable d'environnement")
        print("\nObtenir une clé: https://developer.tomtom.com/")
        sys.exit(1)
    
    producer = TomTomProducer()
    producer.run(interval=args.interval, continuous=args.continuous)