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
  excluirProcesso,
  salvarAnexosValoresProcesso
} from '../controllers/processoController.js';
import { auth } from '../middleware/auth.js';
import {
  validateCriarProcesso,
  validateEncaminharProcesso,
  validateAdicionarObservacao,
  validateParamId,
  validatePaginacao,
  handleValidationErrors
} from '../middleware/validation.js';

const router = express.Router();

router.get('/', auth, validatePaginacao, handleValidationErrors, listarProcessos);
router.get('/caixa-entrada', auth, listarCaixaEntrada);
router.get('/relatorio', auth, relatorioAndamento);
router.get('/:id', auth, validateParamId, handleValidationErrors, obterProcesso);
router.post('/', auth, validateCriarProcesso, handleValidationErrors, criarProcesso);
router.put('/:id', auth, validateParamId, handleValidationErrors, atualizarProcesso);
router.post('/:id/encaminhar', auth, validateParamId, validateEncaminharProcesso, handleValidationErrors, encaminharProcesso);
router.post('/:id/receber', auth, validateParamId, handleValidationErrors, receberProcesso);
router.post('/:id/voltar', auth, validateParamId, handleValidationErrors, voltarProcesso);
router.post('/:id/aprovar', auth, validateParamId, handleValidationErrors, aprovarProcesso);
router.post('/:id/pausar', auth, validateParamId, handleValidationErrors, pausarProcesso);
router.post('/:id/arquivar', auth, validateParamId, handleValidationErrors, arquivarProcesso);
router.post('/:id/indeferir', auth, validateParamId, handleValidationErrors, indeferirProcesso);
router.post('/:id/observacao', auth, validateParamId, validateAdicionarObservacao, handleValidationErrors, adicionarObservacao);
router.post('/:id/favoritar', auth, validateParamId, handleValidationErrors, favoritarProcesso);
router.post('/:id/excluir', auth, validateParamId, handleValidationErrors, excluirProcesso);
router.post('/:id/filho', auth, validateParamId, validateCriarProcesso, handleValidationErrors, criarProcessoFilho);
router.post('/:id/anexos-valores', auth, validateParamId, handleValidationErrors, salvarAnexosValoresProcesso);

export default router;

