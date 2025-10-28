// supabase/functions/create-momo-payment/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts'
import { corsHeaders } from '../_shared/cors.ts'

// Lấy các biến môi trường
const MOMO_ACCESS_KEY = Deno.env.get('MOMO_ACCESS_KEY')!
const MOMO_SECRET_KEY = Deno.env.get('MOMO_SECRET_KEY')!
const MOMO_PARTNER_CODE = 'MOMO' // Hoặc mã partner của bạn
const IPN_URL = `${Deno.env.get('SUPABASE_URL')}/functions/v1/momo-ipn-handler`
const REDIRECT_URL = 'https://yourapp.com/payment-success' // URL sau khi thanh toán thành công (không quá quan trọng với QR)

serve(async (req) => {
  // Xử lý CORS Preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Lấy thông tin từ request của app (gồm amount, orderId, orderInfo, và userAction)
    const { amount, orderId, orderInfo, userAction } = await req.json()

    if (!amount || !orderId || !orderInfo || !userAction) {
      throw new Error('Missing required fields: amount, orderId, orderInfo, userAction')
    }
    
    // Tạo một ID duy nhất cho mỗi lần thử thanh toán để tránh lỗi "orderId existed"
    const paymentAttemptId = `${orderId}-${new Date().getTime()}`

    // 2. ✅ LOGIC MỚI: Chuẩn bị extraData
    // Đóng gói orderId gốc và hành động của người dùng (kết thúc/giữ phiên)
    const extraDataObject = {
      originalOrderId: orderId, // Lưu lại ID order gốc
      action: userAction,       // 'keep' hoặc 'end'
    }
    // Mã hóa extraData thành chuỗi Base64 để MoMo gửi lại cho chúng ta qua IPN
    const extraData = btoa(JSON.stringify(extraDataObject))
    
    // 3. Chuẩn bị các tham số khác
    const requestId = paymentAttemptId
    const requestType = 'captureWallet'

    // 4. ✅ SỬA LỖI: Tạo chuỗi để tạo chữ ký
    const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${IPN_URL}&orderId=${paymentAttemptId}&orderInfo=${orderInfo}&partnerCode=${MOMO_PARTNER_CODE}&redirectUrl=${REDIRECT_URL}&requestId=${requestId}&requestType=${requestType}`

    const signature = createHmac('sha256', MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest('hex')

    // 5. Gửi yêu cầu đến MoMo
    const body = JSON.stringify({
      partnerCode: MOMO_PARTNER_CODE,
      accessKey: MOMO_ACCESS_KEY,
      requestId,
      amount,
      orderId: paymentAttemptId, // Gửi ID duy nhất này đi
      orderInfo,
      redirectUrl: REDIRECT_URL,
      ipnUrl: IPN_URL,
      requestType,
      extraData,
      signature,
      lang: 'vi',
    })

    const response = await fetch('https://test-payment.momo.vn/v2/gateway/api/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })

    const data = await response.json()

    // 6. Trả kết quả về cho app
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, // Sử dụng 400 cho lỗi từ client
    })
  }
})