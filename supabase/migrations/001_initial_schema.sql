CREATE TYPE pncp_edital_status AS ENUM (
  'publicado', 'aberto', 'encerrado', 'revogado', 'anulado', 'suspenso'
);

CREATE TABLE IF NOT EXISTS pncp_editais (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pncp_id                     TEXT NOT NULL UNIQUE,
  numero_controle_pncp        TEXT,
  numero_compra               TEXT,
  ano_compra                  INTEGER,
  sequencial_compra           INTEGER,
  cnpj_orgao                  TEXT NOT NULL,
  nome_orgao                  TEXT,
  sigla_orgao                 TEXT,
  cnpj_unidade                TEXT,
  nome_unidade                TEXT,
  municipio_nome              TEXT,
  municipio_ibge              TEXT,
  uf                          CHAR(2),
  uf_nome                     TEXT,
  codigo_modalidade_contratacao TEXT NOT NULL,
  modalidade_nome             TEXT,
  modo_disputa_codigo         INTEGER,
  modo_disputa_nome           TEXT,
  situacao_codigo             INTEGER,
  situacao_nome               TEXT,
  status                      pncp_edital_status,
  valor_total_estimado        NUMERIC(18, 2),
  valor_total_homologado      NUMERIC(18, 2),
  data_publicacao_pncp        TIMESTAMPTZ,
  data_abertura_proposta      TIMESTAMPTZ,
  data_encerramento_proposta  TIMESTAMPTZ,
  data_ultima_atualizacao_pncp TIMESTAMPTZ,
  objeto_compra               TEXT,
  informacao_complementar     TEXT,
  justificativa               TEXT,
  link_sistema_origem         TEXT,
  link_edital                 TEXT,
  search_vector               TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce(objeto_compra, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(nome_orgao, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(nome_unidade, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(informacao_complementar, '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(justificativa, '')), 'D')
  ) STORED,
  raw_payload                 JSONB,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fetched_from_pncp_at        TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_pncp_editais_search_vector ON pncp_editais USING GIN (search_vector);
CREATE INDEX idx_pncp_editais_uf ON pncp_editais (uf);
CREATE INDEX idx_pncp_editais_modalidade ON pncp_editais (codigo_modalidade_contratacao);
CREATE INDEX idx_pncp_editais_status ON pncp_editais (status);
CREATE INDEX idx_pncp_editais_valor_estimado ON pncp_editais (valor_total_estimado);
CREATE INDEX idx_pncp_editais_data_publicacao ON pncp_editais (data_publicacao_pncp DESC);
CREATE INDEX idx_pncp_editais_uf_modalidade_data ON pncp_editais (uf, codigo_modalidade_contratacao, data_publicacao_pncp DESC);
CREATE INDEX idx_pncp_editais_raw_payload ON pncp_editais USING GIN (raw_payload);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION pncp_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE TRIGGER trg_pncp_editais_updated_at
  BEFORE UPDATE ON pncp_editais
  FOR EACH ROW EXECUTE FUNCTION pncp_set_updated_at();

-- Full-text search function
CREATE OR REPLACE FUNCTION pncp_search_editais(
  p_query      TEXT    DEFAULT NULL,
  p_uf         CHAR(2) DEFAULT NULL,
  p_modalidade TEXT    DEFAULT NULL,
  p_status     TEXT    DEFAULT NULL,
  p_valor_min  NUMERIC DEFAULT NULL,
  p_valor_max  NUMERIC DEFAULT NULL,
  p_limit      INTEGER DEFAULT 20,
  p_offset     INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID, pncp_id TEXT, numero_compra TEXT, nome_orgao TEXT,
  uf CHAR(2), municipio_nome TEXT, modalidade_nome TEXT,
  objeto_compra TEXT, status pncp_edital_status,
  valor_total_estimado NUMERIC, data_publicacao_pncp TIMESTAMPTZ,
  data_abertura_proposta TIMESTAMPTZ, data_encerramento_proposta TIMESTAMPTZ,
  link_edital TEXT, rank REAL, total_count BIGINT
)
LANGUAGE plpgsql STABLE AS $$
DECLARE v_tsquery TSQUERY;
BEGIN
  IF p_query IS NOT NULL AND trim(p_query) <> '' THEN
    v_tsquery := plainto_tsquery('portuguese', p_query);
  END IF;
  RETURN QUERY
  WITH filtered AS (
    SELECT e.id, e.pncp_id, e.numero_compra, e.nome_orgao, e.uf,
      e.municipio_nome, e.modalidade_nome, e.objeto_compra, e.status,
      e.valor_total_estimado, e.data_publicacao_pncp, e.data_abertura_proposta,
      e.data_encerramento_proposta, e.link_edital,
      CASE WHEN v_tsquery IS NOT NULL THEN ts_rank_cd(e.search_vector, v_tsquery) ELSE 0.0 END AS rank,
      COUNT(*) OVER () AS total_count
    FROM pncp_editais e
    WHERE
      (v_tsquery IS NULL OR e.search_vector @@ v_tsquery)
      AND (p_uf IS NULL OR e.uf = p_uf)
      AND (p_modalidade IS NULL OR e.codigo_modalidade_contratacao = p_modalidade)
      AND (p_status IS NULL OR e.status::TEXT = p_status)
      AND (p_valor_min IS NULL OR e.valor_total_estimado >= p_valor_min)
      AND (p_valor_max IS NULL OR e.valor_total_estimado <= p_valor_max)
    ORDER BY
      CASE WHEN v_tsquery IS NOT NULL THEN ts_rank_cd(e.search_vector, v_tsquery) END DESC NULLS LAST,
      e.data_publicacao_pncp DESC
    LIMIT p_limit OFFSET p_offset
  )
  SELECT * FROM filtered;
END; $$;

-- ============================================================
-- Roles
-- ============================================================

DO $$
BEGIN
  -- PNCP_service: backend service account (leitura + escrita)
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'PNCP_service') THEN
    CREATE ROLE "PNCP_service" NOLOGIN NOINHERIT;
  END IF;

  -- PNCP_readonly: acesso somente-leitura (consultas / relatórios)
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'PNCP_readonly') THEN
    CREATE ROLE "PNCP_readonly" NOLOGIN NOINHERIT;
  END IF;
END $$;

-- Permissões no schema public
GRANT USAGE ON SCHEMA public TO "PNCP_service";
GRANT USAGE ON SCHEMA public TO "PNCP_readonly";

-- PNCP_service: acesso completo à tabela pncp_editais
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pncp_editais TO "PNCP_service";

-- PNCP_readonly: somente leitura
GRANT SELECT ON TABLE public.pncp_editais TO "PNCP_readonly";

-- Funções: PNCP_service executa tudo, PNCP_readonly só a de busca
GRANT EXECUTE ON FUNCTION public.pncp_search_editais(TEXT, CHAR, TEXT, TEXT, NUMERIC, NUMERIC, INTEGER, INTEGER) TO "PNCP_service";
GRANT EXECUTE ON FUNCTION public.pncp_upsert_edital(JSONB) TO "PNCP_service";
GRANT EXECUTE ON FUNCTION public.pncp_set_updated_at() TO "PNCP_service";
GRANT EXECUTE ON FUNCTION public.pncp_search_editais(TEXT, CHAR, TEXT, TEXT, NUMERIC, NUMERIC, INTEGER, INTEGER) TO "PNCP_readonly";

-- Garantir que futuros objetos no schema também sejam acessíveis
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "PNCP_service";

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO "PNCP_readonly";

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO "PNCP_service";

-- ============================================================
-- Upsert function (store PNCP results)
CREATE OR REPLACE FUNCTION pncp_upsert_edital(p_payload JSONB)
RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO pncp_editais (
    pncp_id, numero_controle_pncp, numero_compra, ano_compra, sequencial_compra,
    cnpj_orgao, nome_orgao, sigla_orgao, cnpj_unidade, nome_unidade,
    municipio_nome, uf, uf_nome, codigo_modalidade_contratacao, modalidade_nome,
    situacao_codigo, situacao_nome, valor_total_estimado, valor_total_homologado,
    data_publicacao_pncp, data_abertura_proposta, data_encerramento_proposta,
    data_ultima_atualizacao_pncp, objeto_compra, informacao_complementar,
    link_sistema_origem, link_edital, raw_payload, fetched_from_pncp_at
  ) VALUES (
    p_payload->>'numeroControlePNCP', p_payload->>'numeroControlePNCP',
    p_payload->>'numeroCompra', (p_payload->>'anoCompra')::INTEGER,
    (p_payload->>'sequencialCompra')::INTEGER,
    p_payload->'orgaoEntidade'->>'cnpj', p_payload->'orgaoEntidade'->>'razaoSocial',
    p_payload->'orgaoEntidade'->>'nomeFantasia', p_payload->'unidadeOrgao'->>'cnpjUnidade',
    p_payload->'unidadeOrgao'->>'nomeUnidade', p_payload->'unidadeOrgao'->>'municipioNome',
    p_payload->'unidadeOrgao'->>'ufSigla', p_payload->'unidadeOrgao'->>'ufNome',
    p_payload->'modalidadeContratacao'->>'codigo', p_payload->'modalidadeContratacao'->>'descricao',
    (p_payload->'situacaoCompra'->>'codigo')::INTEGER, p_payload->'situacaoCompra'->>'descricao',
    (p_payload->>'valorTotalEstimado')::NUMERIC, (p_payload->>'valorTotalHomologado')::NUMERIC,
    (p_payload->>'dataPublicacaoPncp')::TIMESTAMPTZ, (p_payload->>'dataAberturaProposta')::TIMESTAMPTZ,
    (p_payload->>'dataEncerramentoProposta')::TIMESTAMPTZ, (p_payload->>'dataAtualizacao')::TIMESTAMPTZ,
    p_payload->>'objetoCompra', p_payload->>'informacaoComplementar',
    p_payload->>'linkSistemaOrigem', p_payload->>'linkEdital',
    p_payload, NOW()
  )
  ON CONFLICT (pncp_id) DO UPDATE SET
    situacao_codigo = EXCLUDED.situacao_codigo,
    situacao_nome = EXCLUDED.situacao_nome,
    valor_total_estimado = EXCLUDED.valor_total_estimado,
    valor_total_homologado = EXCLUDED.valor_total_homologado,
    data_encerramento_proposta = EXCLUDED.data_encerramento_proposta,
    data_ultima_atualizacao_pncp = EXCLUDED.data_ultima_atualizacao_pncp,
    informacao_complementar = EXCLUDED.informacao_complementar,
    raw_payload = EXCLUDED.raw_payload,
    fetched_from_pncp_at = NOW()
  RETURNING id INTO v_id;
  RETURN v_id;
END; $$;
