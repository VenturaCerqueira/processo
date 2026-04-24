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

router.get('/', auth, listarTipos);
router.get('/:id', auth, obterTipo);
router.post('/', auth, criarTipo);
router.put('/:id', auth, atualizarTipo);
router.delete('/:id', auth, excluirTipo);

export default router;

