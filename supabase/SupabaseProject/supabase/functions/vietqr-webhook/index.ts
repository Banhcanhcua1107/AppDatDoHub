// /supabase/functions/vietqr-webhook/index.ts
// @ts-nocheck

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Hàm tiện ích để tạo độ trễ (delay)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

serve(async (req) => {
  try {
    const payload = await req.json();
    console.log("📩 Nhận callback VietQR:", payload);

    const { description, amount } = payload;

    const match = description.match(/ThanhToan Don (\w{6})/i);
    if (!match || !match[1]) {
      console.log("⚠️ Không tìm thấy mã đơn trong ghi chú:", description);
      return new Response("No valid order code found", { status: 200 });
    }

    const orderCode = match[1];
    console.log(`🔎 Tìm thấy order_code: ${orderCode}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let order = null;
    const MAX_RETRIES = 3; // Thử lại tối đa 3 lần

    // ✅ LOGIC THỬ LẠI ĐỂ CHỐNG RACE CONDITION
    for (let i = 0; i < MAX_RETRIES; i++) {
      console.log(`(Lần ${i + 1}) Đang tìm order...`);
      const { data, error } = await supabase
        .from("orders")
        .select("id, status")
        .eq("order_code", orderCode)
        .single();
      
      if (data && !error) {
        order = data;
        break; // Tìm thấy, thoát khỏi vòng lặp
      }
      
      // Nếu chưa phải lần cuối, đợi 1 giây rồi thử lại
      if (i < MAX_RETRIES - 1) {
        await sleep(1000); // Đợi 1 giây
      }
    }

    if (!order) {
      console.error(`⚠️ Không tìm thấy order cho code ${orderCode} sau ${MAX_RETRIES} lần thử.`);
      return new Response("Order not found after retries", { status: 200 });
    }
    
    if (order.status === 'paid' || order.status === 'closed') {
      console.log(`✅ Đơn hàng ${order.id} đã được xử lý trước đó.`);
      return new Response("Order already processed", { status: 200 });
    }

    // Cập nhật trạng thái
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_method: "Chuyển khoản",
        total_price: amount,
      })
      .eq("id", order.id);

    if (updateError) throw updateError;

    console.log(`✅ Đã xác nhận thanh toán cho order ${order.id}`);
    return new Response("ok", { status: 200 });

  } catch (err) {
    console.error("❌ Lỗi webhook:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});