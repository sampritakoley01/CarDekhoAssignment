import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { AppProvider } from '@/context/AppContext'
import AppRouter from '@/router'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15,15,25,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f8fafc',
              backdropFilter: 'blur(16px)',
            },
          }}
        />
      </AppProvider>
    </QueryClientProvider>
  )
}
