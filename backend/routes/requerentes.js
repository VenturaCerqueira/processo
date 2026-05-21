import express from 'express';
import {
  listarRequerentes,
  obterRequerente,
  criarRequerente,
  atualizarRequerente,
  excluirRequerente
} from '../controllers/requerentesController.js';
import { auth } from '../middleware/auth.js';
import {
  listarRepresentantesPorRequerente,
  salvarRepresentantesPorRequerente
} from '../controllers/requerenteRepresentantesController.js';
import { listarProtocolosPorRequerente } from '../controllers/requerenteProtocolosController.js';

const router = express.Router();

// CRUD de Requerentes
router.get('/', auth, listarRequerentes);
router.get('/:id', auth, obterRequerente);
router.post('/', auth, criarRequerente);
router.put('/:id', auth, atualizarRequerente);
router.delete('/:id', auth, excluirRequerente);

// Representantes de um requerente
router.get('/:requerenteId/representantes', auth, listarRepresentantesPorRequerente);
router.post('/:requerenteId/representantes', auth, salvarRepresentantesPorRequerente);

// Protocolos de um requerente
router.get('/:requerenteId/protocolos', auth, listarProtocolosPorRequerente);

export default router;

