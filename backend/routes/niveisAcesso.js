import express from 'express';
import { listarNiveisAcesso, obterNivelAcesso, criarNivelAcesso, atualizarNivelAcesso, excluirNivelAcesso } from '../controllers/niveisAcessoController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, adminOnly, listarNiveisAcesso);
router.get('/:id', auth, adminOnly, obterNivelAcesso);
router.post('/', auth, adminOnly, criarNivelAcesso);
router.put('/:id', auth, adminOnly, atualizarNivelAcesso);
router.delete('/:id', auth, adminOnly, excluirNivelAcesso);

export default router;

