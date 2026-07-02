import api from '@/lib/axios'
import type { FiltersResponse } from '@/types/api'

export const getFilters = async (): Promise<FiltersResponse> => {
  const { data } = await api.get<FiltersResponse>('/api/v1/filters')
  return data
}
