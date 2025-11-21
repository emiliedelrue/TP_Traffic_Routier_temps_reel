from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, count, hour, date_format, to_date
from typing import List, Dict
from datetime import datetime, timedelta
import os

class HDFSService:
    def __init__(self):
        is_docker = os.path.exists('/.dockerenv') or os.getenv('DOCKER_ENV') == 'true'
        
        if is_docker:
            hdfs_host = "hdfs://namenode:9000"
        else:
            hdfs_host = "hdfs://localhost:9000"
        
        print(f"🔧 Initialisation HDFS Service - Host: {hdfs_host}")
        
        try:
            self.spark = SparkSession.builder \
                .appName("Backend_HDFS_Reader") \
                .config("spark.hadoop.fs.defaultFS", hdfs_host) \
                .config("spark.hadoop.dfs.client.use.datanode.hostname", "true") \
                .config("spark.hadoop.dfs.namenode.rpc-address", "namenode:9000" if is_docker else "localhost:9000") \
                .getOrCreate()
            
            self.spark.sparkContext.setLogLevel("ERROR")
            self.hdfs_base_path = "/traffic"
            print(f"HDFS Service initialisé - Path: {self.hdfs_base_path}")
        except Exception as e:
            print(f"Erreur initialisation Spark/HDFS: {e}")
            self.spark = None
    
    def get_zone_history(self, zone_id: str, days: int = 7) -> List[Dict]:
        """Récupère l'historique d'une zone depuis HDFS"""
        if not self.spark:
            print(" Spark non disponible")
            return []
        
        try:
            df = self.spark.read.parquet(f"{self.hdfs_base_path}/clean")
            
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            df_filtered = df.filter(
                (col("zone_id") == zone_id) &
                (col("timestamp") >= start_date) &
                (col("timestamp") <= end_date)
            )
            
            df_hourly = df_filtered \
                .withColumn("hour_bucket", date_format(col("timestamp"), "yyyy-MM-dd HH:00:00")) \
                .groupBy("hour_bucket") \
                .agg(
                    avg("current_speed").alias("avg_speed"),
                    avg("congestion_level").alias("avg_congestion")
                ) \
                .orderBy("hour_bucket")
            
            result = []
            for row in df_hourly.collect():
                result.append({
                    "timestamp": row.hour_bucket,
                    "avg_speed": round(float(row.avg_speed), 2),
                    "avg_congestion": round(float(row.avg_congestion), 2)
                })
            
            return result
        except Exception as e:
            print(f" Erreur lecture zone history : {e}")
            return []
    
    def get_weekly_data(self, days: int = 7) -> List[Dict]:
        """Récupère les données agrégées de la période demandée"""
        if not self.spark:
            print(" Spark non disponible")
            return []
        
        try:
            df = self.spark.read.parquet(f"{self.hdfs_base_path}/aggregates/hourly")
            
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            print(f" Filtrage données : {start_date.date()} → {end_date.date()}")
            
            df_filtered = df.filter(
                (to_date(col("date")) >= start_date.date()) &
                (to_date(col("date")) <= end_date.date())
            )
            
            df_daily = df_filtered \
                .groupBy("date") \
                .agg(
                    avg("avg_congestion").alias("congestion"),
                    avg("avg_speed").alias("speed"),
                    count("*").alias("measures")
                ) \
                .orderBy("date")
            
            result = []
            for row in df_daily.collect():
                result.append({
                    "date": row.date,
                    "congestion": round(float(row.congestion), 2),
                    "speed": round(float(row.speed), 2),
                    "measures": int(row.measures)
                })
            
            print(f" {len(result)} jours récupérés")
            return result
        except Exception as e:
            print(f"Erreur lecture agrégats : {e}")
            return []

    def get_hourly_distribution(self, days: int = 7) -> List[Dict]:
        """Récupère la distribution horaire moyenne sur N jours"""
        if not self.spark:
            print(" Spark non disponible")
            return []
        
        try:
            df = self.spark.read.parquet(f"{self.hdfs_base_path}/aggregates/hourly")
            
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            print(f"📅 Filtrage horaire : {start_date.date()} → {end_date.date()}")
            
            df_filtered = df.filter(
                (to_date(col("date")) >= start_date.date()) &
                (to_date(col("date")) <= end_date.date())
            )
            
            df_hourly = df_filtered \
                .groupBy("hour") \
                .agg(
                    avg("avg_congestion").alias("avg_congestion"),
                    count("*").alias("nb_measures")
                ) \
                .orderBy("hour")
            
            result = []
            for row in df_hourly.collect():
                result.append({
                    "hour": f"{int(row.hour):02d}h",
                    "congestion": round(float(row.avg_congestion), 2)
                })
            
            print(f" Distribution horaire calculée sur {days} jours")
            return result
        except Exception as e:
            print(f" Erreur distribution horaire : {e}")
            return []
    
    def get_hdfs_stats(self) -> Dict:
        """Statistiques HDFS"""
        if not self.spark:
            print(" Spark non disponible")
            return {"available": False}
        
        try:
            df = self.spark.read.parquet(f"{self.hdfs_base_path}/clean")
            
            total_records = df.count()
            date_range = df.agg(
                {"timestamp": "min", "timestamp": "max"}
            ).collect()[0]
            
            return {
                "available": True,
                "total_records": total_records,
                "earliest_record": str(date_range[0]) if date_range[0] else None,
                "latest_record": str(date_range[1]) if date_range[1] else None,
                "hdfs_path": f"{self.hdfs_base_path}/clean"
            }
        except Exception as e:
            print(f" Erreur stats HDFS : {e}")
            return {"available": False}


hdfs_service = HDFSService()