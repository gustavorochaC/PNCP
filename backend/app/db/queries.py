from typing import Optional, List, Dict, Any
from asyncpg import Pool
from decimal import Decimal


async def search_editais_db(
    pool: Pool,
    q: Optional[str] = None,
    uf: Optional[str] = None,
    modalidade: Optional[str] = None,
    status: Optional[str] = None,
    valor_min: Optional[Decimal] = None,
    valor_max: Optional[Decimal] = None,
    limit: int = 20,
    offset: int = 0,
) -> List[Dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM pncp_search_editais($1, $2, $3, $4, $5, $6, $7, $8)",
            q or None,
            uf or None,
            modalidade or None,
            status or None,
            float(valor_min) if valor_min is not None else None,
            float(valor_max) if valor_max is not None else None,
            limit,
            offset,
        )
    return [dict(r) for r in rows]


async def upsert_edital_db(pool: Pool, payload: Dict[str, Any]) -> Optional[str]:
    import json
    async with pool.acquire() as conn:
        result = await conn.fetchval(
            "SELECT pncp_upsert_edital($1::jsonb)",
            json.dumps(payload),
        )
    return str(result) if result else None


async def get_edital_by_pncp_id(pool: Pool, pncp_id: str) -> Optional[Dict[str, Any]]:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM pncp_editais WHERE pncp_id = $1",
            pncp_id,
        )
    return dict(row) if row else None
