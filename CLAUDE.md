# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Desenvolvimento (recomendado)
Na raiz do projeto, um único comando sobe backend e frontend:
```bash
npm install        # uma vez (raiz + frontend)
npm run dev        # backend (porta 8000) + frontend (porta 5173) via concurrently
```
O backend é iniciado por `scripts/start-backend.js` (Node), que chama o Python do venv com o caminho correto — evita falha no Windows onde o cmd interpreta `.venv/Scripts/python` como comando e o backend não sobe (ECONNREFUSED / "Request failed with status code 500" no proxy).

### Backend (manual)
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows PowerShell
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
**Env:** O FastAPI carrega `.env` do diretório de trabalho. Ao rodar de dentro de `backend/`, use `backend/.env` (copie da raiz ou crie). Nunca commitar `.env` (já está no `.gitignore`).

### Frontend (manual)
```bash
cd frontend
npm install
npm run dev        # Dev server on port 5173, proxy /api → localhost:8000
npm run build      # tsc + vite build
npm run lint       # ESLint
```

### Database
- **Arquivo único:** `supabase/migrations/001_initial_schema.sql` define tipo, tabela, índices, trigger, funções, roles e permissões.
- **Aplicar local:** `supabase db push` ou executar o SQL no Supabase SQL Editor.
- **Aplicar via MCP Supabase:** O script completo em uma chamada pode falhar por parsing (delimitadores `$$`). Foi aplicado em 7 migrations: tipo+tabela, índices, trigger+função updated_at, função search, roles, função upsert, grants. Para novos ambientes, preferir o arquivo único via CLI ou SQL Editor.

## Environment

- **Raiz:** `.env` contém variáveis do backend e do frontend (ex.: `VITE_API_BASE_URL`). `DATABASE_URL` deve apontar para o Postgres (Supabase local: porta **54322**, usuário/senha padrão `postgres`/`postgres`; mesmo host do Supabase API, ex. `postgresql://postgres:postgres@192.168.1.220:54322/postgres` ou `127.0.0.1` se local).
- **Backend:** Ao rodar `uvicorn` de dentro de `backend/`, o Pydantic Settings carrega `backend/.env`. Manter esse arquivo em sync com as variáveis do backend (não commitar).

## Naming convention (schema public)

Objetos do schema `public` relacionados ao PNCP usam o prefixo **`pncp_`**:

| Tipo     | Exemplo |
|----------|---------|
| Tipo     | `pncp_edital_status` |
| Tabela   | `pncp_editais` |
| Índices  | `idx_pncp_editais_*` |
| Funções  | `pncp_search_editais`, `pncp_upsert_edital`, `pncp_set_updated_at` |
| Trigger  | `trg_pncp_editais_updated_at` |

As **roles** continuam com prefixo em maiúsculas: `PNCP_service`, `PNCP_readonly`.

## Architecture

### Overview
Monorepo with three parts: `/backend` (FastAPI), `/frontend` (React/Vite), `/supabase` (PostgreSQL migrations). The app searches Brazilian public procurement notices (editais) from the PNCP API with a local Supabase cache.

### Hybrid Search Flow
1. User submits filters → frontend `useEditaisSearch` hook commits them to TanStack Query
2. Backend `GET /api/v1/editais/search` runs `asyncio.gather(supabase_search, pncp_api_search, return_exceptions=True)`
3. Results are deduplicated by `pncp_id` (Supabase takes priority for full fields)
4. Sorted by full-text rank DESC, then `data_publicacao_pncp` DESC
5. New records from PNCP API are upserted to Supabase via `asyncio.create_task` (non-blocking)

### Backend (`backend/app/`)
- **`main.py`** — FastAPI app, CORS, asyncpg lifespan, `/api/v1/health`
- **`config.py`** — Pydantic Settings from `.env`
- **`db/connection.py`** — asyncpg pool singleton (min=2, max=10)
- **`db/queries.py`** — thin asyncpg wrappers calling SQL functions `pncp_search_editais()` and `pncp_upsert_edital()`, and table `pncp_editais`
- **`services/pncp_client.py`** — singleton httpx async client; defaults to last 90 days; caps page_size at 50; returns `{"data": [], "totalRegistros": 0}` on any error
- **`services/supabase_service.py`** — wraps queries.py; `search()` and `bulk_upsert()` with per-item error isolation
- **`services/search_service.py`** — hybrid merge logic (the critical piece)
- **`api/v1/editais.py`** — three endpoints: `/search`, `/modalidades`, `/{pncp_id:path}`

