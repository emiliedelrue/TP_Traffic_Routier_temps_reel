# 🚗 Traffic Monitor - Système de Monitoring de Trafic Routier en Temps Réel

Projet Big Data : Architecture complète de DataLake pour l'ingestion, la persistance et le traitement de données de trafic routier en temps réel.

![Architecture](https://img.shields.io/badge/Architecture-Kafka%20%2B%20Spark%20%2B%20HDFS-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Leaflet-orange)
![Status](https://img.shields.io/badge/Status-In%20Development-yellow)

---

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Structure du Projet](#structure-du-projet)
- [Agrégations Spark](#agrégations-spark)
- [API Documentation](#api-documentation)
- [Déploiement](#déploiement)
- [Contributeurs](#contributeurs)

---

## 🎯 Vue d'ensemble

**Traffic Monitor** est un système de monitoring temps réel du trafic routier basé sur une architecture Big Data complète :

- **Ingestion** : Collecte de données via API TomTom Traffic et stockage dans Kafka
- **Persistance** : HDFS partitionné pour l'historique et PostgreSQL pour les métadonnées
- **Traitement** : Spark Streaming pour les transformations et agrégations temps réel
- **Visualisation** : Dashboard interactif React avec cartes Leaflet

### 🎓 Objectifs Pédagogiques

- Architecture DataLake 3 couches (Ingestion → Persistance → Insight)
- Streaming temps réel avec Kafka & Spark Structured Streaming
- Partitionnement intelligent HDFS
- API REST moderne avec FastAPI
- Dashboard interactif avec React

---

## 🏗️ Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    INGESTION LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  API TomTom Traffic → Kafka Producer → Kafka Topics        │
│  (Données temps réel)    (Python)      (weather_stream)    │
│                                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   PERSISTENCE LAYER                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        Spark Streaming ETL                          │   │
│  │  - Nettoyage données                                │   │
│  │  - Calcul congestion                                │   │
│  │  - Détection anomalies                              │   │
│  │  - Génération alertes                               │   │
│  └──────────────┬─────────────────┬────────────────────┘   │
│                 │                 │                         │
│        ┌────────▼────────┐   ┌────▼──────────────┐         │
│        │      HDFS       │   │   PostgreSQL      │         │
│        │  (Parquet)      │   │   (Metadata)      │         │
│        │  Partitionné:   │   │                   │         │
│        │  /traffic/      │   │  - zones_latest   │         │
│        │  ├─ raw/        │   │  - incidents      │         │
│        │  ├─ clean/      │   │  - logs           │         │
│        │  └─ aggregates/ │   │                   │         │
│        └─────────────────┘   └───────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                     INSIGHT LAYER                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           FastAPI Backend (Port 8000)                │  │
│  │  - REST API endpoints                                │  │
│  │  - WebSocket pour temps réel                         │  │
│  │  - Spark queries vers HDFS                           │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │        React Dashboard (Port 5173)                   │  │
│  │  - Carte interactive (React-Leaflet)                 │  │
│  │  - KPIs temps réel                                   │  │
│  │  - Graphiques (Recharts)                             │  │
│  │  - Alertes & Incidents                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technologies

### Backend & Data Processing
| Technologie | Version | Usage |
|-------------|---------|-------|
| **Python** | 3.11 | Langage principal |
| **FastAPI** | 0.104+ | API REST moderne |
| **Apache Kafka** | 7.5.0 | Message broker temps réel |
| **Apache Spark** | 3.5.0 | Traitement distribué |
| **HDFS** | 3.3+ | Stockage distribué |
| **PostgreSQL** | 15 | Base métadonnées |
| **Uvicorn** | 0.24+ | Serveur ASGI |

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| **React** | 18+ | Framework UI |
| **Vite** | 5+ | Build tool |
| **React-Leaflet** | 4+ | Cartes interactives |
| **Recharts** | 2+ | Visualisations |
| **Zustand** | 4+ | State management |
| **TailwindCSS** | 3+ | Styling |
| **Axios** | 1+ | HTTP client |

### Infrastructure
| Technologie | Usage |
|-------------|-------|
| **Docker** | Containerisation |
| **Docker Compose** | Orchestration |
| **Zookeeper** | Coordination Kafka |

---

## 📦 Prérequis

### Option 1 : Avec Docker (Recommandé)
- Docker Desktop 4.0+
- Docker Compose 2.0+
- 8 GB RAM minimum
- 10 GB espace disque

### Option 2 : Installation Native
- Python 3.11+
- Node.js 18+
- Java 11+ (pour Kafka/Spark)
- PostgreSQL 15+
- Apache Kafka 3.0+
- Apache Spark 3.5+

---

## 🚀 Installation

### Méthode 1 : Docker (Recommandé)
```bash
# 1. Cloner le projet
git clone https://github.com/votre-repo/traffic-monitor.git
cd traffic-monitor

# 2. Lancer avec Docker Compose
docker-compose up --build

# 3. Attendre que tous les services démarrent (30-60s)
# Vérifier : docker-compose ps

# 4. Accéder à l'application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/docs
```

### Méthode 2 : Installation Native

#### Backend
```bash
cd backend

# Créer environnement virtuel
python3.11 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer dépendances
pip install -r requirements.txt

# Lancer FastAPI
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend

# Installer dépendances
npm install

# Lancer en mode dev
npm run dev
```

#### Infrastructure (Kafka, Zookeeper, PostgreSQL)
```bash
# Démarrer Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Démarrer Kafka
bin/kafka-server-start.sh config/server.properties

# Créer topics
bin/kafka-topics.sh --create --topic weather_stream \
  --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1

bin/kafka-topics.sh --create --topic weather_transformed \
  --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
```

---

## 💻 Utilisation

### Démarrage Rapide
```bash
# Avec Docker
docker-compose up -d

# Vérifier que tout tourne
docker-compose ps

# Voir les logs
docker-compose logs -f backend
```

### Accès aux Services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Dashboard React |
| **Backend API** | http://localhost:8000 | API REST |
| **API Docs** | http://localhost:8000/docs | Documentation Swagger |
| **Kafka** | localhost:9092 | Broker Kafka |
| **PostgreSQL** | localhost:5432 | Base de données |

### Commandes Utiles
```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v

# Redémarrer un service
docker-compose restart backend

# Voir les logs
docker-compose logs -f frontend

# Entrer dans un container
docker-compose exec backend bash
```

---

## 📁 Structure du Projet
```
traffic-monitor/
├── backend/                    # API FastAPI
│   ├── app/
│   │   ├── main.py            # Point d'entrée
│   │   ├── api/               # Routes API
│   │   ├── models/            # Modèles Pydantic
│   │   ├── services/          # Logique métier
│   │   └── core/              # Configuration
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                   # Application React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/           # Composants carte
│   │   │   ├── Dashboard/     # KPIs & widgets
│   │   │   └── Charts/        # Graphiques
│   │   ├── services/          # API calls
│   │   ├── store/             # Zustand store
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
│
├── spark/                      # Jobs Spark
│   ├── kafka_producer.py      # Producteur TomTom
│   ├── streaming_etl.py       # ETL Spark Streaming
│   └── batch_aggregates.py    # Agrégations batch
│
├── docker-compose.yml          # Orchestration
├── README.md
└── .gitignore
```

---

## 📊 Agrégations Spark

### Agrégations Temps Réel (Spark Streaming)

#### 1. Calcul du Niveau de Congestion
```python
# Formule : (1 - vitesse_actuelle / vitesse_libre) × 100
congestion_level = (1 - col("current_speed") / col("free_flow_speed")) * 100
```

#### 2. Classification Statut
- **Fluide** : congestion < 20%
- **Modéré** : 20% ≤ congestion < 50%
- **Dense** : 50% ≤ congestion < 80%
- **Bloqué** : congestion ≥ 80%

#### 3. Agrégation par Fenêtre (5 minutes)
```python
df_5min = df_stream.groupBy(
    window(col("timestamp"), "5 minutes"),
    col("zone_id")
).agg(
    avg("current_speed").alias("avg_speed"),
    min("current_speed").alias("min_speed"),
    max("current_speed").alias("max_speed"),
    avg("congestion_level").alias("avg_congestion")
)
```

### Agrégations Batch (HDFS)

#### 4. Comparaison Historique
```python
# Comparer vitesse actuelle vs moyenne historique
df_comparison = df_realtime.join(df_historical, "zone_id")
```

#### 5. Détection d'Anomalies
```python
# Chute brutale de vitesse (> 25 km/h)
df_incidents = df.withColumn(
    "speed_drop",
    col("current_speed") - lag("current_speed", 1).over(windowSpec)
).filter(col("speed_drop") < -25)
```

#### 6. Patterns Temporels
```python
# Heures de pointe par zone
df_peak_hours = df.groupBy("zone_id", hour("timestamp")).agg(
    avg("congestion_level")
).filter(col("avg_congestion") > 60)
```

---

## 🔌 API Documentation

### Endpoints Principaux

#### GET `/api/zones/live`
Retourne les données temps réel de toutes les zones surveillées.

**Réponse :**
```json
[
  {
    "zone_id": "1",
    "zone_name": "Champs-Élysées",
    "latitude": 48.8698,
    "longitude": 2.3078,
    "current_speed": 35.5,
    "free_flow_speed": 50.0,
    "congestion_level": 29.0,
    "status": "Modéré",
    "timestamp": "2025-11-19T15:30:00"
  }
]
```

#### GET `/api/zones/top-congested?limit=5`
Top zones les plus congestionnées.

#### GET `/api/aggregates/stats`
Statistiques globales du réseau.

**Réponse :**
```json
{
  "total_zones": 30,
  "fluide": 8,
  "modere": 12,
  "dense": 7,
  "bloque": 3,
  "avg_global_speed": 42.5,
  "avg_global_congestion": 48.3
}
```

#### GET `/api/zones/history/{zone_id}?hours=24`
Historique d'une zone sur N heures.

### WebSocket

#### WS `/ws/live`
Stream temps réel des données de trafic.
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/live');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.zones);
};
```

---

## 🎨 Dashboard Features

### 🗺️ Carte Interactive
- **Marqueurs colorés** selon niveau de congestion
- **Popups** avec détails zone
- **Zoom** et navigation fluide
- **Actualisation** automatique toutes les 10s

### 📊 KPIs Temps Réel
- Vitesse moyenne globale
- Taux de congestion
- Nombre de zones surveillées
- Zones fluides vs bloquées

### 📈 Graphiques
- Top 5 zones congestionnées (bar chart)
- Évolution vitesse (timeline)
- Distribution statuts (pie chart)
- Heatmap congestion par heure

### 🚨 Alertes
- Détection incidents (chute vitesse)
- Congestion > 80%
- Comparaison historique

---

## 🧪 Tests

### Backend
```bash
cd backend
pytest tests/
```

### Frontend
```bash
cd frontend
npm run test
```

### API (Manuel)
```bash
# Test endpoint
curl http://localhost:8000/api/zones/live

# Test avec jq (pretty print)
curl http://localhost:8000/api/zones/live | jq
```

---

## 🚢 Déploiement

### Docker Hub
```bash
# Build et push images
docker build -t votre-user/traffic-backend:latest ./backend
docker push votre-user/traffic-backend:latest

docker build -t votre-user/traffic-frontend:latest ./frontend
docker push votre-user/traffic-frontend:latest
```

### Production
```bash
# Utiliser docker-compose en prod
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔐 Variables d'Environnement

### Backend (`.env`)
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/traffic
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
TOMTOM_API_KEY=votre_clé_api
ENVIRONMENT=production
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

---

## 🐛 Troubleshooting

### Kafka ne démarre pas
```bash
# Vérifier les logs
docker-compose logs kafka

# Nettoyer et redémarrer
docker-compose down -v
docker-compose up kafka
```

### Port déjà utilisé
```bash
# Trouver et tuer processus sur port 8000
lsof -ti:8000 | xargs kill -9
```

### Frontend ne se connecte pas au backend
1. Vérifier CORS dans `backend/app/main.py`
2. Vérifier `VITE_API_URL` dans `.env`
3. Tester API : `curl http://localhost:8000/health`

---

## 📚 Documentation

- **Architecture** : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **API Reference** : http://localhost:8000/docs
- **Spark Jobs** : [docs/SPARK.md](docs/SPARK.md)
- **Déploiement** : [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 👥 Contributeurs

- **Eva Depaepe** 
- **Emilie Delrue** 

---



