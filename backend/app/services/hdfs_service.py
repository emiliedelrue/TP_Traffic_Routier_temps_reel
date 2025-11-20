#!/usr/bin/env python3
"""
Spark Streaming : Kafka → HDFS + PostgreSQL
"""

from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    from_json, col, current_timestamp, when,
    year, month, dayofmonth, to_timestamp
)
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, IntegerType

# Configuration
KAFKA_BOOTSTRAP_SERVERS = "localhost:9092"
KAFKA_TOPIC = "traffic_raw"
HDFS_NAMENODE = "hdfs://localhost:9000"
POSTGRES_URL = "jdbc:postgresql://localhost:5432/traffic"
POSTGRES_USER = "postgres"
POSTGRES_PASSWORD = "postgres"

# Schéma Kafka
schema = StructType([
    StructField("zone_id", StringType(), False),
    StructField("zone_name", StringType(), False),
    StructField("latitude", DoubleType(), False),
    StructField("longitude", DoubleType(), False),
    StructField("current_speed", DoubleType(), False),
    StructField("free_flow_speed", DoubleType(), False),
    StructField("current_travel_time", IntegerType(), True),
    StructField("free_flow_travel_time", IntegerType(), True),
    StructField("confidence", DoubleType(), True),
    StructField("timestamp", StringType(), False),
    StructField("source", StringType(), True),
])

def write_batch(batch_df, batch_id):
    """Écrit chaque batch dans HDFS et PostgreSQL"""
    
    if batch_df.count() == 0:
        print(f"\n⚠️  Batch #{batch_id} - Vide")
        return
    
    print(f"\n{'='*60}")
    print(f"📊 Batch #{batch_id} - {batch_df.count()} lignes")
    print(f"{'='*60}")
    
    # Afficher sample
    batch_df.show(3, truncate=False)
    
    # ==========================================
    # 1. HDFS (Parquet partitionné)
    # ==========================================
    try:
        hdfs_path = f"{HDFS_NAMENODE}/traffic/clean"
        
        # Ajouter colonnes de partitionnement
        df_hdfs = batch_df \
            .withColumn("year", year(to_timestamp(col("timestamp")))) \
            .withColumn("month", month(to_timestamp(col("timestamp")))) \
            .withColumn("day", dayofmonth(to_timestamp(col("timestamp"))))
        
        # Écrire en Parquet
        df_hdfs.write \
            .mode("append") \
            .partitionBy("year", "month", "day") \
            .parquet(hdfs_path)
        
        print(f"✅ Écrit dans HDFS : {hdfs_path}")
        
        # Vérifier partition
        from datetime import datetime
        today = datetime.now()
        print(f"   Partition : year={today.year}/month={today.month}/day={today.day}")
    
    except Exception as e:
        print(f"❌ Erreur HDFS : {e}")
        import traceback
        traceback.print_exc()
    
    # ==========================================
    # 2. PostgreSQL
    # ==========================================
    try:
        df_postgres = batch_df.select(
            "zone_id", "zone_name", "latitude", "longitude",
            "current_speed", "free_flow_speed", 
            "congestion_level", "status", "timestamp"
        ).withColumn("updated_at", current_timestamp())
        
        df_postgres.write \
            .format("jdbc") \
            .option("url", POSTGRES_URL) \
            .option("dbtable", "zones_latest") \
            .option("user", POSTGRES_USER) \
            .option("password", POSTGRES_PASSWORD) \
            .option("driver", "org.postgresql.Driver") \
            .mode("append") \
            .save()
        
        print(f"✅ Écrit dans PostgreSQL : zones_latest")
    
    except Exception as e:
        print(f"❌ Erreur PostgreSQL : {e}")
        import traceback
        traceback.print_exc()
    
    print(f"\n{'='*60}\n")

def main():
    print("\n" + "="*60)
    print("🚀 Spark Streaming : Kafka → HDFS + PostgreSQL")
    print("="*60 + "\n")
    
    # Spark Session avec checkpoint LOCAL
    spark = SparkSession.builder \
        .appName("Traffic_To_HDFS_Postgres") \
        .config("spark.jars.packages", 
                "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0,"
                "org.postgresql:postgresql:42.7.1") \
        .config("spark.hadoop.fs.defaultFS", HDFS_NAMENODE) \
        .getOrCreate()
    
    spark.sparkContext.setLogLevel("WARN")
    
    print("✅ Spark Session créée")
    print(f"📡 Source : Kafka ({KAFKA_TOPIC})")
    print(f"💾 HDFS : {HDFS_NAMENODE}/traffic")
    print(f"💾 PostgreSQL : {POSTGRES_URL}")
    print(f"📁 Checkpoint : /tmp/checkpoint-local (local)\n")
    
    # Lire Kafka
    df_kafka = spark \
        .readStream \
        .format("kafka") \
        .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVERS) \
        .option("subscribe", KAFKA_TOPIC) \
        .option("startingOffsets", "latest") \
        .load()
    
    print("✅ Connexion Kafka établie")
    
    # Parser et enrichir
    df_parsed = df_kafka \
        .selectExpr("CAST(value AS STRING) as json_data") \
        .select(from_json(col("json_data"), schema).alias("data")) \
        .select("data.*")
    
    df_enriched = df_parsed \
        .withColumn("congestion_level", 
                   (1 - col("current_speed") / col("free_flow_speed")) * 100) \
        .withColumn("status",
                   when(col("congestion_level") < 20, "Fluide")
                   .when(col("congestion_level") < 50, "Modéré")
                   .when(col("congestion_level") < 80, "Dense")
                   .otherwise("Bloqué"))
    
    print("✅ Transformations appliquées")
    print("\n🔄 Démarrage streaming...")
    print("📊 Traitement toutes les 30 secondes")
    print("🛑 Ctrl+C pour arrêter\n")
    
    # Streaming avec checkpoint LOCAL
    query = df_enriched \
        .writeStream \
        .foreachBatch(write_batch) \
        .outputMode("append") \
        .option("checkpointLocation", "/tmp/checkpoint-local") \
        .trigger(processingTime='30 seconds') \
        .start()
    
    print("✅ Streaming actif\n")
    
    query.awaitTermination()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n🛑 Arrêt...")
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()