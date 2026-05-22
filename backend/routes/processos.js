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
import { requirePermission } from '../middleware/rbac.js';
import {
  validateCriarProcesso,
  validateEncaminharProcesso,
  validateAdicionarObservacao,
  validateParamId,
  validatePaginacao,
  handleValidationErrors
} from '../middleware/validation.js';

const router = express.Router();

// Leitura - permissão processos_ver
router.get('/', auth, requirePermission('processos_ver'), validatePaginacao, handleValidationErrors, listarProcessos);
router.get('/caixa-entrada', auth, requirePermission('processos_ver'), listarCaixaEntrada);
router.get('/relatorio', auth, requirePermission('processos_ver'), relatorioAndamento);
router.get('/:id', auth, requirePermission('processos_ver'), validateParamId, handleValidationErrors, obterProcesso);

// Criação - permissão processos_criar
router.post('/', auth, requirePermission('processos_criar'), validateCriarProcesso, handleValidationErrors, criarProcesso);

// Edição - permissão processos_editar
router.put('/:id', auth, requirePermission('processos_editar'), validateParamId, handleValidationErrors, atualizarProcesso);
router.post('/:id/encaminhar', auth, requirePermission('processos_editar'), validateParamId, validateEncaminharProcesso, handleValidationErrors, encaminharProcesso);
router.post('/:id/receber', auth, requirePermission('processos_editar'), validateParamId, handleValidationErrors, receberProcesso);
router.post('/:id/voltar', auth, requirePermission('processos_editar'), validateParamId, handleValidationErrors, voltarProcesso);
router.post('/:id/aprovar', auth, requirePermission('processos_editar'), validateParamId, handleValidationErrors, aprovarProcesso);
router.post('/:id/pausar', auth, requirePermission('processos_editar'), validateParamId, handleValidationErrors, pausarProcesso);
router.post('/:id/arquivar', auth, requirePermission('processos_editar'), validateParamId, handleValidationErrors, arquivarProcesso);
router.post('/:id/indeferir', auth, requirePermission('processos_editar'), validateParamId, handleValidationErrors, indeferirProcesso);
router.post('/:id/observacao', auth, requirePermission('processos_editar'), validateParamId, validateAdicionarObservacao, handleValidationErrors, adicionarObservacao);
router.post('/:id/favoritar', auth, requirePermission('processos_ver'), validateParamId, handleValidationErrors, favoritarProcesso);
router.post('/:id/filho', auth, requirePermission('processos_criar'), validateParamId, validateCriarProcesso, handleValidationErrors, criarProcessoFilho);
router.post('/:id/anexos-valores', auth, requirePermission('processos_editar'), validateParamId, handleValidationErrors, salvarAnexosValoresProcesso);

// Exclusão - permissão processos_excluir (só admin/gestor)
router.post('/:id/excluir', auth, requirePermission('processos_excluir'), validateParamId, handleValidationErrors, excluirProcesso);

export default router;

