import { useState, useEffect } from 'react'
import { supabase, Transaction } from '../lib/supabase'
import { useAuth } from './useAuth'

interface UseUserTransactionsOptions {
    limit?: number
    type?: string
    status?: string
}

export const useUserTransactions = (options: UseUserTransactionsOptions = {}) => {
    const { user } = useAuth()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(false)

    const { limit = 20, type, status } = options

    useEffect(() => {
        if (!user) {
            setTransactions([])
            setLoading(false)
            return
        }

        const fetchTransactions = async () => {
            try {
                setLoading(true)

                let query = supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(limit)

                if (type) {
                    query = query.eq('type', type)
                }

                if (status) {
                    query = query.eq('status', status)
                }

                const { data, error } = await query

                if (error) {
                    setError(error.message)
                    setTransactions([])
                } else {
                    setTransactions(data || [])
                    setHasMore((data?.length || 0) >= limit)
                    setError(null)
                }
            } catch (err: any) {
                setError(err.message || '獲取交易紀錄失敗')
                setTransactions([])
            } finally {
                setLoading(false)
            }
        }

        fetchTransactions()
    }, [user, limit, type, status])

    return { transactions, loading, error, hasMore }
}
