// Validações/normalizações reutilizáveis para controllers

export const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

export const toOptionalTrimmedString = (v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
};

export const toOptionalString = (v) => {
  if (v === undefined || v === null) return null;
  return String(v);
};

export const parseOptionalInt = (v) => {
  if (v === undefined || v === null) return null;
  if (typeof v === 'string' && v.trim() === '') return null;
  const n = typeof v === 'number' ? v : Number.parseInt(String(v), 10);
  return Number.isNaN(n) ? null : n;
};

export const parseOptionalNumber = (v) => {
  if (v === undefined || v === null) return null;
  if (typeof v === 'string' && v.trim() === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isNaN(n) ? null : n;
};

export const validateEmailBasic = (email) => {
  if (!isNonEmptyString(email)) return false;
  // validação simples, sem depender de bibliotecas
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const validateDateISO = (value) => {
  if (!isNonEmptyString(value)) return false;
  // YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return false;
  const d = new Date(`${value.trim()}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime());
};

export const asPrioridade = (v) => {
  const permitido = ['baixa', 'normal', 'alta', 'urgente'];
  if (v === undefined || v === null || String(v).trim() === '') return 'normal';
  const s = String(v).trim().toLowerCase();
  if (!permitido.includes(s)) return null;
  return s;
};

export const ensureArrayOfObjects = (v) => Array.isArray(v) && v.every((x) => x && typeof x === 'object' && !Array.isArray(x));

/**
 * Valida CPF com dígito verificador
 * @param {string} cpf - CPF no formato XXX.XXX.XXX-XX ou XXXXXXXXXXX
 * @returns {boolean}
 */
export const validateCPF = (cpf) => {
  if (!cpf) return false;

  // Remover formatação
  const cleanCPF = cpf.replace(/[\.\-]/g, '');

  // Verificar tamanho
  if (cleanCPF.length !== 11) return false;

  // Verificar se todos os dígitos são iguais (CPF inválido comum)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(cleanCPF.charAt(9)) !== digit1) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(cleanCPF.charAt(10)) !== digit2) return false;

  return true;
};

/**
 * Valida CNPJ com dígito verificador
 * @param {string} cnpj - CNPJ no formato XX.XXX.XXX/XXXX-XX ou XXXXXXXXXXXXXX
 * @returns {boolean}
 */
export const validateCNPJ = (cnpj) => {
  if (!cnpj) return false;

  // Remover formatação
  const cleanCNPJ = cnpj.replace(/[\.\-\/]/g, '');

  // Verificar tamanho
  if (cleanCNPJ.length !== 14) return false;

  // Verificar se todos os dígitos são iguais (CNPJ inválido comum)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  // Pesos para cálculo do primeiro dígito
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  // Cálculo do primeiro dígito
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(cleanCNPJ.charAt(12)) !== digit1) return false;

  // Pesos para cálculo do segundo dígito
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  // Cálculo do segundo dígito
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(cleanCNPJ.charAt(13)) !== digit2) return false;

  return true;
};

/**
 * Valida CPF ou CNPJ
 * @param {string} cpfCnpj - CPF ou CNPJ
 * @returns {{ valid: boolean, tipo: 'cpf' | 'cnpj' | null }}
 */
export const validateCpfCnpj = (cpfCnpj) => {
  if (!cpfCnpj) return { valid: false, tipo: null };

  const clean = cpfCnpj.replace(/[\.\-\/]/g, '');

  if (clean.length === 11) {
    return { valid: validateCPF(clean), tipo: 'cpf' };
  } else if (clean.length === 14) {
    return { valid: validateCNPJ(clean), tipo: 'cnpj' };
  }

  return { valid: false, tipo: null };
};

/**
 * Formata CPF ou CNPJ
 * @param {string} cpfCnpj - CPF ou CNPJ (apenas números)
 * @returns {string}
 */
export const formatCpfCnpj = (cpfCnpj) => {
  if (!cpfCnpj) return '';

  const clean = cpfCnpj.replace(/[\.\-\/]/g, '');

  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  return cpfCnpj;
};

