import React, { createContext, useContext, useState, type ReactNode } from 'react'
import type { RecommendationRequest, RecommendationResponse } from '@/types/api'

interface AppState {
  // Questionnaire answers
  questionnaireAnswers: Partial<RecommendationRequest>
  setQuestionnaireAnswers: (answers: Partial<RecommendationRequest>) => void

  // Recommendation session
  recommendationId: string | null
  setRecommendationId: (id: string) => void

  recommendationData: RecommendationResponse | null
  setRecommendationData: (data: RecommendationResponse) => void

  // Compare selection (max 2 carIds)
  selectedForCompare: string[]
  toggleCompare: (carId: string) => void
  clearCompare: () => void

  // Chat context
  chatRecommendationId: string | null
  setChatRecommendationId: (id: string) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Partial<RecommendationRequest>>({})
  const [recommendationId, setRecommendationId] = useState<string | null>(null)
  const [recommendationData, setRecommendationData] = useState<RecommendationResponse | null>(null)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([])
  const [chatRecommendationId, setChatRecommendationId] = useState<string | null>(null)

  const toggleCompare = (carId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(carId)) return prev.filter((id) => id !== carId)
      if (prev.length >= 2) return prev // max 2
      return [...prev, carId]
    })
  }

  const clearCompare = () => setSelectedForCompare([])

  return (
    <AppContext.Provider
      value={{
        questionnaireAnswers,
        setQuestionnaireAnswers,
        recommendationId,
        setRecommendationId,
        recommendationData,
        setRecommendationData,
        selectedForCompare,
        toggleCompare,
        clearCompare,
        chatRecommendationId,
        setChatRecommendationId,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
