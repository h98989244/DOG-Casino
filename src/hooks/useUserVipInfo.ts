import { useState, useEffect } from 'react'
import { supabase, VipLevel } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useUserProfile } from './useUserProfile'

export const useUserVipInfo = () => {
    const { user } = useAuth()
    const { profile } = useUserProfile()
    const [totalDeposit, setTotalDeposit] = useState(0)
    const [currentLevelInfo, setCurrentLevelInfo] = useState<VipLevel | null>(null)
    const [nextLevel, setNextLevel] = useState<VipLevel | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user || !profile) {
            setLoading(false)
            return
        }

        const fetchVipInfo = async () => {
            try {
                setLoading(true)

                // 計算累計儲值金額
                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('amount')
                    .eq('user_id', user.id)
                    .eq('type', 'deposit')
                    .eq('status', 'completed')

                const total = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0
                setTotalDeposit(total)

                // 獲取當前等級資訊
                const { data: currentLevel } = await supabase
                    .from('vip_levels')
                    .select('*')
                    .eq('level', profile.vip_level)
                    .single()

                setCurrentLevelInfo(currentLevel)

                // 獲取下一個等級資訊
                const { data: nextLevelData } = await supabase
                    .from('vip_levels')
                    .select('*')
                    .gt('level', profile.vip_level)
                    .order('level', { ascending: true })
                    .limit(1)
                    .maybeSingle()

                setNextLevel(nextLevelData)
            } catch (err) {
                console.error('獲取 VIP 資訊失敗:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchVipInfo()
    }, [user, profile])

    return { totalDeposit, currentLevelInfo, nextLevel, loading }
}
