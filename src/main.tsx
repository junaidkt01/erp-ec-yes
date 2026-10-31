import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import "./api/interceptor.ts";

import { LanguageProvider } from './i18n/LanguageContext.tsx'
import PWAStatus from './components/PWA/PWAStatus.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disables unwanted API calls and reloads on window/tab switching
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes cache freshness
      networkMode: 'always', // Fail offline so pages leave their loading state instead of pausing
    },
    mutations: {
      networkMode: 'always', // Never hold a write offline and send it later without the user knowing
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LanguageProvider>
          <App />
          <PWAStatus />
        </LanguageProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
