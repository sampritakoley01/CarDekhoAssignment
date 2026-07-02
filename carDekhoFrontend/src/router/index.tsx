import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const LandingPage        = lazy(() => import('@/pages/LandingPage'))
const QuestionnairePage  = lazy(() => import('@/pages/QuestionnairePage'))
const LoadingPage        = lazy(() => import('@/pages/LoadingPage'))
const RecommendationPage = lazy(() => import('@/pages/RecommendationPage'))
const ComparePage        = lazy(() => import('@/pages/ComparePage'))
const ChatPage           = lazy(() => import('@/pages/ChatPage'))

const router = createBrowserRouter([
  { path: '/',               element: <LandingPage /> },
  { path: '/questionnaire',  element: <QuestionnairePage /> },
  { path: '/loading',        element: <LoadingPage /> },
  { path: '/recommendations',element: <RecommendationPage /> },
  { path: '/compare',        element: <ComparePage /> },
  { path: '/chat',           element: <ChatPage /> },
])

export default function AppRouter() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#050508' }}>
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  )
}
