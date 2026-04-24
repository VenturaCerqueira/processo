import bcrypt from 'bcryptjs';

export const hashSenha = async (senha) => {
  return await bcrypt.hash(senha, 10);
};

export const compararSenha = async (senha, hash) => {
  return await bcrypt.compare(senha, hash);
};

export const gerarNumeroProcesso = () => {
  const ano = new Date().getFullYear();
  const sequencial = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `${ano}.${sequencial}`;
};

