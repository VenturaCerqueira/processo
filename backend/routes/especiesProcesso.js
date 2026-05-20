import express from 'express';
import {
  listarEspecies,
  obterEspecie,
  criarEspecie,
  atualizarEspecie,
  excluirEspecie,
  listarAnexosEspecie,
  salvarAnexosEspecie
} from '../controllers/especiesProcessoController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Leitura pública (usada no cadastro do Novo Processo)
router.get('/', listarEspecies);
router.get('/:id', obterEspecie);
// Campos/anexos da espécie
router.get('/:id/anexos', listarAnexosEspecie);
router.post('/:id/anexos', auth, salvarAnexosEspecie);

// Escrita protegida
router.post('/', auth, criarEspecie);
router.put('/:id', auth, atualizarEspecie);
router.delete('/:id', auth, excluirEspecie);

export default router;

