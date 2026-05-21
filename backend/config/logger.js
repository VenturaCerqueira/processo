import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Níveis de log customizados
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Cores para console (apenas em desenvolvimento)
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Formato de log customizado
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) => {
      const { timestamp, level, message, stack, ...args } = info;
      
      // Se houver stack trace (erro), incluir
      const stackTrace = stack ? `\n${stack}` : '';
      
      // Se houver args adicionais, converter para JSON
      const extraData = Object.keys(args).length > 0 ? `\n${JSON.stringify(args, null, 2)}` : '';
      
      return `${timestamp} | [${level.toUpperCase()}] | ${message}${stackTrace}${extraData}`;
    }
  )
);

// Transporte para console (development)
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    format
  ),
});

// Transporte para arquivo de erros (rotation diária)
const errorFileTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../logs/error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
  format: format,
});

// Transporte para arquivo de logs combinados (rotation diária)
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../logs/combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: format,
});

// Transporte para arquivo HTTP/requisições (rotation diária)
const httpFileTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../logs/http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '7d',
  level: 'http',
  format: format,
});

// Configurar transports baseado no ambiente
const transports = [errorFileTransport, combinedFileTransport];

if (process.env.NODE_ENV === 'development') {
  transports.push(consoleTransport);
  transports.push(httpFileTransport);
}

// Criar logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  transports,
});

// Logger específico para requisições HTTP
export const httpLogger = winston.createLogger({
  level: 'http',
  levels: logLevels,
  format: format,
  transports: [httpFileTransport, ...(process.env.NODE_ENV === 'development' ? [consoleTransport] : [])],
});

// Logger específico para banco de dados
export const dbLogger = winston.createLogger({
  level: 'debug',
  levels: logLevels,
  format: format,
  transports: process.env.LOG_LEVEL === 'debug' 
    ? [...transports, new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          format
        ),
      })]
    : transports,
});

export default logger;
