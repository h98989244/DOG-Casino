const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GGCARD_API_URL = Deno.env.get('GGCARD_API_URL') || 'https://ggcard-payment-api.log.tw'

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { endpoint, ...body } = await req.json()

        // 只允許特定的 endpoint
        const allowedEndpoints = [
            '/api/payment/create-order',
            '/api/payment/confirm-and-update',
        ]

        if (!endpoint || !allowedEndpoints.includes(endpoint)) {
            throw new Error(`Invalid endpoint: ${endpoint}`)
        }

        const response = await fetch(`${GGCARD_API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: response.status,
        })
    } catch (error) {
        console.error('Payment proxy error:', error)
        return new Response(
            JSON.stringify({
                success: false,
                message: error instanceof Error ? error.message : 'Proxy error',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    }
})
