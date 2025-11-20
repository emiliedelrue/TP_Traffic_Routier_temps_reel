from kafka import KafkaConsumer, KafkaProducer
import json
from typing import List
from app.core.config import settings
from app.models.schemas import Zone
from datetime import datetime

class KafkaService:
    def __init__(self):
        self.bootstrap_servers = settings.KAFKA_BOOTSTRAP_SERVERS.split(',')
    
    def get_producer(self):
        return KafkaProducer(
            bootstrap_servers=self.bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
    
    def get_consumer(self, topic: str, group_id: str = "traffic_consumer"):
        return KafkaConsumer(
            topic,
            bootstrap_servers=self.bootstrap_servers,
            auto_offset_reset='latest',
            enable_auto_commit=True,
            group_id=group_id,
            consumer_timeout_ms=1000,
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )
    
    def get_latest_zones(self) -> List[Zone]:
        """Récupère les dernières données depuis Kafka"""
        consumer = self.get_consumer(settings.KAFKA_TOPIC_TRANSFORMED)
        zones_dict = {}
        
        for message in consumer:
            data = message.value
            zone_id = data.get('zone_id')
            
            if zone_id:
                zones_dict[zone_id] = Zone(**data)
        
        consumer.close()
        return list(zones_dict.values())

kafka_service = KafkaService()