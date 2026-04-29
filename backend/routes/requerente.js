import express from 'express';
import { login, registrar, esqueciSenha, redefinirSenha, perfil } from '../controllers/requerenteAuthController.js';
import { auth } from '../middleware/auth.js';
import { listarProcessosRequerente, obterProcessoRequerente, listarNotificacoesRequerente } from '../controllers/requerenteController.js';

const router = express.Router();

// Auth routes (public)
router.post('/auth/login', login);
router.post('/auth/registrar', registrar);
router.post('/auth/esqueci-senha', esqueciSenha);
router.post('/auth/redefinir-senha', redefinirSenha);

// Protected
router.get('/perfil', auth, perfil);
router.get('/processos', auth, listarProcessosRequerente);
router.get('/processos/:id', auth, obterProcessoRequerente);
router.get('/notificacoes', auth, listarNotificacoesRequerente);

export default router;

