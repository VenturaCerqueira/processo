import winston from 'winston';
import pool from './database.js';

// Buffer para logs antes da conexão estar pronta
const logBuffer = [];
let transportReady = false;
let connectionCheckInterval = null;

// Verificar se o banco está disponível
async function checkConnection() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

// Flush dos logs em buffer quando o banco ficar disponível
async function flushBuffer() {
  const isConnected = await checkConnection();
  if (!isConnected) {
    // Não marca transportReady como true se não há conexão
    return false;
  }

  if (!transportReady) {
    transportReady = true;
    console.log('Logger: Banco de dados disponível, fluchando logs em buffer');

    // Limpa o interval de verificação contínua após recuperação
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval);
      connectionCheckInterval = null;
    }

    for (const logInfo of logBuffer) {
      await writeToDatabase(logInfo);
    }
    logBuffer.length = 0;
    return true;
  }
  return true;
}

// Escrever log no banco
async function writeToDatabase(info) {
  const { level, message, ...meta } = info;
  const metaJson = Object.keys(meta).length > 0 ? JSON.stringify(meta) : null;

  try {
    await pool.query(
      'INSERT INTO logs (level, message, meta, timestamp) VALUES (?, ?, ?, NOW())',
      [level, String(message), metaJson]
    );
  } catch (err) {
    console.error('Erro ao gravar log no banco:', err.message);
    // Se falhar por perda de conexão, marca para rediscover
    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ER_NO_SUCH_TABLE') {
      transportReady = false;
      scheduleConnectionCheck();
    }
  }
}

// Agenda verificação periódica de conexão quando banco cai
function scheduleConnectionCheck() {
  if (!connectionCheckInterval) {
    connectionCheckInterval = setInterval(async () => {
      await flushBuffer();
    }, 5000); // Tentar reconectar a cada 5 segundos
  }
}

// Transport para gravar logs no banco de dados
const databaseTransport = {
  name: 'database',
  level: 'info',

  log(info, callback) {
    setImmediate(async () => {
      try {
        if (!transportReady) {
          const flushed = await flushBuffer();
          if (!flushed) {
            // Banco indisponível, bufferiza
            logBuffer.push(info);
            callback(null, true);
            return;
          }
        }

        if (transportReady) {
          await writeToDatabase(info);
          callback(null, true);
        } else {
          logBuffer.push(info);
          callback(null, true);
        }
      } catch (err) {
        callback(err, false);
      }
    });
  },
};

// Inicializar verificação de conexão
flushBuffer().catch(() => {});

// Levels de log
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Formato de log
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Criar logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

logger.add(databaseTransport);

// Logger específico para requisições HTTP
export const httpLogger = winston.createLogger({
  level: 'http',
  levels: logLevels,
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

httpLogger.add(databaseTransport);

// Logger específico para banco de dados
export const dbLogger = winston.createLogger({
  level: process.env.LOG_LEVEL === 'debug' ? 'debug' : 'info',
  levels: logLevels,
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

dbLogger.add(databaseTransport);

export default logger;