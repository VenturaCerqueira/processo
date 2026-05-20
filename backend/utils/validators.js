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

