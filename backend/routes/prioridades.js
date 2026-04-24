import express from 'express';
import {
  listarPrioridades,
  obterPrioridade,
  criarPrioridade,
  atualizarPrioridade,
  excluirPrioridade
} from '../controllers/prioridadesController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, listarPrioridades);
router.get('/:id', auth, obterPrioridade);
router.post('/', auth, criarPrioridade);
router.put('/:id', auth, atualizarPrioridade);
router.delete('/:id', auth, excluirPrioridade);

export default router;

