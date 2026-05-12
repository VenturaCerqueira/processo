import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  listarRepresentantesPorRequerente,
  salvarRepresentantesPorRequerente
} from '../controllers/requerenteRepresentantesController.js';

const router = express.Router();

router.get('/:requerenteId/representantes', auth, listarRepresentantesPorRequerente);
router.post('/:requerenteId/representantes', auth, salvarRepresentantesPorRequerente);

export default router;
