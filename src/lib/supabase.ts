import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})

// 資料庫類型定義
export interface UserProfile {
    id: string
    username: string | null
    full_name: string | null
    balance: number
    vip_level: number
    referral_code: string | null
    referred_by: string | null
    avatar_url: string | null
    created_at: string
    updated_at: string
}

export interface Transaction {
    id: string
    user_id: string
    type: 'deposit' | 'withdrawal' | 'bonus' | 'refund'
    amount: number
    status: 'pending' | 'completed' | 'failed' | 'cancelled'
    payment_method: string | null
    transaction_id: string | null
    notes: string | null
    created_at: string
    updated_at: string
}

export interface Bet {
    id: string
    user_id: string
    game_type: 'sports' | 'live_casino' | 'slots' | 'fishing' | 'cards'
    game_name: string
    bet_amount: number
    win_amount: number
    status: 'pending' | 'win' | 'lose' | 'cancelled'
    bet_details: any
    created_at: string
    settled_at: string | null
}

export interface Promotion {
    id: string
    title: string
    description: string | null
    bonus_type: 'percentage' | 'fixed' | 'daily' | 'referral' | 'cashback'
    bonus_amount: number | null
    bonus_percentage: number | null
    max_bonus: number | null
    min_deposit: number | null
    wagering_requirement: number
    rules: string[] | null
    steps: string[] | null
    icon: string | null
    color: string | null
    start_date: string | null
    end_date: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface UserPromotion {
    id: string
    user_id: string
    promotion_id: string
    status: 'active' | 'completed' | 'expired' | 'cancelled'
    bonus_received: number
    wagering_completed: number
    wagering_required: number | null
    claimed_at: string
    completed_at: string | null
}
