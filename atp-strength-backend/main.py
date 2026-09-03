import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config.database import Base, engine
from src.routes.state import router as state_router
from src.routes.strength import router as strength_router

load_dotenv()

# Origins allowed for CORS
cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000,https://atp-strength.vercel.app")
allowed_origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Attempt automatic table creation on startup if database is reachable
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables verified/created successfully.")
    except Exception as exc:
        print(f"⚠️ Notice: Database initialization deferred (PostgreSQL check): {exc}")
    yield


app = FastAPI(
    title="NEURO//STRENGTH - ATP-Strength Engine API",
    description="Backend API orchestrating ATP resynthesis, neuromuscular state, and exercise logs.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration for Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router Registration
app.include_router(state_router)
app.include_router(strength_router)



@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "atp-strength-backend",
        "version": "1.0.0"
    }


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "ATP-Strength Engine Backend is active.",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
