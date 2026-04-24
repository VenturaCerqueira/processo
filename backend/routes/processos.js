import express from 'express';
import {
  listarProcessos,
  obterProcesso,
  criarProcesso,
  atualizarProcesso,
  encaminharProcesso,
  adicionarObservacao,
  relatorioAndamento
} from '../controllers/processoController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, listarProcessos);
router.get('/relatorio', auth, relatorioAndamento);
router.get('/:id', auth, obterProcesso);
router.post('/', auth, criarProcesso);
router.put('/:id', auth, atualizarProcesso);
router.post('/:id/encaminhar', auth, encaminharProcesso);
router.post('/:id/observacao', auth, adicionarObservacao);

export default router;

