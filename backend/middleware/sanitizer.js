/**
 * Função para remover dados sensíveis de logs
 * Remove: senhas, tokens, chaves API, números de cartão, etc
 */
export const sanitizeForLog = (data) => {
  if (!data) return data;
  
  const sensitiveFields = [
    'senha',
    'novaSenha',
    'senhaTemporaria',
    'token',
    'refreshToken',
    'apiKey',
    'apiSecret',
    'creditCard',
    'cvv',
    'ssn',
    'authorization',
    'x-api-key'
  ];
  
  const sanitized = JSON.parse(JSON.stringify(data));
  
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    for (const key in obj) {
      // Check if key matches sensitive fields (case insensitive)
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        obj[key] = '***REDACTED***';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recursively sanitize nested objects
        sanitizeObject(obj[key]);
      }
    }
    return obj;
  };
  
  return sanitizeObject(sanitized);
};

/**
 * Middleware para sanitizar requisições no log
 */
export const sanitizeRequestForLog = (req) => {
  return {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?.id,
    headers: sanitizeForLog({
      'content-type': req.get('content-type'),
      'authorization': req.get('authorization') ? '***REDACTED***' : undefined
    }),
    body: sanitizeForLog(req.body)
  };
};

/**
 * Exemplo de uso no logger:
 * 
 * logger.error('Erro em login', {
 *   request: sanitizeRequestForLog(req),
 *   error: error.message
 * });
 */
