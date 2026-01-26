
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const lineChannelId = Deno.env.get('LINE_CHANNEL_ID')
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!lineChannelId || !supabaseUrl || !serviceRoleKey) {
            throw new Error('Server configuration error: Missing environment variables')
        }

        let requestBody
        try {
            requestBody = await req.json()
        } catch (e) {
            throw new Error('Invalid JSON body')
        }

        const { idToken, amount, paymentMethod } = requestBody

        if (!idToken || !amount) {
            throw new Error('Missing required fields: idToken or amount')
        }

        // 1. Verify LINE ID Token
        const body = new URLSearchParams()
        body.append('id_token', idToken)
        body.append('client_id', lineChannelId)

        const verifyResp = await fetch('https://api.line.me/oauth2/v2.1/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        })

        if (!verifyResp.ok) {
            throw new Error('Invalid LINE ID Token')
        }

        const verifyData = await verifyResp.json()
        const lineUserId = verifyData.sub // This corresponds to 'username' in user_profiles

        // 2. Init Supabase Admin
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

        // 3. Get User Profile
        const { data: user, error: findError } = await supabaseAdmin
            .from('user_profiles')
            .select('id, full_name')
            .eq('username', lineUserId)
            .single()

        if (findError || !user) {
            throw new Error('User not found')
        }

        // 4. Create Transaction
        const { error: insertError } = await supabaseAdmin
            .from('transactions')
            .insert({
                user_id: user.id,
                type: 'deposit',
                amount: Number(amount),
                status: 'pending',
                payment_method: paymentMethod || 'quick_pay',
                description: `快速儲值 ${amount}`,
                // created_at will be auto set
            })

        if (insertError) {
            throw new Error(`Transaction creation failed: ${insertError.message}`)
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Deposit request created'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        console.error('Deposit Error:', error)
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
