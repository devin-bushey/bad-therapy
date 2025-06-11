import { useQuery } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import { fetchDailyTip, type DailyTip } from '../services/tipsService'

export function useTips() {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0()

    const query = useQuery<DailyTip>({
        queryKey: ['dailyTip'],
        queryFn: async () => {
            if (!isAuthenticated) throw new Error('Not authenticated')
            const token = await getAccessTokenSilently()
            return fetchDailyTip(token)
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 30, // 30 minutes
        retry: 1
    })

    return {
        tip: query.data,
        loading: query.isPending,
        error: query.error
    }
}