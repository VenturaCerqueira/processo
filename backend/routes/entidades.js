import express from 'express';
import {
  listarEntidades,
  obterEntidade,
  criarEntidade,
  atualizarEntidade,
  excluirEntidade
} from '../controllers/entidadesController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, listarEntidades);
router.get('/:id', auth, obterEntidade);
router.post('/', auth, criarEntidade);
router.put('/:id', auth, atualizarEntidade);
router.delete('/:id', auth, excluirEntidade);

export default router;

