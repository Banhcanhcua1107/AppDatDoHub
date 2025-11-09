# 📸 TOÀN BỘ CODE LIÊN QUAN ĐẾN CLOUDINARY UPLOAD

## 1️⃣ FILE: `services/cloudinaryConfig.ts` (NEW)

```typescript
// services/cloudinaryConfig.ts
/**
 * Get Cloudinary config from environment
 * In production, these come from Supabase Edge Function Secrets
 * Tương tự như MOMO_ACCESS_KEY, MOMO_SECRET_KEY, etc.
 */

export interface CloudinaryConfig {
  cloudinaryName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
}

export const getCloudinaryConfig = (): CloudinaryConfig => {
  // Fallback values - được ghi đè bởi Supabase Secrets
  const config: CloudinaryConfig = {
    cloudinaryName: process.env.CLOUDINARY_NAME || 'dp0th1tjn',
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '634696531211488',
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || 'k_Bg1PdIdYBbDxuNQ3oR8FGFrDQ',
  };

  if (!config.cloudinaryName || !config.cloudinaryApiKey) {
    throw new Error('Missing Cloudinary configuration in Supabase Secrets');
  }

  return config;
};

/**
 * Validate Cloudinary config
 */
export const validateCloudinaryConfig = (config: CloudinaryConfig): boolean => {
  return !!(config.cloudinaryName && config.cloudinaryApiKey);
};
```

---

## 2️⃣ FILE: `screens/Admin/AdminMenuScreen.tsx` - HÀM UPLOAD

### Import cần thiết:
```typescript
import { getCloudinaryConfig } from '../../services/cloudinaryConfig';
import * as ImagePicker from 'expo-image-picker';
```

### Interface MenuItem:
```typescript
interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category_id: string;
  is_available: boolean;
  is_hidden: boolean;
  cost: number;
  image_url?: string;  // ← THÊM CỘT NÀY
}
```

### HÀM UPLOAD CLOUDINARY (CHÍNH):
```typescript
  // Hàm upload ảnh lên Cloudinary (không cần preset)
  const uploadImageToCloudinary = async (imageUri: string): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Lấy Cloudinary config từ environment/Supabase Secrets
      const config = getCloudinaryConfig();
      
      const formDataToSend = new FormData();
      formDataToSend.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `menu_${Date.now()}.jpg`,
      } as any);
      // Thêm API key (thay vì upload_preset)
      formDataToSend.append('api_key', config.cloudinaryApiKey);
      formDataToSend.append('timestamp', Math.floor(Date.now() / 1000).toString());

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloudinaryName}/image/upload`,
        {
          method: 'POST',
          body: formDataToSend,
        }
      );

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Lỗi upload ảnh');
      }

      return data.secure_url; // Trả về URL ảnh từ Cloudinary
    } catch (error: any) {
      Alert.alert('Lỗi Upload', error.message || 'Không thể upload ảnh lên Cloudinary');
      return null;
    } finally {
      setUploading(false);
    }
  };
```

### HÀM CHỌN ẢNH TỪ THƯ VIỆN:
```typescript
  // Hàm chọn ảnh từ thư viện
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };
```

### HÀM CHỤP ẢNH:
```typescript
  // Hàm chụp ảnh từ camera
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };
```

### HÀM SAVE VÀO DATABASE:
```typescript
  const handleSaveItem = async (data: Partial<MenuItem>) => {
    try {
      const dataToSave: any = {
        name: data.name,
        price: data.price,
        cost: data.cost,
        description: data.description,
        category_id: data.category_id,
      };

      // Thêm image_url nếu có
      if (data.image_url) {
        dataToSave.image_url = data.image_url;
      }

      let error;
      if (data.id) {
        const { error: updateError } = await supabase
          .from('menu_items')
          .update(dataToSave)
          .eq('id', data.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('menu_items')
          .insert([dataToSave]);
        error = insertError;
      }
      
      if (error) throw error;
      Alert.alert('Thành công', `Đã ${data.id ? 'cập nhật' : 'thêm'} món thành công.`);
      setModalVisible(false);
      setEditingItem(null);
      await fetchData(false);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể lưu món: ' + err.message);
    }
  };
```

### HÀM handleSave TRONG MODAL:
```typescript
  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category_id) {
      Alert.alert('Thiếu thông tin', 'Tên món, Giá bán và Danh mục là bắt buộc.');
      return;
    }

    let imageUrl = formData.image_url;

    // Nếu có ảnh được chọn và khác với ảnh cũ, upload lên Cloudinary
    if (selectedImage && selectedImage !== formData.image_url) {
      imageUrl = await uploadImageToCloudinary(selectedImage);
      if (!imageUrl) return; // Dừng nếu upload thất bại
    }

    onSave({ ...formData, image_url: imageUrl });
  };
