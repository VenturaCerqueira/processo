import express from 'express';
import multer from 'multer';
import { uploadDocumento, listarDocumentos, downloadDocumento } from '../controllers/uploadController.js';
import { auth } from '../middleware/auth.js';
import { limiterUpload } from '../middleware/rateLimiter.js';
import { validateUploadDocumento, handleValidationErrors } from '../middleware/validation.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const router = express.Router();

router.post('/:id/documento', auth, limiterUpload, validateUploadDocumento, handleValidationErrors, upload.single('documento'), uploadDocumento);
router.get('/:id/documentos', auth, validateUploadDocumento, handleValidationErrors, listarDocumentos);
router.get('/download/:id', auth, downloadDocumento);

export default router;

