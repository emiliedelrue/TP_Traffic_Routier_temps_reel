from kafka import KafkaConsumer
import json
from app.models.schemas import Zone
from datetime import datetime

def get_latest_zones():
    """Récupère les dernières données depuis Kafka ou PostgreSQL"""

    consumer = KafkaConsumer(
        'weather_transformed',  
        bootstrap_servers=['localhost:9092'],
        auto_offset_reset='latest',
        enable_auto_commit=False,
        consumer_timeout_ms=1000,
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )
    
    zones_dict = {}
    
    for message in consumer:
        data = message.value
        zone_id = data.get('zone_id') or f"{data['latitude']}_{data['longitude']}"
        
        zones_dict[zone_id] = Zone(
            zone_id=zone_id,
            zone_name=data.get('zone_name', zone_id),
            latitude=data['latitude'],
            longitude=data['longitude'],
            current_speed=data['current_speed'],
            free_flow_speed=data['free_flow_speed'],
            congestion_level=data['congestion_level'],
            status=data['status'],
            timestamp=datetime.fromisoformat(data['timestamp'])
        )
    
    consumer.close()
    return list(zones_dict.values())
