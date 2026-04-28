import express from 'express';
import {
  listarProcessos,
  obterProcesso,
  criarProcesso,
  atualizarProcesso,
  encaminharProcesso,
  receberProcesso,
  voltarProcesso,
  aprovarProcesso,
  pausarProcesso,
  arquivarProcesso,
  indeferirProcesso,
  listarCaixaEntrada,
  adicionarObservacao,
  relatorioAndamento,
  favoritarProcesso,
  criarProcessoFilho,
  excluirProcesso
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
router.post('/:id/voltar', auth, voltarProcesso);
router.post('/:id/aprovar', auth, aprovarProcesso);
router.post('/:id/pausar', auth, pausarProcesso);
router.post('/:id/arquivar', auth, arquivarProcesso);
router.post('/:id/indeferir', auth, indeferirProcesso);
router.post('/:id/observacao', auth, adicionarObservacao);
router.post('/:id/favoritar', auth, favoritarProcesso);
router.post('/:id/excluir', auth, excluirProcesso);
router.post('/:id/filho', auth, criarProcessoFilho);

export default router;

