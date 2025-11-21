#!/usr/bin/env python3
"""
Consommateur Kafka - Alertes Trafic
Lit les alertes depuis Kafka et les expose via un fichier JSON
"""

from kafka import KafkaConsumer
import json
import os
from datetime import datetime
from collections import deque

KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
KAFKA_TOPIC_ALERTS = os.getenv('KAFKA_TOPIC_ALERTS', 'traffic_alerts')
ALERTS_FILE = '/tmp/alerts_realtime.json'
MAX_ALERTS = int(os.getenv('MAX_ALERTS', '100')) 

class AlertsConsumer:
    def __init__(self):
        self.consumer = KafkaConsumer(
            KAFKA_TOPIC_ALERTS,
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS.split(','),
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            auto_offset_reset='latest',  
            enable_auto_commit=True,
            group_id='alerts-consumer-group'
        )
        
        self.alerts_buffer = deque(maxlen=MAX_ALERTS)
        
        self.load_existing_alerts()
        
        print(f" Consumer Kafka connecté: {KAFKA_BOOTSTRAP_SERVERS}")
        print(f" Topic alertes: {KAFKA_TOPIC_ALERTS}")
        print(f" Fichier alertes: {ALERTS_FILE}")
        print(f"Limite alertes: {MAX_ALERTS}\n")
    
    def load_existing_alerts(self):
        """Charge les alertes existantes depuis le fichier"""
        try:
            if os.path.exists(ALERTS_FILE):
                with open(ALERTS_FILE, 'r') as f:
                    existing_alerts = json.load(f)
                    self.alerts_buffer.extend(existing_alerts)
                    print(f"📂 {len(existing_alerts)} alertes chargées depuis {ALERTS_FILE}")
        except Exception as e:
            print(f" Erreur lors du chargement des alertes: {e}")
    
    def save_alerts(self):
        """Sauvegarde les alertes dans un fichier JSON"""
        try:
            os.makedirs(os.path.dirname(ALERTS_FILE), exist_ok=True)
            
            alerts_list = list(self.alerts_buffer)
            
            with open(ALERTS_FILE, 'w') as f:
                json.dump(alerts_list, f, indent=2, default=str)
            
            return True
        except Exception as e:
            print(f" Erreur sauvegarde: {e}")
            return False
    
    def process_alert(self, alert):
        """Traite une alerte reçue"""
        print(f"\n Nouvelle alerte reçue:")
        print(f"   Zone: {alert.get('zone_name')}")
        print(f"   Type: {alert.get('type')}")
        print(f"   Congestion: {alert.get('congestion_level')}%")
        print(f"   Vitesse: {alert.get('current_speed')} km/h")
        
        self.alerts_buffer.append(alert)
        
        if self.save_alerts():
            print(f"    Alerte sauvegardée ({len(self.alerts_buffer)} total)")
        else:
            print(f"    Échec sauvegarde")
    
    def run(self):
        """Boucle principale de consommation"""
        print(f" Démarrage du consumer d'alertes...")
        print(f" En attente d'alertes...\n")
        
        try:
            for message in self.consumer:
                alert = message.value
                self.process_alert(alert)
                
        except KeyboardInterrupt:
            print("\n\n  Arrêt du consumer...")
        finally:
            self.consumer.close()
            print("Consumer fermé proprement\n")

if __name__ == "__main__":
    consumer = AlertsConsumer()
    consumer.run()