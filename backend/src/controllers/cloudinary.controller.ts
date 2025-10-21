import { Request, Response } from 'express';
import { uploadMediaToCloudinary, deleteMediaFromCloudinary } from '../utils/cloudinary';

import fs from 'fs';

export const handleUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const result = await uploadMediaToCloudinary(req.file.path);

    // ✅ Clean up temp file
    fs.unlinkSync(req.file.path);

    res.status(200).json({ success: true, data: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Error uploading file' });
  }
};

export const handleDelete = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ success: false, message: 'Asset ID is required' });
      return;
    }

    await deleteMediaFromCloudinary(id);
    res.status(200).json({ success: true, message: 'Asset deleted successfully from Cloudinary' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Error deleting file' });
  }
};

export const handleBulkUpload = async (req: Request, res: Response): Promise<void> => {
  console.log("Bulk upload files:", req.files);
  try {
    if (!req.files || !Array.isArray(req.files)) {
      res.status(400).json({ success: false, message: 'No files uploaded' });
      return;
    }

    const uploadPromises = req.files.map((file) =>
      uploadMediaToCloudinary(file.path)
    );

    const results = await Promise.all(uploadPromises);
    res.status(200).json({ success: true, data: results });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Error in bulk uploading files' });
  }
};

