import api from '@/lib/axios'
import type { RecommendationRequest, RecommendationResponse } from '@/types/api'

export const postRecommendation = async (
  payload: RecommendationRequest
): Promise<RecommendationResponse> => {
  const { data } = await api.post<RecommendationResponse>('/api/v1/recommendation', payload)
  return data
}
