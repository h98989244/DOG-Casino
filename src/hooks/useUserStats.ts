import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

interface UserStats {
    balance: number
    betCount: number
    vipLevel: number
    totalWinAmount: number
    totalBetAmount: number
}

export const useUserStats = () => {
    const { user, loading: authLoading } = useAuth()
    const [stats, setStats] = useState<UserStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (authLoading) return

        if (!user) {
            setStats(null)
            setLoading(false)
            return
        }

        const fetchStats = async () => {
            try {
                setLoading(true)

                // 獲取會員基本資料(餘額、VIP等級)
                const { data: profile, error: profileError } = await supabase
                    .from('user_profiles')
                    .select('balance, vip_level')
                    .eq('id', user.id)
                    .single()

                if (profileError) throw profileError

                // 獲取投注統計
                const { data: bets, error: betsError } = await supabase
                    .from('bets')
                    .select('bet_amount, win_amount')
                    .eq('user_id', user.id)

                if (betsError) throw betsError

                const betCount = bets?.length || 0
                const totalBetAmount = bets?.reduce((sum, bet) => sum + bet.bet_amount, 0) || 0
                const totalWinAmount = bets?.reduce((sum, bet) => sum + bet.win_amount, 0) || 0

                setStats({
                    balance: profile?.balance || 0,
                    betCount,
                    vipLevel: profile?.vip_level || 0,
                    totalWinAmount,
                    totalBetAmount
                })
                setError(null)
            } catch (err: any) {
                setError(err.message || '獲取統計資料失敗')
                setStats(null)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [user, authLoading])

    return { stats, loading, error }
}
