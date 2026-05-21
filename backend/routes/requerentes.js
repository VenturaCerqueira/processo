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
import {
  validateCriarRequerente,
  validateAtualizarRequerente,
  validateParamId,
  validateBusca,
  handleValidationErrors
} from '../middleware/validation.js';

const router = express.Router();

// CRUD de Requerentes
router.get('/', auth, validateBusca, handleValidationErrors, listarRequerentes);
router.get('/:id', auth, validateParamId, handleValidationErrors, obterRequerente);
router.post('/', auth, validateCriarRequerente, handleValidationErrors, criarRequerente);
router.put('/:id', auth, validateParamId, validateAtualizarRequerente, handleValidationErrors, atualizarRequerente);
router.delete('/:id', auth, validateParamId, handleValidationErrors, excluirRequerente);

// Representantes de um requerente
router.get('/:requerenteId/representantes', auth, validateParamId, handleValidationErrors, listarRepresentantesPorRequerente);
router.post('/:requerenteId/representantes', auth, validateParamId, handleValidationErrors, salvarRepresentantesPorRequerente);

// Protocolos de um requerente
router.get('/:requerenteId/protocolos', auth, validateParamId, handleValidationErrors, listarProtocolosPorRequerente);

export default router;

