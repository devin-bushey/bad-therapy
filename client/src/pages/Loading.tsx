import { LoadingSpinner } from '../shared/components/ui/LoadingSpinner'

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" className="text-blue-400" />
                <div className="mt-6 text-blue-400 text-lg">Loading…</div>
            </div>
        </div>
    )
}
