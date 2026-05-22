import rateLimit from 'express-rate-limit';

// Rate limiter geral - 100 requisições por 15 minutos
export const limiterGeral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user?.nivelAcesso === 'admin'
});

// Rate limiter para login - 5 tentativas por 15 minutos
export const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.body?.email || req.ip
});

// Rate limiter para recuperação de senha - 3 tentativas por hora
export const limiterSenha = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Muitas tentativas de recuperação de senha. Tente novamente em 1 hora.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.email || req.ip
});

// Rate limiter para upload - 10 uploads por hora
export const limiterUpload = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Limite de uploads excedido. Tente novamente em 1 hora.',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para notificações - 200 requisições por minuto (suporta polling a cada 12s com múltiplas abas)
export const limiterNotificacoes = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: 'Muitas requisições. Tente novamente em alguns segundos.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user?.nivelAcesso === 'admin'
});
