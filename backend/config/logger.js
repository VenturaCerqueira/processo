import winston from 'winston';
import pool from './database.js';

// Buffer para logs antes da conexão estar pronta
const logBuffer = [];
let transportReady = false;

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
  if (!transportReady) {
    const isConnected = await checkConnection();
    if (!isConnected) return;

    transportReady = true;
    console.log('Logger: Banco de dados disponível, fluchando logs em buffer');

    for (const logInfo of logBuffer) {
      await writeToDatabase(logInfo);
    }
    logBuffer.length = 0;
  }
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
          await flushBuffer();
        }

        if (transportReady) {
          await writeToDatabase(info);
          callback(null, true);
        } else {
          // Bufferizar se o banco ainda não está disponível
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
setInterval(flushBuffer, 5000); // Tentar a cada 5 segundos

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