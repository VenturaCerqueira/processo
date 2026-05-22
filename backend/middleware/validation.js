import { body, param, query, validationResult } from 'express-validator';
import { validateCpfCnpj } from '../utils/validators.js';

/**
 * Middleware para validar resultado de validações
 * Se houver erros, retorna 400 com lista de erros
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Erros de validação',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Validador customizado para CPF/CNPJ com dígito verificador
 */
export const validateCpfCnpjWithDigit = (value) => {
  const result = validateCpfCnpj(value);
  if (!result.valid) {
    throw new Error(`${result.tipo === 'cpf' ? 'CPF' : result.tipo === 'cnpj' ? 'CNPJ' : 'CPF/CNPJ'} inválido.`);
  }
  return true;
};

/**
 * Validações de Autenticação
 */
export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido'),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
];

export const validateRegistroUsuario = [
  body('nome')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Nome deve ter entre 3 e 255 caracteres'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido'),
  body('cargo')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cargo deve ter entre 2 e 100 caracteres'),
  body('setor')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Setor deve ter entre 2 e 100 caracteres'),
  body('nivelAcesso')
    .optional()
    .isIn(['admin', 'gestor', 'operador', 'consultor'])
    .withMessage('Nível de acesso inválido'),
];

export const validateEsqueciSenha = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido'),
];

export const validateRedefinirSenha = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido'),
  body('token')
    .trim()
    .isLength({ min: 32 })
    .withMessage('Token inválido'),
  body('novaSenha')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter no mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter: letra maiúscula, minúscula e número'),
];

export const validateAtualizarPerfil = [
  body('nome')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Nome deve ter entre 3 e 255 caracteres'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email inválido'),
];

/**
 * Validações de Processos
 */
export const validateCriarProcesso = [
  body('tipo')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Tipo deve ter entre 2 e 100 caracteres'),
  body('assunto')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Assunto deve ter entre 3 e 500 caracteres'),
  body('requerente')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Requerente deve ter entre 3 e 255 caracteres'),
  body('setorAtual')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Setor é obrigatório'),
  body('prioridade')
    .optional()
    .isIn(['baixa', 'normal', 'alta', 'urgente'])
    .withMessage('Prioridade inválida'),
  body('prazo')
    .optional()
    .isISO8601()
    .withMessage('Prazo deve ser uma data válida (YYYY-MM-DD)'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email inválido'),
  body('telefone')
    .optional()
    .trim()
    .matches(/^\d{10,11}$/)
    .withMessage('Telefone inválido'),
  body('cpfCnpj')
    .optional()
    .trim()
    .custom(validateCpfCnpjWithDigit)
    .withMessage('CPF ou CNPJ inválido'),
];

export const validateEncaminharProcesso = [
  body('para')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Setor de destino é obrigatório'),
  body('paraUsuario')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usuário de destino deve ser um número válido'),
  body('parecer')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Parecer não pode exceder 1000 caracteres'),
];

export const validateAdicionarObservacao = [
  body('texto')
    .trim()
    .isLength({ min: 3, max: 2000 })
    .withMessage('Observação deve ter entre 3 e 2000 caracteres'),
];

export const validateParamId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID deve ser um número válido'),
];

/**
 * Validações de Requerentes
 */
export const validateCriarRequerente = [
  body('nome')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Nome deve ter entre 3 e 255 caracteres'),
  body('cpfCnpj')
    .optional()
    .trim()
    .custom(validateCpfCnpjWithDigit)
    .withMessage('CPF ou CNPJ inválido'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email inválido'),
  body('telefone')
    .optional()
    .trim()
    .matches(/^\d{10,11}$/)
    .withMessage('Telefone inválido'),
  body('cep')
    .optional()
    .trim()
    .matches(/^\d{5}-\d{3}$/)
    .withMessage('CEP inválido (formato: 12345-678)'),
  body('estado')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .toUpperCase()
    .withMessage('Estado deve ser uma sigla de 2 letras'),
];

export const validateAtualizarRequerente = [
  ...validateCriarRequerente,
  body('ativo')
    .optional()
    .isBoolean()
    .withMessage('Ativo deve ser true ou false'),
];

/**
 * Validações de Uploads
 */
export const validateUploadDocumento = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do processo deve ser um número válido'),
];

/**
 * Validações de Query
 */
export const validatePaginacao = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número maior que 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve estar entre 1 e 100'),
];

export const validateBusca = [
  query('busca')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Busca não pode exceder 255 caracteres'),
];

/**
 * Validações de Requerente (Registro)
 */
export const validateRegistroRequerente = [
  body('nome')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Nome deve ter entre 3 e 255 caracteres'),
  body('cpfCnpj')
    .trim()
    .custom(validateCpfCnpjWithDigit)
    .withMessage('CPF ou CNPJ inválido'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido'),
  body('senha')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter no mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter: letra maiúscula, minúscula e número'),
  body('telefone')
    .optional()
    .trim()
    .matches(/^\d{10,11}$/)
    .withMessage('Telefone inválido'),
];
