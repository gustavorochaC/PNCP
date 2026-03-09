import json
from pathlib import Path
from asyncpg import Pool
from app.db.connection import get_pool


async def get_db_pool() -> Pool:
    # #region agent log
    try:
        _log = Path(__file__).resolve().parents[1] / "debug-b6078f.log"
        with open(_log, "a", encoding="utf-8") as _f:
            _f.write(json.dumps({"sessionId": "b6078f", "hypothesisId": "H1", "location": "dependencies.py:get_db_pool", "message": "get_db_pool called", "timestamp": __import__("time").time() * 1000}) + "\n")
    except Exception:
        pass
    # #endregion
    return await get_pool()
