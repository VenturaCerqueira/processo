import express from 'express';
import {
  listarNotificacoes,
  listarNaoLidas,
  marcarComoLida,
  marcarTodasComoLidas
} from '../controllers/notificacaoController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, listarNotificacoes);
router.get('/nao-lidas', auth, listarNaoLidas);
router.put('/:id/lida', auth, marcarComoLida);
router.put('/marcar-todas-lidas', auth, marcarTodasComoLidas);

export default router;

