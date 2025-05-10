import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import { authConfig } from './auth/authConfig.ts'
import Dashboard from './features/dashboard/Dashboard.tsx'
import Chat from './features/session/Chat.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Welcome from './features/welcome/Welcome.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactElement } from 'react'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated, isLoading } = useAuth0()
  if (isLoading) return null
  if (!isAuthenticated) return <Welcome />
  return children
}

function MainRouter() {
  const { isAuthenticated, isLoading } = useAuth0()
  if (isLoading) return null
  if (!isAuthenticated) return <Welcome />
  return <Dashboard />
}

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
            <Route path="/" element={<MainRouter />} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="*" element={<MainRouter />} />
          </Routes>
        </BrowserRouter>
      </Auth0Provider>
    </QueryClientProvider>
  </StrictMode>,
)
