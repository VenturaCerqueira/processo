import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadDocumento, listarDocumentos } from '../controllers/uploadController.js';
import { auth } from '../middleware/auth.js';

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

router.post('/:id/documento', auth, upload.single('documento'), uploadDocumento);
router.get('/:id/documentos', auth, listarDocumentos);

export default router;

