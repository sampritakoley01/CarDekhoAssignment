import api from '@/lib/axios'
import type { ChatRequest, ChatResponse } from '@/types/api'

export const postChat = async (payload: ChatRequest): Promise<ChatResponse> => {
  const { data } = await api.post<ChatResponse>('/api/v1/chat', payload)
  return data
}
