
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
        // 檢查環境變數
        const lineChannelId = Deno.env.get('LINE_CHANNEL_ID')
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!lineChannelId) {
            console.error('環境變數 LINE_CHANNEL_ID 未設定')
            throw new Error('伺服器設定錯誤: LINE_CHANNEL_ID 未設定')
        }

        if (!supabaseUrl || !serviceRoleKey) {
            console.error('Supabase 環境變數未設定')
            throw new Error('伺服器設定錯誤: Supabase 環境變數未設定')
        }

        // 解析請求內容
        let requestBody
        try {
            requestBody = await req.json()
        } catch (e) {
            console.error('JSON 解析失敗:', e)
            throw new Error('請求格式錯誤: 無法解析 JSON')
        }

        const { idToken, userId, displayName, pictureUrl, referred_by } = requestBody

        console.log('收到登入請求:', { userId, displayName, hasIdToken: !!idToken })

        if (!idToken || !userId) {
            console.error('缺少必要欄位:', { hasIdToken: !!idToken, hasUserId: !!userId })
            throw new Error('缺少必要欄位: idToken 或 userId')
        }

        // 1. 驗證 LINE idToken
        console.log('開始驗證 LINE ID Token...')
        const body = new URLSearchParams()
        body.append('id_token', idToken)
        body.append('client_id', lineChannelId)

        const verifyResp = await fetch('https://api.line.me/oauth2/v2.1/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        })

        if (!verifyResp.ok) {
            const errText = await verifyResp.text()
            console.error('LINE ID Token 驗證失敗:', {
                status: verifyResp.status,
                statusText: verifyResp.statusText,
                error: errText
            })
            throw new Error(`LINE 登入驗證失敗: ${verifyResp.status} ${verifyResp.statusText}`)
        }

        const verifyData = await verifyResp.json()
        console.log('LINE ID Token 驗證成功:', { sub: verifyData.sub })

        // 2. 初始化 Supabase Admin Client
        console.log('初始化 Supabase Client...')
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

        // 3. 檢查現有使用者
        console.log('檢查使用者是否存在:', userId)
        const { data: existingUser, error: findError } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('username', userId)
            .single()

        if (findError && findError.code !== 'PGRST116') {
            console.error('查詢使用者失敗:', findError)
            throw new Error(`資料庫查詢錯誤: ${findError.message}`)
        }

        let user = existingUser

        if (!user) {
            // 4. 建立新使用者
            console.log('建立新使用者:', userId)

            // 生成 UUID
            const newUserId = crypto.randomUUID()

            const newUserData = {
                id: newUserId,  // 明確指定 UUID
                username: userId,
                full_name: displayName || '新使用者',
                avatar_url: pictureUrl || null,
                referred_by: referred_by || null,
                balance: 0,
                vip_level: 0,
                referral_code: Math.random().toString(36).substring(2, 8).toUpperCase()
            }

            console.log('新使用者資料:', newUserData)

            const { data: newUser, error: createError } = await supabaseAdmin
                .from('user_profiles')
                .insert(newUserData)
                .select()
                .single()

            if (createError) {
                console.error('建立使用者失敗:', createError)
                throw new Error(`建立使用者失敗: ${createError.message}`)
            }

            console.log('使用者建立成功:', newUser.id)
            user = newUser
        } else {
            // 更新使用者資訊
            console.log('使用者已存在,檢查是否需要更新')
            const updates: any = {}
            if (displayName && user.full_name !== displayName) updates.full_name = displayName
            if (pictureUrl && user.avatar_url !== pictureUrl) updates.avatar_url = pictureUrl

            if (Object.keys(updates).length > 0) {
                console.log('更新使用者資訊:', updates)
                const { data: updatedUser, error: updateError } = await supabaseAdmin
                    .from('user_profiles')
                    .update(updates)
                    .eq('id', user.id)
                    .select()
                    .single()

                if (updateError) {
                    console.error('更新使用者失敗:', updateError)
                } else {
                    console.log('使用者更新成功')
                    user = updatedUser
                }
            } else {
                console.log('使用者資訊無需更新')
            }
        }

        console.log('登入流程完成,回傳使用者資料')
        return new Response(
            JSON.stringify({
                success: true,
                user
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        console.error('Edge Function 錯誤:', error)
        const errorMessage = error instanceof Error ? error.message : '未知錯誤'
        const errorDetails = error instanceof Error ? error.toString() : String(error)

        return new Response(
            JSON.stringify({
                success: false,
                error: errorMessage,
                details: errorDetails
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
