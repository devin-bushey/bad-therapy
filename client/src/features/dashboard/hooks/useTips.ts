import { useAuthenticatedQuery } from '../../../shared/hooks/useAuthenticatedQuery'
import { useTipsApi } from '../services/tipsService'
import type { DailyTip } from '../../../shared/types/api.types'

export function useTips() {
    const tipsApi = useTipsApi()

    const query = useAuthenticatedQuery<DailyTip>(
        ['dailyTip'],
        () => tipsApi.getDailyTip(),
        {
            staleTime: 1000 * 60 * 30, // 30 minutes
            retry: 1
        }
    )

    return {
        tip: query.data,
        loading: query.isPending,
        error: query.error
    }
}