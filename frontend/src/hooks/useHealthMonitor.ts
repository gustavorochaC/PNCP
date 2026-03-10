import { useQuery } from '@tanstack/react-query'
import { fetchHealth } from '../api/health'

export function useHealthMonitor() {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
    staleTime: 25_000,
    retry: 1,
  })
}
