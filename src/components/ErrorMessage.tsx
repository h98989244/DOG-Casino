import React from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
    message: string
    onRetry?: () => void
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
    return (
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 text-center">
            <AlertCircle className="mx-auto mb-3 text-red-500" size={48} />
            <h3 className="text-lg font-bold text-red-800 mb-2">發生錯誤</h3>
            <p className="text-red-600 text-sm mb-4">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                    重試
                </button>
            )}
        </div>
    )
}

export default ErrorMessage
