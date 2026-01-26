
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

        const missingEnv = []
        if (!lineChannelId) missingEnv.push('LINE_CHANNEL_ID')
        if (!supabaseUrl) missingEnv.push('SUPABASE_URL')
        if (!serviceRoleKey) missingEnv.push('SUPABASE_SERVICE_ROLE_KEY')

        if (missingEnv.length > 0) {
            throw new Error(`Server configuration error: Missing environment variables: ${missingEnv.join(', ')}`)
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
        // verify endpoint requires client_id
        body.append('client_id', lineChannelId!)

        console.log('Verifying token with LINE...')
        const verifyResp = await fetch('https://api.line.me/oauth2/v2.1/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        })

        if (!verifyResp.ok) {
            const errText = await verifyResp.text()
            throw new Error(`Invalid LINE ID Token: ${verifyResp.status} - ${errText}`)
        }

        const verifyData = await verifyResp.json()
        const lineUserId = verifyData.sub

        // 2. Init Supabase Admin
        const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey!)

        // 3. Get User Profile
        const { data: user, error: findError } = await supabaseAdmin
            .from('user_profiles')
            .select('id, full_name')
            .eq('username', lineUserId)
            .single()

        if (findError || !user) {
            console.error('User not found for LINE ID:', lineUserId)
            throw new Error('User not found. Please login again.')
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
                notes: `快速儲值 ${amount}`,
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
        // Return 200 with error details so client can read it
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                details: error instanceof Error ? error.toString() : String(error)
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200, // Changed from 400 to 200 to bypass client throw
            }
        )
    }
})
