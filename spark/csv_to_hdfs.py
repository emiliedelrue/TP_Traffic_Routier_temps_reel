#!/usr/bin/env python3
"""
Import données historiques CSV vers HDFS
Simule des données historiques pour tester les agrégations
"""

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lit, current_timestamp, rand, when
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, TimestampType
from datetime import datetime, timedelta
import sys

class CSVToHDFS:
    def __init__(self, hdfs_path="/traffic"):
        self.spark = SparkSession.builder \
            .appName("CSV_To_HDFS") \
            .config("spark.hadoop.fs.defaultFS", "hdfs://localhost:9000") \
            .config("spark.hadoop.dfs.replication", "1") \
            .config("spark.hadoop.dfs.client.block.write.replace-datanode-on-failure.policy", "NEVER") \
            .config("spark.hadoop.dfs.client.block.write.replace-datanode-on-failure.enable", "false") \
            .getOrCreate()
        
        self.hdfs_base_path = hdfs_path
        print(f"✅ Spark Session créée")
        print(f"📁 HDFS base path: {hdfs_path}")
    
    def generate_historical_data(self, days=30):
        """Génère des données historiques simulées"""
        print(f"\n📊 Génération données historiques ({days} jours)...")
        
        zones = [
            {"zone_id": "champs_elysees", "zone_name": "Champs-Élysées", "lat": 48.8698, "lon": 2.3078},
            {"zone_id": "peripherique_nord", "zone_name": "Périphérique Nord", "lat": 48.8975, "lon": 2.3397},
            {"zone_id": "a6_sud", "zone_name": "A6 Sud", "lat": 48.8235, "lon": 2.3589},
            {"zone_id": "porte_versailles", "zone_name": "Porte de Versailles", "lat": 48.8322, "lon": 2.2869},
            {"zone_id": "concorde", "zone_name": "Place de la Concorde", "lat": 48.8656, "lon": 2.3212},
        ]
        
        schema = StructType([
            StructField("zone_id", StringType(), False),
            StructField("zone_name", StringType(), False),
            StructField("latitude", DoubleType(), False),
            StructField("longitude", DoubleType(), False),
            StructField("current_speed", DoubleType(), False),
            StructField("free_flow_speed", DoubleType(), False),
            StructField("congestion_level", DoubleType(), False),
            StructField("status", StringType(), False),
            StructField("timestamp", TimestampType(), False),
        ])
        
        data = []
        now = datetime.now()
        
        for day in range(days):
            for hour in range(24):
                for zone in zones:
                    timestamp = now - timedelta(days=days-day, hours=24-hour)
                    
                    if 7 <= hour <= 9 or 17 <= hour <= 19:
                        base_speed = float(25 + (hash(zone['zone_id']) % 20))
                    elif 22 <= hour or hour <= 6:
                        base_speed = float(55 + (hash(zone['zone_id']) % 15))
                    else:
                        base_speed = float(40 + (hash(zone['zone_id']) % 15))
                    
                    free_flow = float(60.0)
                    congestion = float((1 - base_speed / free_flow) * 100)
                    
                    if congestion < 20:
                        status = "Fluide"
                    elif congestion < 50:
                        status = "Modéré"
                    elif congestion < 80:
                        status = "Dense"
                    else:
                        status = "Bloqué"
                    
                    data.append((
                        zone['zone_id'],
                        zone['zone_name'],
                        float(zone['lat']),
                        float(zone['lon']),
                        base_speed,
                        free_flow,
                        congestion,
                        status,
                        timestamp
                    ))
        
        df = self.spark.createDataFrame(data, schema)
        print(f"✅ {df.count()} lignes générées")
        return df
    
    def write_to_hdfs_partitioned(self, df):
        """Écrit dans HDFS avec partitionnement"""
        print(f"\n💾 Écriture dans HDFS (partitionné)...")
        
        df_partitioned = df \
            .withColumn("year", col("timestamp").cast("date").substr(1, 4)) \
            .withColumn("month", col("timestamp").cast("date").substr(6, 2)) \
            .withColumn("day", col("timestamp").cast("date").substr(9, 2))
        
        output_path = f"{self.hdfs_base_path}/clean"
        
        df_partitioned.write \
            .mode("overwrite") \
            .partitionBy("year", "month", "day") \
            .parquet(output_path)
        
        print(f"✅ Données écrites dans: {output_path}")
        return output_path
    
    def create_aggregates(self, df):
        """Crée des agrégats horaires"""
        print(f"\n📈 Création agrégats horaires...")
        
        from pyspark.sql.functions import hour, date_format, avg, min, max, count
        
        df_hourly = df.groupBy(
            "zone_id",
            "zone_name",
            date_format("timestamp", "yyyy-MM-dd").alias("date"),
            hour("timestamp").alias("hour")
        ).agg(
            avg("current_speed").alias("avg_speed"),
            min("current_speed").alias("min_speed"),
            max("current_speed").alias("max_speed"),
            avg("congestion_level").alias("avg_congestion"),
            count("*").alias("nb_measures")
        )
        
        agg_path = f"{self.hdfs_base_path}/aggregates/hourly"
        
        df_hourly.write \
            .mode("overwrite") \
            .partitionBy("date") \
            .parquet(agg_path)
        
        print(f"✅ Agrégats écrits dans: {agg_path}")
        return df_hourly
    
    def run(self, days=30):
        print(f"\n{'='*60}")
        print(f"🚀 Import Données Historiques CSV → HDFS")
        print(f"{'='*60}")
        
        df = self.generate_historical_data(days)
        
        print(f"\n📋 Aperçu des données:")
        df.show(5, truncate=False)
        
        output_path = self.write_to_hdfs_partitioned(df)
        
        df_agg = self.create_aggregates(df)
        
        print(f"\n📋 Aperçu agrégats:")
        df_agg.show(5)
        
        print(f"\n{'='*60}")
        print(f"✅ Import terminé avec succès!")
        print(f"{'='*60}")
        
        self.spark.stop()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Import CSV → HDFS')
    parser.add_argument('--days', type=int, default=30)
    parser.add_argument('--hdfs-path', type=str, default='/traffic')
    
    args = parser.parse_args()
    
    importer = CSVToHDFS(hdfs_path=args.hdfs_path)
    importer.run(days=args.days)