### Frontend (`frontend/src/`)
- **`hooks/useEditaisSearch.ts`** — separates `filters` (form state) from `committed` (TanStack Query key); `commit()` resets page to 1
- **`api/editais.ts`** — axios client pointing to `VITE_API_BASE_URL` (`/api/v1` by default)
- **`components/SearchForm/KeywordInput.tsx`** — Enter triggers immediate commit; debounce foi removido (não dispara commit automático ao digitar)
- Select changes in `SearchForm` trigger `commit()` immediately (no debounce)
- **`components/ResultsList/`** — shows `total_items`, `search_time_ms`, sources in metadata
- **`components/Pagination/`** — ellipsis pagination, connected to `setPage` from hook

### Database
- **Table `pncp_editais`** — `pncp_id TEXT UNIQUE` is the deduplication key
- **`search_vector`** — `TSVECTOR GENERATED ALWAYS AS (...) STORED`; Portuguese tokenization; weights: objeto_compra=A, nome_orgao/unidade=B, informacao_complementar=C, justificativa=D
- **`pncp_search_editais()`** SQL function — `plainto_tsquery` (safe for user input), `ts_rank_cd`, `COUNT(*) OVER()` for total_count, called directly via asyncpg (not supabase-py)
- **`pncp_upsert_edital()`** SQL function — accepts raw JSONB payload; `ON CONFLICT (pncp_id) DO UPDATE`
- **Roles** — `PNCP_service` (read/write) and `PNCP_readonly` (read-only); `NOLOGIN NOINHERIT`; grant login users access via `GRANT "PNCP_service" TO <login_user>`

### Dev Proxy
Vite proxies `/api` → `http://localhost:8000`, so frontend requests to `/api/v1/...` reach the FastAPI backend during development.

### Script de start do backend (Windows/cross-platform)
- **`scripts/start-backend.js`** — Script Node que inicia o uvicorn usando o Python do `.venv` do backend (path correto para Windows `Scripts\python.exe` e Unix `bin/python`). Usado por `npm run dev:backend` para que o backend suba corretamente no cmd do Windows, onde `.venv/Scripts/python` seria interpretado como comando e falharia.

### Key Design Decisions
- asyncpg is used directly (not supabase-py) for calling custom SQL functions with a proper async connection pool
- `raw_payload JSONB` with GIN index stores the full PNCP API response for future LLM analysis without schema migrations
- `return_exceptions=True` in `asyncio.gather` means if either source (Supabase or PNCP API) fails, results from the other still return
- TanStack Query `keepPreviousData` pattern prevents flicker when changing pages

## PNCP API — Notas importantes

- **Endpoint correto:** `/contratacoes/publicacao` (sem 's') — o antigo `/publicacoes` retorna 404
- **`codigoModalidadeContratacao` é obrigatório** — sem ele a API retorna 400; `pncp_client.py` faz buscas paralelas em [6, 8, 4, 9] quando nenhuma modalidade é especificada
- **`tamanhoPagina` mínimo = 10** — valores menores retornam 400
- **Campos diretos (não aninhados):** `modalidadeNome` (não `modalidadeContratacao.descricao`), `situacaoCompraNome` (não `situacaoCompra.descricao`), `linkSistemaOrigem` (não `linkEdital`)
- **Upsert SQL:** `pncp_upsert_edital()` espera formato aninhado antigo; `_normalize_for_upsert()` em `search_service.py` converte antes do cache

## Dev — Gotchas

- **Backend não sobe no Windows:** No cmd, `cd backend && .venv/Scripts/python ...` falha com "não é reconhecido como comando" porque `.venv` é interpretado como executável. Use sempre `npm run dev` na raiz (que chama `scripts/start-backend.js`) ou, manualmente, ative o venv e rode `uvicorn` a partir de `backend/`.
- **Erro 500 / ECONNREFUSED na busca:** Se o frontend mostra "Erro ao buscar editais" ou "Request failed with status code 500", o proxy não consegue falar com o backend — confira se o processo [BACK] está rodando na porta 8000. Reinicie com `npm run dev` na raiz.
- Se mudanças no backend não refletirem, verificar se uvicorn está com `--reload`: `wmic process where "ProcessId=<PID>" get CommandLine` — PID via `netstat -ano | grep :8000`
- Sempre rodar via `npm run dev` na raiz (já inclui `--reload`); uvicorn iniciado manualmente pode não ter o flag

## Testing (quick checks)

Com backend e frontend rodando:
- **Health:** `GET http://localhost:8000/api/v1/health` → `{"status":"ok","db":"ok","pncp_api":"ok"}`
- **Modalidades:** `GET http://localhost:8000/api/v1/editais/modalidades` → lista de modalidades
- **Busca:** `GET http://localhost:8000/api/v1/editais/search?page=1&page_size=2` → `data`, `pagination`, `meta` (primeira busca pode demorar por causa da API PNCP)
- **App:** abrir http://localhost:5173 e usar o formulário de busca
