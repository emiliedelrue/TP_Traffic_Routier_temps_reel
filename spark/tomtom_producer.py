#!/usr/bin/env python3
"""
Producteur Kafka - API TomTom Traffic
Récupère les données de trafic en temps réel et les envoie à Kafka
+ Génération d'alertes en temps réel
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
KAFKA_TOPIC_RAW = os.getenv('KAFKA_TOPIC_RAW', 'traffic_raw')
KAFKA_TOPIC_ALERTS = os.getenv('KAFKA_TOPIC_ALERTS', 'traffic_alerts')

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
        print(f" Topic données: {KAFKA_TOPIC_RAW}")
        print(f" Topic alertes: {KAFKA_TOPIC_ALERTS}")
    
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
    
    def detect_alert(self, message):
        """Détecte si une alerte doit être générée"""
        if not message:
            return None
        
        current_speed = message['current_speed']
        free_flow_speed = message['free_flow_speed']
        
        if free_flow_speed > 0:
            congestion_level = ((free_flow_speed - current_speed) / free_flow_speed) * 100
        else:
            congestion_level = 0
        
        if congestion_level > 70 or current_speed < 20:
            return self.format_alert(message, congestion_level)
        
        return None
    
    def format_alert(self, message, congestion_level):
        """Formate une alerte pour Kafka et le frontend"""
        
        if congestion_level > 90 or message['current_speed'] < 10:
            alert_type = "critical"
            status = "active"
        elif congestion_level > 70 or message['current_speed'] < 20:
            alert_type = "warning"
            status = "ongoing"
        else:
            alert_type = "info"
            status = "resolved"
        
        if alert_type == "critical":
            title = f" Trafic Bloqué - {message['zone_name']}"
        elif alert_type == "warning":
            title = f" Trafic Dense - {message['zone_name']}"
        else:
            title = f" Ralentissement - {message['zone_name']}"
        
        if congestion_level > 80:
            duration = "> 30 min"
        elif congestion_level > 50:
            duration = "15-30 min"
        else:
            duration = "< 15 min"
        
        zone_id = message['zone_id']
        if 'peripherique' in zone_id:
            affected_vehicles = "~500 véhicules"
        elif 'champs' in zone_id or 'concorde' in zone_id:
            affected_vehicles = "~300 véhicules"
        else:
            affected_vehicles = "~200 véhicules"
        
        return {
            'id': f"{message['zone_id']}_{int(time.time())}",
            'zone_name': message['zone_name'],
            'title': title,
            'location': message['zone_name'],
            'type': alert_type,
            'status': status,
            'time': message['timestamp'],
            'congestion_level': round(congestion_level, 2),
            'current_speed': message['current_speed'],
            'free_flow_speed': message['free_flow_speed'],
            'latitude': message['latitude'],
            'longitude': message['longitude'],
            'duration': duration,
            'affectedVehicles': affected_vehicles,
            'source': 'tomtom_realtime'
        }
    
    def send_to_kafka(self, message, key, topic=None):
        """Envoie le message à Kafka"""
        if topic is None:
            topic = KAFKA_TOPIC_RAW
            
        try:
            future = self.producer.send(topic, value=message, key=key)
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
        total_alerts = 0
        
        try:
            while True:
                iteration += 1
                iteration_alerts = 0
                
                print(f"{'='*60}")
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Itération #{iteration}")
                print(f"{'='*60}")
                
                for zone in ZONES:
                    print(f"\n Zone: {zone['name']}")
                    
                    traffic_data = self.fetch_traffic_data(zone['lat'], zone['lon'])
                    
                    if traffic_data:
                        message = self.format_message(zone, traffic_data)
                        
                        if message:
                            # Envoyer les données brutes
                            result = self.send_to_kafka(message, message['zone_id'], KAFKA_TOPIC_RAW)
                            
                            if result:
                                print(f"  Données envoyées: {message['current_speed']:.1f} km/h")
                                
                                # Détecter et envoyer les alertes
                                alert = self.detect_alert(message)
                                if alert:
                                    alert_result = self.send_to_kafka(
                                        alert, 
                                        alert['id'], 
                                        KAFKA_TOPIC_ALERTS
                                    )
                                    if alert_result:
                                        iteration_alerts += 1
                                        total_alerts += 1
                                        print(f"  ALERTE détectée: {alert['type'].upper()}")
                                        print(f"     Congestion: {alert['congestion_level']:.1f}%")
                                        print(f"     Vitesse: {alert['current_speed']:.0f} km/h")
                                else:
                                    print(f"  Trafic normal")
                            else:
                                print(f"  Échec envoi données")
                        else:
                            print(f"   Données invalides")
                    else:
                        print(f"   Échec récupération API")
                    
                    time.sleep(2)
                
                print(f"\n{'='*60}")
                print(f"Itération #{iteration} terminée")
                print(f" Alertes cette itération: {iteration_alerts}")
                print(f" Total alertes: {total_alerts}")
                print(f"{'='*60}\n")
                
                if not continuous:
                    break
                
                print(f" Attente {interval}s avant prochaine itération...\n")
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n\n Arrêt du producteur...")
        finally:
            self.producer.close()
            print("Producteur fermé proprement\n")

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