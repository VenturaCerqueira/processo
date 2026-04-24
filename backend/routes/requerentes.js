import express from 'express';
import {
  listarRequerentes,
  obterRequerente,
  criarRequerente,
  atualizarRequerente,
  excluirRequerente
} from '../controllers/requerentesController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, listarRequerentes);
router.get('/:id', auth, obterRequerente);
router.post('/', auth, criarRequerente);
router.put('/:id', auth, atualizarRequerente);
router.delete('/:id', auth, excluirRequerente);

export default router;

