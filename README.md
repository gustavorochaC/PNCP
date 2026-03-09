# PNCP — Busca de Editais

Aplicação para busca de editais de licitação do **Portal Nacional de Contratações Públicas (PNCP)**, com cache local via Supabase para buscas mais rápidas.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | FastAPI + asyncpg |
| Banco | PostgreSQL (Supabase) com Full-Text Search |
| Query | TanStack Query v5 |

## Funcionalidades

- Busca híbrida: Supabase FTS (cache local) + API PNCP em tempo real, em paralelo
- Filtros por palavra-chave, UF, modalidade, status e faixa de valor
- Cache automático — novos registros da API PNCP são salvos em background
- Paginação com ellipsis
- Deduplicação por `pncp_id`

## Estrutura

```
/
├── backend/          # FastAPI
│   ├── app/
│   │   ├── api/v1/   # endpoints: /search, /modalidades, /{pncp_id}
│   │   ├── services/ # pncp_client, supabase_service, search_service
│   │   ├── db/       # asyncpg pool + queries
│   │   └── models/   # Pydantic models
│   └── requirements.txt
├── frontend/         # React + Vite
│   └── src/
│       ├── components/
│       ├── hooks/    # useEditaisSearch
│       └── api/
├── supabase/
│   └── migrations/   # 001_initial_schema.sql
└── package.json      # npm run dev unificado (backend + frontend)
```

## Como rodar

### Pré-requisitos

- Python 3.11+
- Node.js 18+
- Supabase local ou remoto com a migration aplicada

### 1. Banco de dados

Execute a migration no Supabase SQL Editor ou via CLI:

```bash
supabase db push
# ou cole o conteúdo de supabase/migrations/001_initial_schema.sql no SQL Editor
```

### 2. Variáveis de ambiente

Copie e preencha o `.env` na raiz:

```bash
cp backend/.env.example .env
```

Edite `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=<sua_service_role_key>
PNCP_BASE_URL=https://pncp.gov.br/api/consulta/v1
CORS_ORIGINS=http://localhost:5173
VITE_API_BASE_URL=/api/v1
```

Copie também para o backend:

```bash
cp .env backend/.env
```

### 3. Instalar dependências

```bash
# Backend
cd backend && python -m venv .venv
.venv/Scripts/activate      # Windows
pip install -r requirements.txt
cd ..

# Frontend + concurrently
npm install
cd frontend && npm install && cd ..
```

### 4. Rodar

```bash
npm run dev
```

Abre:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Health check: http://localhost:8000/api/v1/health

## API

| Endpoint | Descrição |
|---|---|
| `GET /api/v1/editais/search` | Busca com filtros |
| `GET /api/v1/editais/modalidades` | Lista modalidades |
| `GET /api/v1/editais/{pncp_id}` | Detalhe de um edital |
| `GET /api/v1/health` | Status do backend, DB e API PNCP |

### Parâmetros de busca

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `q` | string | Palavra-chave |
| `uf` | string | Sigla do estado (ex: SP) |
| `modalidade` | string | Código da modalidade (1–13) |
| `status` | string | Status do edital |
| `valor_min` / `valor_max` | decimal | Faixa de valor estimado |
| `data_inicial` / `data_final` | string | Período (YYYY-MM-DD) |
| `page` / `page_size` | int | Paginação |
