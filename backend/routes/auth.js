import express from 'express';
import { login, registrar, perfil, esqueciSenha, redefinirSenha, listarUsuarios, obterUsuario, atualizarUsuario, resetarSenhaUsuario, atualizarPerfil, primeiroAcesso } from '../controllers/authController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/registrar', auth, adminOnly, registrar);
router.get('/perfil', auth, perfil);
router.put('/perfil', auth, atualizarPerfil);
router.post('/esqueci-senha', esqueciSenha);
router.post('/redefinir-senha', redefinirSenha);
router.post('/primeiro-acesso', primeiroAcesso);
router.get('/usuarios', auth, adminOnly, listarUsuarios);
router.get('/usuarios/:id', auth, adminOnly, obterUsuario);
router.put('/usuarios/:id', auth, adminOnly, atualizarUsuario);
router.post('/usuarios/:id/resetar-senha', auth, adminOnly, resetarSenhaUsuario);

export default router;

