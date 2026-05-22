import express from 'express';
import { login, registrar, perfil, esqueciSenha, redefinirSenha, listarUsuarios, listarUsuariosAtivos, obterUsuario, atualizarUsuario, resetarSenhaUsuario, atualizarPerfil, primeiroAcesso, refreshToken, logout } from '../controllers/authController.js';
import { auth, adminOnly } from '../middleware/auth.js';
import { limiterLogin, limiterSenha } from '../middleware/rateLimiter.js';
import {
  validateLogin,
  validateRegistroUsuario,
  validateEsqueciSenha,
  validateRedefinirSenha,
  validateAtualizarPerfil,
  validateParamId,
  handleValidationErrors
} from '../middleware/validation.js';

const router = express.Router();

router.post('/login', limiterLogin, validateLogin, handleValidationErrors, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', auth, logout);
router.post('/registrar', auth, adminOnly, validateRegistroUsuario, handleValidationErrors, registrar);
router.get('/perfil', auth, perfil);
router.put('/perfil', auth, validateAtualizarPerfil, handleValidationErrors, atualizarPerfil);
router.post('/esqueci-senha', limiterSenha, validateEsqueciSenha, handleValidationErrors, esqueciSenha);
router.post('/redefinir-senha', limiterSenha, validateRedefinirSenha, handleValidationErrors, redefinirSenha);
router.post('/primeiro-acesso', limiterLogin, validateLogin, handleValidationErrors, primeiroAcesso);
router.get('/usuarios', auth, adminOnly, listarUsuarios);
router.get('/usuarios-ativos', auth, listarUsuariosAtivos);
router.get('/usuarios/:id', auth, adminOnly, validateParamId, handleValidationErrors, obterUsuario);
router.put('/usuarios/:id', auth, adminOnly, validateParamId, validateRegistroUsuario, handleValidationErrors, atualizarUsuario);
router.post('/usuarios/:id/resetar-senha', auth, adminOnly, validateParamId, handleValidationErrors, resetarSenhaUsuario);

export default router;

