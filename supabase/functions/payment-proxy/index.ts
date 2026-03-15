const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BILLING_API_URL = 'https://main.d9vdatuqb73jv.amplifyapp.com/api/billing'

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { endpoint, ...body } = await req.json()

        // 將舊的 endpoint 對應到新的 billing API
        const endpointMap: Record<string, string> = {
            '/api/payment/create-order': '/auth',
            '/api/payment/confirm-and-update': '/query',
        }

        const mappedPath = endpointMap[endpoint]
        if (!mappedPath) {
            throw new Error(`Invalid endpoint: ${endpoint}`)
        }

        // create-order: 轉換參數格式
        if (endpoint === '/api/payment/create-order') {
            const billingBody = {
                FacTradeSeq: 'ORDER-' + Date.now(),
                FacGameId: 'game1',
                FacGameName: '汪汪娛樂城',
                TradeType: '2',
                CustomerId: body.customerId || 'user',
                PaymentType: body.paymentType === 'ATM' ? 'ATMSNo' : body.paymentType === 'CreditCard' ? 'CreditSNo' : (body.paymentType || 'CreditSNo'),
                ProductName: body.productName || '汪汪娛樂城儲值',
                Amount: String(body.amount || '100'),
                Currency: 'TWD',
                SandBoxMode: 'true',
            }

            console.log('Billing API request:', JSON.stringify(billingBody))
            const response = await fetch(`${BILLING_API_URL}${mappedPath}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(billingBody),
            })
            const rawText = await response.text()
            console.log('Billing API response:', rawText)
            let data: any
            try {
                data = JSON.parse(rawText)
            } catch {
                throw new Error(`Billing API 回傳非 JSON: ${rawText.substring(0, 200)}`)
            }

            // 將新 API 回應轉換成前端期望的格式
            if (data.ReturnCode === '1') {
                return new Response(JSON.stringify({
                    success: true,
                    data: {
                        transactionUrl: data.TransactionUrl,
                        authCode: data.AuthCode || '',
                        facTradeSeq: billingBody.FacTradeSeq,
                    },
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            } else {
                return new Response(JSON.stringify({
                    success: false,
                    message: data.Message || data.ReturnMsg || `建立訂單失敗 (ReturnCode: ${data.ReturnCode})`,
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }
        }

        // confirm-and-update: 查詢訂單狀態
        if (endpoint === '/api/payment/confirm-and-update') {
            const queryBody = {
                AuthCode: body.authCode,
            }

            const response = await fetch(`${BILLING_API_URL}${mappedPath}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(queryBody),
            })
            const data = await response.json()

            // 將新 API 回應轉換成前端期望的格式
            if (data.ReturnCode === '1' && data.PayResult === '3') {
                return new Response(JSON.stringify({
                    success: true,
                    data: {
                        payResult: '3',
                        amount: data.Amount || '0',
                        facTradeSeq: data.FacTradeSeq || '',
                    },
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            } else if (data.ReturnCode === '006') {
                return new Response(JSON.stringify({
                    success: false,
                    data: { returnCode: '006' },
                    message: '交易處理中',
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            } else {
                return new Response(JSON.stringify({
                    success: false,
                    message: data.Message || '查詢失敗',
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }
        }

        throw new Error(`Unhandled endpoint: ${endpoint}`)
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
