import time
import httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1.router import router
from app.db.connection import get_pool, close_pool


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


@app.get("/api/v1/health")
async def health():
    result = {"status": "ok", "db": "unknown", "pncp_api": "unknown"}

    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        result["db"] = "ok"
    except Exception as e:
        result["db"] = f"error: {e}"
        result["status"] = "degraded"

    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(
                f"{settings.pncp_base_url}/contratacoes/publicacao",
                params={"dataInicial": "20240101", "dataFinal": "20240101", "pagina": 1, "tamanhoPagina": 10, "codigoModalidadeContratacao": 6},
            )
            result["pncp_api"] = "ok" if resp.status_code < 500 else f"http_{resp.status_code}"
    except Exception as e:
        result["pncp_api"] = f"error: {e}"
        result["status"] = "degraded"

    return result
