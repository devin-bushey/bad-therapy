import { useState } from 'react'

interface DeleteAccountModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isDeleting: boolean
}

export default function DeleteAccountModal({ isOpen, onClose, onConfirm, isDeleting }: DeleteAccountModalProps) {
    const [confirmText, setConfirmText] = useState('')
    const isConfirmEnabled = confirmText === 'DELETE'

    if (!isOpen) return null

    const handleConfirm = () => {
        if (isConfirmEnabled) {
            onConfirm()
        }
    }

    const handleClose = () => {
        setConfirmText('')
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-warm-100 border border-warm-200 rounded-3xl shadow-lg p-8 max-w-md w-full mx-4">
                <h3 className="text-warm-800 font-bold text-2xl mb-4 text-center">Delete Account</h3>
                
                <div className="text-warm-700 text-sm mb-6 space-y-3">
                    <p className="font-semibold text-red-600">⚠️ This action cannot be undone.</p>
                    <p>Deleting your account will permanently remove:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Your profile information</li>
                        <li>All therapy sessions and conversations</li>
                        <li>Journal entries and mood tracking data</li>
                        <li>All other personal data</li>
                    </ul>
                </div>

                <div className="mb-6">
                    <label htmlFor="confirm-delete" className="block text-warm-800 font-medium text-sm mb-2">
                        Type <span className="font-bold">DELETE</span> to confirm:
                    </label>
                    <input
                        id="confirm-delete"
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        className="w-full bg-warm-50 text-warm-800 border border-warm-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Type DELETE here"
                        disabled={isDeleting}
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleClose}
                        disabled={isDeleting}
                        className="flex-1 bg-warm-300 text-warm-800 border-none rounded-lg py-3 px-4 font-medium text-base cursor-pointer hover:bg-warm-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!isConfirmEnabled || isDeleting}
                        className="flex-1 bg-red-500 text-white border-none rounded-lg py-3 px-4 font-medium text-base cursor-pointer hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Account'}
                    </button>
                </div>
            </div>
        </div>
    )
}