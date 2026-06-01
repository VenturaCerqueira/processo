import express from 'express';
import { listarProcessosAnteriores } from '../controllers/procesosAnterioresController.js';
import { isStaff } from '../middleware/auth.js';

const router = express.Router();

router.get('/', isStaff, listarProcessosAnteriores);

export default router;