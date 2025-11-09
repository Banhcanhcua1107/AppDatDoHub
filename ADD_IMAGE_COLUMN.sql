-- Add image_url column to menu_items table if it doesn't exist
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN public.menu_items.image_url IS 'URL hình ảnh sản phẩm được lưu từ Cloudinary';
