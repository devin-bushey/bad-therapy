import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Auth0Provider } from '@auth0/auth0-react'
import { authConfig } from './auth/authConfig.ts'
import Dashboard from './features/dashboard/Dashboard.tsx'
import Chat from './features/session/Chat.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Welcome from './features/welcome/Welcome.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Auth0Provider
        domain={authConfig.domain}
        clientId={authConfig.clientId}
        authorizationParams={authConfig.authorizationParams}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </BrowserRouter>
      </Auth0Provider>
    </QueryClientProvider>
  </StrictMode>,
)
