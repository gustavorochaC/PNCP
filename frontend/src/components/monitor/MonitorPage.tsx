import React, { useState } from 'react'
import axios from 'axios'
import { useHealthMonitor } from '../../hooks/useHealthMonitor'
import { RefreshCw, CheckCircle2, XCircle, AlertCircle, Clock, Play } from 'lucide-react'

interface EndpointResult {
  status: number
  latency_ms: number
}

type EndpointState = 'idle' | 'testing' | 'ok' | 'error'

interface EndpointEntry {
  label: string
  path: string
  state: EndpointState
  result: EndpointResult | null
}

const ENDPOINTS: { label: string; path: string }[] = [
  { label: 'Health', path: '/api/v1/health' },
  { label: 'Modalidades', path: '/api/v1/editais/modalidades' },
  { label: 'Busca (p.1)', path: '/api/v1/editais/search?page=1&page_size=2' },
]

function StatusDot({ status }: { status: 'ok' | 'degraded' | 'error' | undefined }) {
  if (status === 'ok')
    return <span className="size-2.5 rounded-full bg-emerald-500" />
  if (status === 'degraded')
    return <span className="size-2.5 rounded-full bg-amber-400" />
  return <span className="size-2.5 rounded-full bg-red-500" />
}

function StatusBadge({ status }: { status: 'ok' | 'degraded' | 'error' | undefined }) {
  if (status === 'ok')
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20">
        Online
      </span>
    )
  if (status === 'degraded')
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-600/20">
        Degradado
      </span>
    )
  return (
    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-600/20">
      Offline
    </span>
  )
}

function ServiceCard({
  name,
  status,
  latency_ms,
  loading,
}: {
  name: string
  status: 'ok' | 'degraded' | 'error' | undefined
  latency_ms: number | undefined
  loading: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{name}</span>
        {loading ? (
          <span className="size-2.5 rounded-full bg-muted animate-pulse" />
        ) : (
          <StatusDot status={status} />
        )}
      </div>
      <div className="flex items-center justify-between">
        <StatusBadge status={status} />
        {latency_ms !== undefined && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {latency_ms} ms
          </span>
        )}
      </div>
    </div>
  )
}

function secondsAgo(ts: number): number {
  return Math.floor((Date.now() - ts) / 1000)
}

export function MonitorPage() {
  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useHealthMonitor()

  const [endpoints, setEndpoints] = useState<EndpointEntry[]>(
    ENDPOINTS.map(e => ({ ...e, state: 'idle', result: null }))
  )

  async function testEndpoint(index: number) {
    setEndpoints(prev =>
      prev.map((e, i) => (i === index ? { ...e, state: 'testing', result: null } : e))
    )
    const path = endpoints[index].path
    const t0 = performance.now()
    try {
      const resp = await axios.get(path)
      const latency_ms = Math.round(performance.now() - t0)
      setEndpoints(prev =>
        prev.map((e, i) =>
          i === index ? { ...e, state: 'ok', result: { status: resp.status, latency_ms } } : e
        )
      )
    } catch (err: unknown) {
      const latency_ms = Math.round(performance.now() - t0)
      const status = (err as { response?: { status: number } })?.response?.status ?? 0
      setEndpoints(prev =>
        prev.map((e, i) =>
          i === index ? { ...e, state: 'error', result: { status, latency_ms } } : e
        )
      )
    }
  }

  const backendStatus: 'ok' | 'degraded' | 'error' | undefined = error
    ? 'error'
    : data
    ? 'ok'
    : undefined

  const lastCheckedSecs = dataUpdatedAt ? secondsAgo(dataUpdatedAt) : null

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Monitor de APIs</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Status em tempo real dos serviços</p>
        </div>
        <div className="flex items-center gap-3">
          {isFetching && (
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-blue-500 animate-ping" />
              Atualizando…
            </span>
          )}
          {!isFetching && lastCheckedSecs !== null && (
            <span className="text-xs text-muted-foreground">
              Última verificação: {lastCheckedSecs}s atrás
            </span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar agora
          </button>
        </div>
      </div>

      {/* Service Cards */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Serviços
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ServiceCard
            name="Backend API"
            status={backendStatus}
            latency_ms={undefined}
            loading={isLoading}
          />
          <ServiceCard
            name="Database"
            status={data?.services?.database?.status}
            latency_ms={data?.services?.database?.latency_ms}
            loading={isLoading}
          />
          <ServiceCard
            name="PNCP API Externa"
            status={data?.services?.pncp_api?.status}
            latency_ms={data?.services?.pncp_api?.latency_ms}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Endpoint Tester */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Teste de Endpoints
        </p>
        <div className="rounded-xl border border-border bg-card shadow-sm divide-y divide-border">
          {endpoints.map((ep, i) => (
            <div key={ep.path} className="flex items-center gap-4 px-5 py-3.5">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 ring-1 ring-blue-600/20 shrink-0">
                GET
              </span>
              <span className="flex-1 font-mono text-sm text-foreground truncate">{ep.path}</span>

              {ep.state === 'testing' && (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <RefreshCw className="size-3 animate-spin" /> Testando…
                </span>
              )}
              {ep.state === 'ok' && ep.result && (
                <span className="flex items-center gap-2 text-xs text-emerald-600">
                  <CheckCircle2 className="size-3.5" />
                  <span className="font-mono">{ep.result.status}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{ep.result.latency_ms}ms</span>
                </span>
              )}
              {ep.state === 'error' && ep.result && (
                <span className="flex items-center gap-2 text-xs text-red-600">
                  <XCircle className="size-3.5" />
                  <span className="font-mono">{ep.result.status || 'ERR'}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{ep.result.latency_ms}ms</span>
                </span>
              )}
              {ep.state === 'idle' && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="size-3.5" /> —
                </span>
              )}

              <button
                onClick={() => testEndpoint(i)}
                disabled={ep.state === 'testing'}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 shrink-0"
              >
                <Play className="size-3" />
                Testar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Checked at */}
      {data?.checked_at && (
        <p className="text-xs text-muted-foreground">
          Verificado em: {new Date(data.checked_at).toLocaleString('pt-BR')}
        </p>
      )}
    </div>
  )
}
