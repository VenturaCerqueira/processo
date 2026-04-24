import express from 'express';
import {
  listarEspecies,
  obterEspecie,
  criarEspecie,
  atualizarEspecie,
  excluirEspecie
} from '../controllers/especiesProcessoController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, listarEspecies);
router.get('/:id', auth, obterEspecie);
router.post('/', auth, criarEspecie);
router.put('/:id', auth, atualizarEspecie);
router.delete('/:id', auth, excluirEspecie);

export default router;

