import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './config/database.js';
import { criarUsuarioAdmin } from './controllers/authController.js';
import authRoutes from './routes/auth.js';
import processoRoutes from './routes/processos.js';
import uploadRoutes from './routes/uploads.js';
import tiposProcessoRoutes from './routes/tiposProcesso.js';
import setoresRoutes from './routes/setores.js';
import prioridadesRoutes from './routes/prioridades.js';
import requerentesRoutes from './routes/requerentes.js';
import entidadesRoutes from './routes/entidades.js';
import niveisAcessoRoutes from './routes/niveisAcesso.js';
import especiesProcessoRoutes from './routes/especiesProcesso.js';
import notificacaoRoutes from './routes/notificacoes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/processos', processoRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/tipos-processo', tiposProcessoRoutes);
app.use('/api/setores', setoresRoutes);
app.use('/api/prioridades', prioridadesRoutes);
app.use('/api/requerentes', requerentesRoutes);
app.use('/api/entidades', entidadesRoutes);
app.use('/api/niveis-acesso', niveisAcessoRoutes);
app.use('/api/especies-processo', especiesProcessoRoutes);
app.use('/api/notificacoes', notificacaoRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await initDatabase();
    await criarUsuarioAdmin();
    console.log(`Servidor rodando na porta ${PORT}`);
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error.message);
  }
});

