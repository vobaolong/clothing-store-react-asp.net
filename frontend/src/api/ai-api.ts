import { apiClient, apiData } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints.constant'
import type { ChatMessage, ChatResponse } from '@/types'

export const aiChat = async (
  message: string,
  history?: ChatMessage[]
): Promise<ChatResponse> => {
  return apiData<ChatResponse>(
    apiClient.post(API_ENDPOINTS.ai.chat, {
      message,
      history: history
        ?.filter((m) => !m.loading)
        .map((m) => ({ role: m.role, text: m.content })),
    })
  )
}