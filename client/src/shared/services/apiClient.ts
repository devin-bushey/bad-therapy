import { useAuth0 } from '@auth0/auth0-react'

const API_URL = import.meta.env.VITE_SERVER_DOMAIN

export class RateLimitError extends Error {
  constructor(message: string, public retryAfterSeconds: number) {
    super(message)
    this.name = 'RateLimitError'
  }
}

export class ApiClient {
  constructor(private getToken: () => Promise<string>) {}

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken()
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      // Handle rate limiting specifically
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        const retrySeconds = retryAfter ? parseInt(retryAfter) : 60
        throw new RateLimitError(
          `Rate limit exceeded. Please wait ${retrySeconds} seconds before trying again.`,
          retrySeconds
        )
      }
      
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export function useApiClient() {
  const { getAccessTokenSilently } = useAuth0()
  return new ApiClient(getAccessTokenSilently)
}