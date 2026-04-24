import express from 'express';
import {
  listarProcessos,
  obterProcesso,
  criarProcesso,
  atualizarProcesso,
  encaminharProcesso,
  receberProcesso,
  aprovarProcesso,
  pausarProcesso,
  arquivarProcesso,
  listarCaixaEntrada,
  adicionarObservacao,
  relatorioAndamento
} from '../controllers/processoController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, listarProcessos);
router.get('/caixa-entrada', auth, listarCaixaEntrada);
router.get('/relatorio', auth, relatorioAndamento);
router.get('/:id', auth, obterProcesso);
router.post('/', auth, criarProcesso);
router.put('/:id', auth, atualizarProcesso);
router.post('/:id/encaminhar', auth, encaminharProcesso);
router.post('/:id/receber', auth, receberProcesso);
router.post('/:id/aprovar', auth, aprovarProcesso);
router.post('/:id/pausar', auth, pausarProcesso);
router.post('/:id/arquivar', auth, arquivarProcesso);
router.post('/:id/observacao', auth, adicionarObservacao);

export default router;

