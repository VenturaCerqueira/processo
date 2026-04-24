import express from 'express';
import {
  listarSetores,
  obterSetor,
  criarSetor,
  atualizarSetor,
  excluirSetor
} from '../controllers/setoresController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, listarSetores);
router.get('/:id', auth, obterSetor);
router.post('/', auth, criarSetor);
router.put('/:id', auth, atualizarSetor);
router.delete('/:id', auth, excluirSetor);

export default router;

