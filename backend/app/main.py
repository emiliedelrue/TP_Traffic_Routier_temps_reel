from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import zones, aggregates, alerts
from app.core.config import settings
from app.db.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="API temps réel pour monitoring de trafic",
    version=settings.VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # """Initialise HDFS au démarrage pour éviter le timeout de la première requête"""
    # try:
    #     from app.services.hdfs_service import hdfs_service
    #     print(" HDFS Service pré-initialisé au démarrage")
    # except Exception as e:
    #     print(f" HDFS Service non disponible : {e}")
    print("🚀 API démarrée. HDFS sera chargé à la première demande.")

app.include_router(zones.router, prefix="/api/zones", tags=["zones"])
app.include_router(aggregates.router, prefix="/api/aggregates", tags=["aggregates"])
app.include_router(alerts.router, prefix="/alerts", tags=["alerts"])

@app.get("/")
def root():
    return {
        "message": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
