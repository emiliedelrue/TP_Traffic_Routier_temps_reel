from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import zones, aggregates
from app.core.config import settings
from app.db.database import engine, Base

# Créer les tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="API temps réel pour monitoring de trafic",
    version=settings.VERSION
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(zones.router, prefix="/api/zones", tags=["zones"])
app.include_router(aggregates.router, prefix="/api/aggregates", tags=["aggregates"])

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