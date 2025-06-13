import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'

export function useAuthenticatedMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  const { isAuthenticated } = useAuth0()

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      if (!isAuthenticated) {
        throw new Error('Not authenticated')
      }
      return mutationFn(variables)
    },
    ...options,
  })
}