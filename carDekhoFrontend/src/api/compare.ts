import api from '@/lib/axios'
import type { CompareRequest, CompareResponse } from '@/types/api'

export const postCompare = async (payload: CompareRequest): Promise<CompareResponse> => {
  const { data } = await api.post<CompareResponse>('/api/v1/compare', payload)
  return data
}
