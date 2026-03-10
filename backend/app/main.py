import time
import httpx
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import settings
from app.api.v1.router import router
from app.db.connection import get_pool, close_pool


class ServiceStatus(BaseModel):
    status: str
    latency_ms: int

class HealthResponse(BaseModel):
    status: str
    services: dict[str, ServiceStatus]
    checked_at: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_pool()
    yield
    await close_pool()


app = FastAPI(
    title="PNCP Edital Search",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/api/v1/health", response_model=HealthResponse)
async def health():
    overall = "ok"
    services: dict[str, ServiceStatus] = {}

    t0 = time.monotonic()
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        db_latency = int((time.monotonic() - t0) * 1000)
        services["database"] = ServiceStatus(status="ok", latency_ms=db_latency)
    except Exception:
        db_latency = int((time.monotonic() - t0) * 1000)
        services["database"] = ServiceStatus(status="error", latency_ms=db_latency)
        overall = "degraded"

    t0 = time.monotonic()
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(
                f"{settings.pncp_base_url}/contratacoes/publicacao",
                params={"dataInicial": "20240101", "dataFinal": "20240101", "pagina": 1, "tamanhoPagina": 10, "codigoModalidadeContratacao": 6},
            )
        pncp_latency = int((time.monotonic() - t0) * 1000)
        pncp_status = "ok" if resp.status_code < 500 else "degraded"
        services["pncp_api"] = ServiceStatus(status=pncp_status, latency_ms=pncp_latency)
        if pncp_status != "ok":
            overall = "degraded"
    except Exception:
        pncp_latency = int((time.monotonic() - t0) * 1000)
        services["pncp_api"] = ServiceStatus(status="error", latency_ms=pncp_latency)
        overall = "degraded"

    return HealthResponse(
        status=overall,
        services=services,
        checked_at=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    )
