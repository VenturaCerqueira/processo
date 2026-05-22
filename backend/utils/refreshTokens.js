import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import pool from '../config/database.js';

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Gera access token e refresh token
 * @param {Object} user - Dados do usuário
 * @returns {Object} - { accessToken, refreshToken, accessExpiresIn, refreshExpiresIn }
 */
export const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { id: user.id, tipo: user.tipo || 'staff', nivelAcesso: user.nivelAcesso },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = randomBytes(64).toString('hex');

  // Calcular datas de expiração
  const accessExpires = new Date(Date.now() + parseExpiry(ACCESS_TOKEN_EXPIRY));
  const refreshExpires = new Date(Date.now() + parseExpiry(REFRESH_TOKEN_EXPIRY));

  // Salvar refresh token no banco
  const connection = await pool.getConnection();
  try {
    // Invalidar refresh tokens anteriores do usuário (opcional: manter apenas 1)
    await connection.query(
      'UPDATE refresh_tokens SET revoked = 1 WHERE userId = ? AND usuarioTipo = ?',
      [user.id, user.tipo || 'staff']
    );

    // Inserir novo refresh token
    await connection.query(
      `INSERT INTO refresh_tokens (userId, usuarioTipo, token, expiresAt) VALUES (?, ?, ?, ?)`,
      [user.id, user.tipo || 'staff', refreshToken, refreshExpires]
    );
  } finally {
    connection.release();
  }

  return {
    accessToken,
    refreshToken,
    accessExpiresIn: parseExpiry(ACCESS_TOKEN_EXPIRY) / 1000,
    refreshExpiresIn: parseExpiry(REFRESH_TOKEN_EXPIRY) / 1000,
  };
};

/**
 * Valida refresh token e retorna novo access token
 * @param {string} refreshToken - Refresh token
 * @returns {Object|null} - { accessToken, accessExpiresIn } ou null se inválido
 */
export const refreshAccessToken = async (refreshToken) => {
  const connection = await pool.getConnection();
  try {
    // Buscar refresh token válido
    const [tokens] = await connection.query(
      `SELECT rt.*, u.nome, u.email, u.nivelAcesso, u.ativo
       FROM refresh_tokens rt
       LEFT JOIN users u ON rt.userId = u.id AND rt.usuarioTipo = 'staff'
       LEFT JOIN requerentes r ON rt.userId = r.id AND rt.usuarioTipo = 'requerente'
       WHERE rt.token = ? AND rt.revoked = 0 AND rt.expiresAt > NOW()`,
      [refreshToken]
    );

    if (tokens.length === 0) {
      return null;
    }

    const tokenData = tokens[0];

    // Verificar se usuário ainda está ativo
    if (tokenData.ativo === 0 || tokenData.ativo === false) {
      return null;
    }

    // Gerar novo access token
    const accessToken = jwt.sign(
      {
        id: tokenData.userId,
        tipo: tokenData.usuarioTipo,
        nivelAcesso: tokenData.nivelAcesso
      },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    return {
      accessToken,
      accessExpiresIn: parseExpiry(ACCESS_TOKEN_EXPIRY) / 1000,
      user: {
        id: tokenData.userId,
        nome: tokenData.nome,
        email: tokenData.email,
        nivelAcesso: tokenData.nivelAcesso
      }
    };
  } finally {
    connection.release();
  }
};

/**
 * Revoga refresh token (logout)
 * @param {string} refreshToken - Refresh token a revogar
 */
export const revokeRefreshToken = async (refreshToken) => {
  const [result] = await pool.query(
    'UPDATE refresh_tokens SET revoked = 1 WHERE token = ?',
    [refreshToken]
  );
  return result.affectedRows > 0;
};

/**
 * Revoga todos os refresh tokens de um usuário
 * @param {number} userId - ID do usuário
 * @param {string} usuarioTipo - 'staff' ou 'requerente'
 */
export const revokeAllUserTokens = async (userId, usuarioTipo) => {
  await pool.query(
    'UPDATE refresh_tokens SET revoked = 1 WHERE userId = ? AND usuarioTipo = ?',
    [userId, usuarioTipo]
  );
};

/**
 * Limpa tokens expirados (job de cleanup)
 */
export const cleanupExpiredTokens = async () => {
  const [result] = await pool.query(
    'DELETE FROM refresh_tokens WHERE expiresAt < NOW() OR revoked = 1'
  );
  return result.affectedRows;
};

// Helper para parsear tempo de expiry
function parseExpiry(expiry) {
  const match = expiry.match(/^(\d+)([mhds])$/);
  if (!match) return 15 * 60 * 1000; // default 15 minutes

  const [, value, unit] = match;
  const multipliers = {
    's': 1000,
    'm': 60 * 1000,
    'h': 60 * 60 * 1000,
    'd': 24 * 60 * 60 * 1000
  };

  return parseInt(value) * (multipliers[unit] || 60 * 1000);
}