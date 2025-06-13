import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'

export function useAuthenticatedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  const { isAuthenticated } = useAuth0()

  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      if (!isAuthenticated) {
        throw new Error('Not authenticated')
      }
      return queryFn()
    },
    enabled: isAuthenticated,
    ...options,
  })
}