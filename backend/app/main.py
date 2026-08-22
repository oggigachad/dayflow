from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Hackathon speed: create_all instead of Alembic. Swap in migrations before
    # anyone depends on the data surviving a schema change.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Dayflow HRMS API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok"}
