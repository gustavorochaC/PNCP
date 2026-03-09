import logging
from typing import Optional, List, Dict, Any
from decimal import Decimal
from asyncpg import Pool

from app.db.queries import search_editais_db, upsert_edital_db, get_edital_by_pncp_id

logger = logging.getLogger(__name__)


class SupabaseService:
    async def search(
        self,
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
        try:
            return await search_editais_db(
                pool=pool,
                q=q,
                uf=uf,
                modalidade=modalidade,
                status=status,
                valor_min=valor_min,
                valor_max=valor_max,
                limit=limit,
                offset=offset,
            )
        except Exception as e:
            logger.error("Supabase search error: %s", e)
            return []

    async def bulk_upsert(self, pool: Pool, payloads: List[Dict[str, Any]]) -> int:
        """Upsert multiple editais. Returns count of successful upserts."""
        count = 0
        for payload in payloads:
            try:
                await upsert_edital_db(pool, payload)
                count += 1
            except Exception as e:
                pncp_id = payload.get("numeroControlePNCP", "unknown")
                logger.warning("Failed to upsert edital %s: %s", pncp_id, e)
        return count

    async def get_by_pncp_id(self, pool: Pool, pncp_id: str) -> Optional[Dict[str, Any]]:
        try:
            return await get_edital_by_pncp_id(pool, pncp_id)
        except Exception as e:
            logger.error("Supabase get_by_pncp_id error: %s", e)
            return None


supabase_service = SupabaseService()
