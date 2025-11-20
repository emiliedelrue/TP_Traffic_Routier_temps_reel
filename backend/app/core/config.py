from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/traffic"
    
    # Kafka
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_TOPIC_RAW: str = "traffic_raw"
    KAFKA_TOPIC_TRANSFORMED: str = "traffic_transformed"
    
    # TomTom API
    TOMTOM_API_KEY: Optional[str] = None
    
    # HDFS
    HDFS_NAMENODE: str = "hdfs://localhost:9000"
    HDFS_BASE_PATH: str = "/traffic"
    
    # App
    ENVIRONMENT: str = "development"
    APP_NAME: str = "Traffic Monitor API"
    VERSION: str = "1.0.0"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()