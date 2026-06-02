import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import logger from './config/logger.js';
import { requestLogger, errorLogger } from './middleware/logger.js';
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
import processosAnterioresRoutes from './routes/processosAnteriores.js';
import importarProcessoRoutes from './routes/importarProcesso.js';
import logsRoutes from './routes/logs.js';
import notificacaoRoutes from './routes/notificacoes.js';
import requerenteRoutes from './routes/requerente.js';
import { enviarAlertasPrazosAproximando } from './jobs/prazosAproximandoJob.js';
import { limiterGeral, limiterLogin } from './middleware/rateLimiter.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(limiterGeral); // Rate limiter geral para todas as rotas
app.use(requestLogger); // Logger de requisições HTTP

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
app.use('/api/processos/anteriores', processosAnterioresRoutes);
app.use('/api/processos/importar', importarProcessoRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/notificacoes', notificacaoRoutes);
app.use('/api/requerente', requerenteRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware de erro (deve ser o último)
app.use(errorLogger);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await initDatabase();
    await criarUsuarioAdmin();
    console.log(`Servidor rodando na porta ${PORT}`);
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error.message);
  }

  // Rotina para avisar usuários quando o prazo do processo estiver próximo de acabar
  // (2 dias por padrão, conforme solicitado) - inicia APÓS banco estar disponível
  try {
    await enviarAlertasPrazosAproximando({ diasAntecedencia: 2 });
    setInterval(() => {
      enviarAlertasPrazosAproximando({ diasAntecedencia: 2 }).catch((e) => {
        console.error('Erro no job de alertas de prazo:', e.message);
      });
    }, 60 * 60 * 1000); // 1 vez por hora
  } catch (e) {
    console.error('Erro ao iniciar job de alertas de prazo:', e.message);
  }
});

