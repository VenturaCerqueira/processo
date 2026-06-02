import express from 'express';
import multer from 'multer';
import { importarProcesso } from '../controllers/importarProcessoController.js';
import { auth } from '../middleware/auth.js';

const storage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = express.Router();

router.post('/', auth, storage.single('documento'), importarProcesso);

export default router;
