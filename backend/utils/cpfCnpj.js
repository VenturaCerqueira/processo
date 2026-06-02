export const onlyDigits = (value) => String(value ?? '').replace(/\D/g, '');

export const detectarTipoPessoa = (cpfCnpj) => {
  const v = onlyDigits(cpfCnpj);
  if (v.length === 14) return 'juridica';
  if (v.length === 11) return 'fisica';
  return null;
};

export const normalizarCpfCnpj = (cpfCnpj) => {
  const digits = onlyDigits(cpfCnpj);
  // Normaliza apenas mantendo o que importa para comparação: 11 ou 14 dígitos.
  if (digits.length >= 14) return digits.slice(0, 14);
  if (digits.length >= 11) return digits.slice(0, 11);
  return digits;
};

