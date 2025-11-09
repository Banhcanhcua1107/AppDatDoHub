# 📸 Cloudinary Integration - Complete Setup Guide

## Files Created/Modified for Image Upload Feature

### 1. **services/cloudinaryConfig.ts** (NEW)
**Purpose**: Centralized Cloudinary configuration management
**Reads from**: Supabase Edge Function Secrets (or .env for development)

```typescript
- getCloudinaryConfig(): Returns CloudinaryConfig object
- validateCloudinaryConfig(): Validates required fields
- Exports interface CloudinaryConfig with:
  * cloudinaryName
  * cloudinaryApiKey
  * cloudinaryApiSecret
```

**Environment Variables Required**:
- `CLOUDINARY_NAME` = dp0th1tjn
- `CLOUDINARY_API_KEY` = 634696531211488
- `CLOUDINARY_API_SECRET` = k_Bg1PdIdYBbDxuNQ3oR8FGFrDQ

---

### 2. **screens/Admin/AdminMenuScreen.tsx** (MODIFIED)
**Purpose**: Admin menu management with image upload capability

**New Components Added**:
- Image picker UI (Photo Library & Camera buttons)
- Image preview box (180×180px)
- Loading indicator during upload
- Upload status feedback

**New Functions**:
- `uploadImageToCloudinary(imageUri)`: Uploads to Cloudinary using API key
- `pickImage()`: Open photo library
- `takePhoto()`: Open camera
- Updated `handleSaveItem()`: Saves image_url to database
- Fixed `fetchData()`: Client-side sorting (by is_available DESC, then name A-Z)

**Upload Method**:
- Uses API key authentication (no preset required)
- Sends timestamp + api_key in FormData
- Returns secure_url from Cloudinary response
- Saves to `menu_items.image_url` column

---

### 3. **ADD_IMAGE_COLUMN.sql** (NEW)
**Purpose**: Database schema migration

**SQL Content**:
```sql
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

**Status**: Ready to execute in Supabase SQL editor

---

### 4. **.env** (MODIFIED)
**Changes**:
- Cloudinary keys still present (fallback for development)
- Added comment: "Keys moved to Supabase Secrets for production"

**Current Content**:
```
# Cloudinary - Move to Supabase Secrets for production
CLOUDINARY_NAME=dp0th1tjn
CLOUDINARY_API_KEY=634696531211488
CLOUDINARY_API_SECRET=k_Bg1PdIdYBbDxuNQ3oR8FGFrDQ
```

---

## 🚀 Setup Instructions

### Step 1: Add to Supabase Edge Function Secrets

1. Go to Supabase Dashboard → Secrets
2. Add these secrets:
   ```
   CLOUDINARY_NAME = dp0th1tjn
   CLOUDINARY_API_KEY = 634696531211488
   CLOUDINARY_API_SECRET = k_Bg1PdIdYBbDxuNQ3oR8FGFrDQ
   ```

### Step 2: Execute Database Migration

1. Go to Supabase → SQL Editor
2. Create new query
3. Paste content from `ADD_IMAGE_COLUMN.sql`
4. Execute

### Step 3: Test Image Upload

1. Open AdminMenuScreen
2. Add or edit a menu item
3. Click "Chụp ảnh" or "Chọn ảnh"
4. Select image
5. Image will upload to Cloudinary automatically
6. URL saved to database

---

## 🔧 How It Works

### Upload Flow:
```
User selects image
    ↓
uploadImageToCloudinary(imageUri)
    ↓
getCloudinaryConfig() - reads from environment
    ↓
FormData: file + api_key + timestamp
    ↓
POST to https://api.cloudinary.com/v1_1/dp0th1tjn/image/upload
    ↓
Parse response → secure_url
    ↓
Display preview
    ↓
Save to menu_items.image_url on handleSaveItem()
```

### Configuration Priority:
```
Supabase Secrets (production)
    ↑
.env file (development fallback)
    ↑
getCloudinaryConfig() service
```

---

## 📋 Upload Method

**Why API Key Approach (No Preset)**:
- ✅ No need to create preset in Cloudinary dashboard
- ✅ Works immediately with API credentials
- ✅ More flexible for different upload scenarios
- ✅ No whitelist restrictions

**API Key Approach Advantages**:
- Simpler setup
- No preset configuration needed
- Direct authentication
- Works for unsigned uploads

---

## 🔍 Troubleshooting

### Issue: "Missing Cloudinary configuration"
**Solution**: 
- Check Supabase Secrets have been added
- Or check .env file in development

### Issue: "Upload failed"
**Solutions**:
1. Verify API_KEY is correct (634696531211488)
2. Check CLOUDINARY_NAME is correct (dp0th1tjn)
3. Ensure image format is JPEG
4. Check network connection

### Issue: Image not saving to database
**Solution**:
- Verify `image_url` column exists in menu_items
- Run SQL migration if not exists
- Check menu_items table permissions in Supabase

---

## 📁 File Structure

```
my-expo-app/
├── services/
│   └── cloudinaryConfig.ts (NEW)
├── screens/Admin/
│   └── AdminMenuScreen.tsx (MODIFIED)
├── supabase/
│   └── ADD_IMAGE_COLUMN.sql (NEW)
├── .env (MODIFIED)
└── CLOUDINARY_SETUP.md (THIS FILE)
```

---

## 🎯 Similar Integrations

This approach follows the same pattern as existing integrations:
- **MoMo Payment**: `services/momoConfig.ts`
- **VietQR**: `services/vietqrConfig.ts`

All use Supabase Secrets for production configuration.

---

## ✅ Checklist

- [ ] Added Cloudinary secrets to Supabase Edge Function Secrets
- [ ] Executed ADD_IMAGE_COLUMN.sql migration
- [ ] Tested image upload in AdminMenuScreen
- [ ] Verified image URL saved to database
- [ ] Confirmed image displays in menu items list
- [ ] Deployed to production (if applicable)

---

**Last Updated**: $(date)
**Status**: Ready for Testing
**Next Action**: Test image upload after adding Supabase Secrets
