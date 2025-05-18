import { StrictMode, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Auth0Provider } from '@auth0/auth0-react'
import { authConfig } from './auth/authConfig.ts'
import Dashboard from './features/dashboard/Dashboard.tsx'
import Chat from './features/session/Chat.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UserProfileForm from './features/profile/UserProfileForm.tsx'
import ProtectedRoute from './auth/ProtectedRoute.tsx'
import PageNotFound from './pages/PageNotFound.tsx'
import Journal from './features/journal/Journal.tsx'

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
            <Route path="/dashboard" element={createElement(ProtectedRoute(Dashboard))} />
            <Route path="/chat" element={createElement(ProtectedRoute(Chat))} />
            <Route path="/user" element={createElement(ProtectedRoute(UserProfileForm))} />
            <Route path="/journal" element={createElement(ProtectedRoute(Journal))} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      </Auth0Provider>
    </QueryClientProvider>
  </StrictMode>,
)
