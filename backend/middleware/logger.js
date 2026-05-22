import { httpLogger } from '../config/logger.js';
import { sanitizeRequestForLog } from './sanitizer.js';

/**
 * Middleware para logar requisições HTTP
 * Registra informações de request/response para auditoria e debugging
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Capturar URL, método, IP
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');
  const userId = req.user?.id ? `[User: ${req.user.id}]` : '[Anonymous]';

  // Interceptar res.json para logar resposta
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const statusMessage = data?.message || 'OK';

    // Logar requisição com resposta
    const logMessage = `${method} ${url} - ${statusCode}`;
    const logData = {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      userId,
      ip,
      userAgent,
      responseMessage: statusMessage,
    };

    // Logar como erro se status >= 400
    if (statusCode >= 400) {
      httpLogger.warn(logMessage, logData);
    } else if (statusCode >= 200 && statusCode < 300) {
      httpLogger.info(logMessage, logData);
    } else {
      httpLogger.debug(logMessage, logData);
    }

    return originalJson.call(this, data);
  };

  // Log de requisição chegando
  httpLogger.debug(`${method} ${url} - Request incoming`, {
    userId,
    ip,
    userAgent,
  });

  next();
};

/**
 * Middleware para logar erros não capturados
 */
export const errorLogger = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const userId = req.user?.id ? `[User: ${req.user.id}]` : '[Anonymous]';
  const url = req.url;
  const method = req.method;

  // Sanitiza body antes de logar para remover dados sensíveis
  const sanitizedBody = sanitizeRequestForLog(req).body;

  httpLogger.error(`${method} ${url} - ${statusCode} ${message}`, {
    userId,
    method,
    url,
    statusCode,
    message,
    stack: err.stack,
    body: sanitizedBody,
  });

  // Não expor detalhes internos do erro em produção
  const response = {
    message: process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : message,
  };

  res.status(statusCode).json(response);
};
