// supabase/functions/momo-ipn-handler/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MOMO_ACCESS_KEY = Deno.env.get('MOMO_ACCESS_KEY')!
const MOMO_SECRET_KEY = Deno.env.get('MOMO_SECRET_KEY')!

serve(async (req) => {
  try {
    const ipnData = await req.json()
    console.log('Received MoMo IPN:', ipnData)

    // 1. Xác thực chữ ký từ MoMo (Phần này đã đúng)
    const { signature, ...restOfData } = ipnData
    const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${restOfData.amount}&extraData=${restOfData.extraData}&message=${restOfData.message}&orderId=${restOfData.orderId}&orderInfo=${restOfData.orderInfo}&orderType=${restOfData.orderType}&partnerCode=${restOfData.partnerCode}&payType=${restOfData.payType}&requestId=${restOfData.requestId}&responseTime=${restOfData.responseTime}&resultCode=${restOfData.resultCode}&transId=${restOfData.transId}`

    const calculatedSignature = createHmac('sha256', MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest('hex')

    if (calculatedSignature !== signature) {
      console.error('IPN Signature validation failed!')
      return new Response('Signature mismatch', { status: 400 })
    }

    // 2. Chữ ký hợp lệ, kiểm tra kết quả thanh toán
    if (ipnData.resultCode === 0) {
      
      const paymentAttemptId = ipnData.orderId;

      // [SỬA LỖI] Sử dụng lastIndexOf để tách chuỗi UUID một cách chính xác
      const lastHyphenIndex = paymentAttemptId.lastIndexOf('-');
      if (lastHyphenIndex === -1) {
          throw new Error('Invalid paymentAttemptId format. Cannot find original order ID.');
      }
      const originalOrderId = paymentAttemptId.substring(0, lastHyphenIndex);

      console.log(`Payment success for paymentAttemptId: ${paymentAttemptId}`)
      console.log(`Updating original orderId: ${originalOrderId}`)
      
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SERVICE_ROLE_KEY')!
      )

      const { error } = await supabaseAdmin
        .from('orders')
        .update({ status: 'paid', payment_method: 'momo', paid_at: new Date().toISOString() })
        .eq('id', originalOrderId) // Bây giờ sẽ dùng ID gốc chính xác

      if (error) {
        console.error('Error updating order status:', error)
      } else {
        console.log(`Successfully updated order ${originalOrderId} to paid.`)
      }
    } else {
      console.log(`Payment failed for orderId: ${ipnData.orderId}, resultCode: ${ipnData.resultCode}`)
    }

    return new Response(null, { status: 204 })

  } catch (error) {
    console.error('Error processing IPN:', error)
    return new Response(error.message, { status: 500 })
  }
})