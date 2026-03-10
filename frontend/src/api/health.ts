import axios from 'axios'

export interface ServiceStatus {
  status: 'ok' | 'degraded' | 'error'
  latency_ms: number
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error'
  services: {
    database: ServiceStatus
    pncp_api: ServiceStatus
  }
  checked_at: string
}

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await axios.get<HealthResponse>('/api/v1/health')
  return data
}
