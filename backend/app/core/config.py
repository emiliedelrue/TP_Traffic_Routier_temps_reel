from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Configuration de la base de données (Utilisez le nom du service Docker)
    DATABASE_URL: str = "postgresql://postgres:postgres@postgres:5432/traffic"
    
    # Configuration Kafka
    KAFKA_BOOTSTRAP_SERVERS: str = "kafka:29092"
    KAFKA_TOPIC: str = "traffic-data"
    KAFKA_TOPIC_RAW: str = "traffic-data"
    KAFKA_TOPIC_TRANSFORMED: str = "traffic-data"
    
    # Configuration HDFS
    HDFS_NAMENODE: str = "hdfs://namenode:9000"
    HDFS_BASE_PATH: str = "/traffic"
    
    # Métadonnées de l'application
    APP_NAME: str = "Traffic Monitor API"
    VERSION: str = "1.0.0"

    # Configuration Pydantic pour lire le fichier .env
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

# Indispensable : Instanciation pour l'exportation
settings = Settings()