import express from 'express';
import { auth } from '../middleware/auth.js';
import { listarProtocolosPorRequerente } from '../controllers/requerenteProtocolosController.js';

const router = express.Router();

router.get('/:requerenteId/protocolos', auth, listarProtocolosPorRequerente);

export default router;

