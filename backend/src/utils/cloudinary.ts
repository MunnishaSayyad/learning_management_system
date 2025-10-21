// utils/cloudinary.ts
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import dotenv from "dotenv";
dotenv.config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadMediaToCloudinary = async (
  filePath: string
): Promise<UploadApiResponse> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
    });
    return result;
  } catch (error) {
    const cloudError = error as UploadApiErrorResponse;
    console.error('Cloudinary Upload Error:', cloudError);
    throw new Error('Error in uploading to Cloudinary');
  }
};

export const deleteMediaFromCloudinary = async (
  publicId: string
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
    throw new Error('Failed to delete the file from Cloudinary');
  }
};

