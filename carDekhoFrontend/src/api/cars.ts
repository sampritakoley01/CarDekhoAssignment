import api from '@/lib/axios'
import type { CarDetail } from '@/types/api'

export const getCarById = async (id: string): Promise<CarDetail> => {
  const { data } = await api.get<CarDetail>(`/api/v1/cars/${id}`)
  return data
}
