import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadDocumento, listarDocumentos } from '../controllers/uploadController.js';
import { auth } from '../middleware/auth.js';
import { limiterUpload } from '../middleware/rateLimiter.js';
import { validateUploadDocumento, handleValidationErrors } from '../middleware/validation.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const router = express.Router();

router.post('/:id/documento', auth, limiterUpload, validateUploadDocumento, handleValidationErrors, upload.single('documento'), uploadDocumento);
router.get('/:id/documentos', auth, validateUploadDocumento, handleValidationErrors, listarDocumentos);

export default router;

