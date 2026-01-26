import React from 'react'

interface EmptyStateProps {
    icon?: string
    title: string
    description?: string
    actionText?: string
    onAction?: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon = '📭',
    title,
    description,
    actionText,
    onAction
}) => {
    return (
        <div className="bg-gray-50 rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
            {description && <p className="text-gray-600 text-sm mb-4">{description}</p>}
            {actionText && onAction && (
                <button
                    onClick={onAction}
                    className="bg-blue-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-600 transition-colors"
                >
                    {actionText}
                </button>
            )}
        </div>
    )
}

export default EmptyState
