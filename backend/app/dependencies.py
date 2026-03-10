from asyncpg import Pool
from app.db.connection import get_pool


async def get_db_pool() -> Pool:
    return await get_pool()
