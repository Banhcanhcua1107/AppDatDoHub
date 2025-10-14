-- ============================================
-- PROVISIONAL BILL FUNCTIONS - SQL SETUP
-- ============================================
-- Copy và chạy trong Supabase SQL Editor

-- 1. Function để GỬI/CẬP NHẬT tạm tính (dùng trong OrderConfirmationScreen)
-- Hàm này LUÔN set is_provisional = true, không toggle
CREATE OR REPLACE FUNCTION send_provisional_bill(p_order_id UUID)
RETURNS void AS $$
BEGIN
  -- Cập nhật trạng thái tạm tính cho order
  UPDATE orders 
  SET is_provisional = true,
      updated_at = NOW()
  WHERE id = p_order_id;
  
  -- Kiểm tra xem có lỗi không
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function để TOGGLE trạng thái tạm tính (dùng trong OrderScreen)
-- Hàm này BẬT/TẮT trạng thái is_provisional
CREATE OR REPLACE FUNCTION toggle_provisional_bill_status(p_order_id UUID)
RETURNS void AS $$
BEGIN
  -- Toggle trạng thái is_provisional
  UPDATE orders 
  SET is_provisional = NOT is_provisional,
      updated_at = NOW()
  WHERE id = p_order_id;
  
  -- Kiểm tra xem có lỗi không
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function để HỦY tạm tính (tùy chọn - có thể dùng sau)
CREATE OR REPLACE FUNCTION cancel_provisional_bill(p_order_id UUID)
RETURNS void AS $$
BEGIN
  -- Set is_provisional = false
  UPDATE orders 
  SET is_provisional = false,
      updated_at = NOW()
  WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Kiểm tra setup thành công
SELECT 'Provisional bill functions created successfully!' AS message;
