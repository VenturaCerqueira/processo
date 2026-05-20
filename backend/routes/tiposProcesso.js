import express from 'express';
import {
  listarTipos,
  obterTipo,
  criarTipo,
  atualizarTipo,
  excluirTipo
} from '../controllers/tiposProcessoController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Leitura pública (usada no cadastro do Novo Processo)
router.get('/', listarTipos);
router.get('/:id', obterTipo);
// Escrita protegida
router.post('/', auth, criarTipo);
router.put('/:id', auth, atualizarTipo);
router.delete('/:id', auth, excluirTipo);

export default router;

