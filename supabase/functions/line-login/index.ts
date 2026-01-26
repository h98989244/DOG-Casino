
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('來自 Line Login Function 的問候！')

Deno.serve(async (req) => {
    // 處理 CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { idToken, userId, displayName, pictureUrl, referred_by } = await req.json()

        if (!idToken || !userId) {
            throw new Error('缺少必要欄位: idToken 或 userId')
        }

        // 1. 驗證 LINE idToken
        const body = new URLSearchParams()
        body.append('id_token', idToken)
        body.append('client_id', Deno.env.get('LINE_CHANNEL_ID') || '')

        const verifyResp = await fetch('https://api.line.me/oauth2/v2.1/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        })

        if (!verifyResp.ok) {
            const errText = await verifyResp.text()
            console.error('LINE ID Token 驗證失敗:', errText)
            throw new Error('LINE 登入驗證失敗')
        }

        // 2. 初始化 Supabase Admin Client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 3. 檢查現有使用者
        const { data: existingUser, error: findError } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('username', userId)
            .single()

        if (findError && findError.code !== 'PGRST116') {
            throw findError
        }

        let user = existingUser

        if (!user) {
            // 4. 建立新使用者
            const { data: newUser, error: createError } = await supabaseAdmin
                .from('user_profiles')
                .insert({
                    username: userId,
                    full_name: displayName,
                    avatar_url: pictureUrl,
                    referred_by: referred_by || null,
                    balance: 0,
                    vip_level: 0,
                    referral_code: Math.random().toString(36).substring(2, 8).toUpperCase()
                })
                .select()
                .single()

            if (createError) throw createError
            user = newUser
        } else {
            // 更新使用者資訊
            const updates: any = {}
            if (displayName && user.full_name !== displayName) updates.full_name = displayName
            if (pictureUrl && user.avatar_url !== pictureUrl) updates.avatar_url = pictureUrl

            if (Object.keys(updates).length > 0) {
                const { data: updatedUser, error: updateError } = await supabaseAdmin
                    .from('user_profiles')
                    .update(updates)
                    .eq('id', user.id)
                    .select()
                    .single()

                if (!updateError) user = updatedUser
            }
        }

        return new Response(
            JSON.stringify({ user }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
