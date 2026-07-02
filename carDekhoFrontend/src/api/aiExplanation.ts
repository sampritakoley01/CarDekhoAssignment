import api from '@/lib/axios'
import type { AIExplanationRequest, AIExplanationResponse } from '@/types/api'

export const postAIExplanation = async (
  payload: AIExplanationRequest
): Promise<AIExplanationResponse> => {
  const { data } = await api.post<AIExplanationResponse>('/api/v1/ai/explanation', payload)
  return data
}