```

---

## 3️⃣ FILE: `ADD_IMAGE_COLUMN.sql` (SQL MIGRATION)

```sql
-- Add image_url column to menu_items table if it doesn't exist
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN public.menu_items.image_url IS 'URL hình ảnh sản phẩm được lưu từ Cloudinary';
```

---

## 4️⃣ FILE: `.env` (ENVIRONMENT VARIABLES)

```env
# Cloudinary - Move to Supabase Secrets for production
CLOUDINARY_NAME=dp0th1tjn
CLOUDINARY_API_KEY=634696531211488
CLOUDINARY_API_SECRET=k_Bg1PdIdYBbDxuNQ3oR8FGFrDQ
```

---

## 5️⃣ SUPABASE EDGE FUNCTION SECRETS (CẦN ADD)

Đi tới: **Supabase Dashboard → Secrets**

Thêm 3 secrets sau:
```
CLOUDINARY_NAME=dp0th1tjn
CLOUDINARY_API_KEY=634696531211488
CLOUDINARY_API_SECRET=k_Bg1PdIdYBbDxuNQ3oR8FGFrDQ
```

---

## 6️⃣ UI COMPONENTS TRONG MODAL

### Image Upload Container (JSX):
```tsx
{/* Image Upload Section */}
<Text style={styles.label}>Hình ảnh sản phẩm</Text>
<View style={styles.imageUploadContainer}>
  {selectedImage ? (
    <Image source={{ uri: selectedImage }} style={styles.previewImage} />
  ) : (
    <View style={styles.imagePlaceholder}>
      <Ionicons name="image-outline" size={40} color="#D1D5DB" />
      <Text style={styles.placeholderText}>Chưa chọn ảnh</Text>
    </View>
  )}
</View>

<View style={styles.imageButtonsContainer}>
  <TouchableOpacity 
    style={[styles.imageButton, styles.imageButtonBorder]} 
    onPress={pickImage}
    disabled={uploading}
  >
    <Ionicons name="image-outline" size={18} color="#3B82F6" />
    <Text style={styles.imageButtonText}>Chọn từ thư viện</Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={[styles.imageButton, styles.imageButtonBorder]} 
    onPress={takePhoto}
    disabled={uploading}
  >
    <Ionicons name="camera-outline" size={18} color="#3B82F6" />
    <Text style={styles.imageButtonText}>Chụp ảnh</Text>
  </TouchableOpacity>
</View>

{uploading && (
  <View style={styles.uploadingContainer}>
    <ActivityIndicator size="small" color="#3B82F6" />
    <Text style={styles.uploadingText}>Đang upload ảnh...</Text>
  </View>
)}
```

---

## 📊 FLOW HOẠT ĐỘNG

```
User bấm "Chọn ảnh" hoặc "Chụp ảnh"
    ↓
pickImage() / takePhoto()
    ↓
selectedImage = uri
    ↓
User bấm "Lưu"
    ↓
handleSave()
    ↓
selectedImage !== formData.image_url?
    ↓ YES
uploadImageToCloudinary(selectedImage)
    ↓
getCloudinaryConfig() - lấy từ Supabase Secrets
    ↓
FormData append: file + api_key + timestamp
    ↓
POST https://api.cloudinary.com/v1_1/dp0th1tjn/image/upload
    ↓
response.secure_url
    ↓
imageUrl = secure_url
    ↓
onSave({ ...formData, image_url: imageUrl })
    ↓
handleSaveItem() - Lưu vào DB
    ↓
UPDATE/INSERT menu_items SET image_url = ...
```

---

## ✅ CHECKLIST SETUP

- [ ] Cài package `expo-image-picker`: `npm install expo-image-picker`
- [ ] Tạo file `services/cloudinaryConfig.ts`
- [ ] Update `screens/Admin/AdminMenuScreen.tsx`:
  - [ ] Add import `getCloudinaryConfig`
  - [ ] Add import `* as ImagePicker`
  - [ ] Add `image_url` vào MenuItem interface
  - [ ] Add hàm `uploadImageToCloudinary()`
  - [ ] Add hàm `pickImage()` và `takePhoto()`
  - [ ] Update `handleSaveItem()` để save image_url
  - [ ] Add UI components cho image upload
- [ ] Tạo SQL migration `ADD_IMAGE_COLUMN.sql`
- [ ] Chạy SQL migration trên Supabase
- [ ] Add Supabase Secrets:
  - [ ] CLOUDINARY_NAME
  - [ ] CLOUDINARY_API_KEY
  - [ ] CLOUDINARY_API_SECRET
- [ ] Test upload ảnh trong app

---

## 🚀 CÁC LỖI CÓ THỂ GẶP VÀ GIẢI PHÁP

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-----------|----------|
| "Missing Cloudinary configuration" | Env var không tìm thấy | Check Supabase Secrets hoặc .env |
| "Upload preset not found" | Sử dụng preset cũ | Đã fix - giờ dùng api_key |
| "Cannot read property 'secure_url'" | Response không có secure_url | Check API key có valid không |
| Image upload không lưu vào DB | image_url không được append | Verify image_url column tồn tại |
| Ảnh không hiển thị | URL bị null | Check upload thành công, check URI format |

---

## 💡 NOTES

- **API Key**: 634696531211488 (không cần secret này để upload)
- **Cloud Name**: dp0th1tjn (tên account Cloudinary)
- **Timestamp**: Bắt buộc khi dùng api_key
- **Quality**: 0.7 (tiết kiệm dung lượng)
- **Aspect Ratio**: 1:1 (ảnh vuông cho menu items)
- **Storage**: URL được lưu trong cột `image_url` của menu_items

