// services/cloudinaryConfig.ts

export interface CloudinaryConfig {
  cloudinaryName: string;
  cloudinaryApiKey: string;
  cloudinaryUploadPreset: string;
}

export const getCloudinaryConfig = (): CloudinaryConfig => {
  // Đọc các biến môi trường có tiền tố EXPO_PUBLIC_
  const config: CloudinaryConfig = {
    cloudinaryName: process.env.EXPO_PUBLIC_CLOUDINARY_NAME || '',
    cloudinaryApiKey: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || '',
    cloudinaryUploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
  };

  // Kiểm tra xem các biến có tồn tại không
  if (!config.cloudinaryName || !config.cloudinaryApiKey || !config.cloudinaryUploadPreset) {
    console.error('Cloudinary environment variables are missing!', config);
    throw new Error('Missing Cloudinary configuration. Make sure EXPO_PUBLIC_... variables are set in your Supabase project settings.');
  }

  return config;
};

/**
 * Validate Cloudinary config
 */
export const validateCloudinaryConfig = (config: CloudinaryConfig): boolean => {
  return !!(config.cloudinaryName && config.cloudinaryApiKey && config.cloudinaryUploadPreset);
};