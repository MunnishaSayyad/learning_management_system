import express from 'express';
import multer from 'multer';
import { handleUpload,handleBulkUpload,handleDelete } from '../controllers/cloudinary.controller';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Single file upload
router.post('/upload', upload.single('file'), handleUpload);

// Delete asset
router.delete('/delete/:id', handleDelete);

// Bulk file upload (limit to 10 files)
router.post('/bulk-upload', upload.array('files', 10), handleBulkUpload);

export default router;
 