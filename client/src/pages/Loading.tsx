import { LoadingSpinner } from '../shared/components/ui/LoadingSpinner'

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-warm-50">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" className="text-earth-500" />
                <div className="mt-6 text-earth-500 text-lg">Loading…</div>
            </div>
        </div>
    )
}
