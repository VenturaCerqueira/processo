import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { hashSenha, compararSenha } from '../utils/helpers.js';
import { randomBytes } from 'crypto';
import { enviarEmailRecuperacao, enviarEmailPrimeiroAcesso } from '../utils/email.js';
import { generateTokens, refreshAccessToken, revokeRefreshToken } from '../utils/refreshTokens.js';
import logger from '../config/logger.js';
import { sanitizeRequestForLog } from '../middleware/sanitizer.js';

const gerarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND ativo = 1', [email]);
    const user = rows[0];
    if (!user) {
      logger.warn(`Tentativa de login com email não encontrado: ${email}`, { email, ip: req.ip });
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    if (user.primeiroAcesso === 1) {
      logger.warn(`Tentativa de login em conta pendente: ${email}`, { email, userId: user.id });
      return res.status(403).json({ message: 'Conta pendente de ativação. Use a área de Primeiro Acesso.' });
    }
    const senhaValida = await compararSenha(senha, user.senha);
    if (!senhaValida) {
      logger.warn(`Tentativa de login com senha incorreta: ${email}`, { email, userId: user.id, ip: req.ip });
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // Gerar tokens (access + refresh)
    const userWithTipo = { ...user, tipo: 'staff' };
    const tokens = await generateTokens(userWithTipo);

    logger.info(`Login bem-sucedido: ${email}`, {
      email,
      userId: user.id,
      cargo: user.cargo,
      setor: user.setor,
      nivelAcesso: user.nivelAcesso,
      ip: req.ip
    });

    res.json({
      ...tokens,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        setor: user.setor,
        nivelAcesso: user.nivelAcesso
      }
    });
  } catch (error) {
    logger.error(`Erro ao fazer login: ${error.message}`, {
      error: error.stack,
      request: sanitizeRequestForLog(req)
    });
    res.status(500).json({ message: error.message });
  }
};

export const registrar = async (req, res) => {
  try {
    const { nome, email, cargo, setor, nivelAcesso = 'operador' } = req.body;
    const [existe] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existe.length > 0) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }
    const senhaTemporaria = Math.random().toString(36).slice(-8);
    const senhaHash = await hashSenha(senhaTemporaria);
    const [result] = await pool.query(
      'INSERT INTO users (nome, email, senha, cargo, setor, nivelAcesso, primeiroAcesso) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nome, email, senhaHash, cargo, setor, nivelAcesso, 1]
    );
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const user = rows[0];
    res.status(201).json({
      message: 'Usuário cadastrado com sucesso. Um e-mail de ativação será enviado no primeiro acesso.',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        setor: user.setor,
        nivelAcesso: user.nivelAcesso,
        primeiroAcesso: user.primeiroAcesso
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const perfil = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome, email, cargo, setor, nivelAcesso, ativo, createdAt FROM users WHERE id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const esqueciSenha = async (req, res) => {
  try {
    const { email } = req.body;
    const [rows] = await pool.query('SELECT id, nome FROM users WHERE email = ? AND ativo = 1', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Email não encontrado.' });
    }
    const token = randomBytes(32).toString('hex');
    const expiraEm = new Date();
    expiraEm.setHours(expiraEm.getHours() + 1);
    await pool.query(
      'INSERT INTO recuperacao_senha (email, token, expiraEm) VALUES (?, ?, ?)',
      [email, token, expiraEm]
    );
    try {
      await enviarEmailRecuperacao(email, token, rows[0].nome);
    } catch (emailError) {
      console.error('Erro ao enviar e-mail de recuperação:', emailError.message);
      return res.status(500).json({ message: emailError.message || 'Erro ao enviar e-mail de recuperação. Verifique a configuração SMTP.' });
    }
    res.json({ message: 'Link de recuperação enviado para o e-mail informado.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const redefinirSenha = async (req, res) => {
  try {
    const { email, token, novaSenha } = req.body;
    const [rows] = await pool.query(
      'SELECT * FROM recuperacao_senha WHERE email = ? AND token = ? AND usado = 0 AND expiraEm > NOW() ORDER BY createdAt DESC LIMIT 1',
      [email, token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }
    const senhaHash = await hashSenha(novaSenha);
    await pool.query('UPDATE users SET senha = ? WHERE email = ?', [senhaHash, email]);
    await pool.query('UPDATE recuperacao_senha SET usado = 1 WHERE id = ?', [rows[0].id]);
    await pool.query('UPDATE users SET primeiroAcesso = 0 WHERE email = ? AND primeiroAcesso = 1', [email]);
    res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listarUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome, email, cargo, setor, nivelAcesso, ativo, primeiroAcesso, createdAt FROM users ORDER BY nome');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listarUsuariosAtivos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome, email, cargo, setor, nivelAcesso FROM users WHERE ativo = 1 ORDER BY nome');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const obterUsuario = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome, email, cargo, setor, nivelAcesso, ativo, primeiroAcesso, createdAt FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarUsuario = async (req, res) => {
  try {
    const { nome, email, cargo, setor, nivelAcesso, ativo } = req.body;
    await pool.query(
      'UPDATE users SET nome = ?, email = ?, cargo = ?, setor = ?, nivelAcesso = ?, ativo = ? WHERE id = ?',
      [nome, email, cargo, setor, nivelAcesso, ativo, req.params.id]
    );
    const [rows] = await pool.query('SELECT id, nome, email, cargo, setor, nivelAcesso, ativo, createdAt FROM users WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetarSenhaUsuario = async (req, res) => {
  try {
    const { novaSenha } = req.body;
    const senhaHash = await hashSenha(novaSenha);
    await pool.query('UPDATE users SET senha = ? WHERE id = ?', [senhaHash, req.params.id]);
    res.json({ message: 'Senha resetada com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarPerfil = async (req, res) => {
  try {
    const { email, senhaAtual, novaSenha } = req.body;
    const userId = req.user.id;

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const senhaValida = await compararSenha(senhaAtual, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Senha atual incorreta.' });
    }

    if (email && email !== user.email) {
      const [existe] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existe.length > 0) {
        return res.status(400).json({ message: 'Email já cadastrado por outro usuário.' });
      }
    }

    let query = 'UPDATE users SET email = ?';
    const params = [email || user.email];

    if (novaSenha) {
      if (novaSenha.length < 6) {
        return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres.' });
      }
      const senhaHash = await hashSenha(novaSenha);
      query += ', senha = ?';
      params.push(senhaHash);
    }

    query += ' WHERE id = ?';
    params.push(userId);
    await pool.query(query, params);

    const [updated] = await pool.query(
      'SELECT id, nome, email, cargo, setor, nivelAcesso, ativo, createdAt FROM users WHERE id = ?',
      [userId]
    );
    res.json({ message: 'Perfil atualizado com sucesso.', user: updated[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const primeiroAcesso = async (req, res) => {
  try {
    const { email } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND ativo = 1', [email]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    if (user.primeiroAcesso !== 1) {
      return res.status(400).json({ message: 'Esta conta já foi ativada. Use o login normal.' });
    }
    const token = randomBytes(32).toString('hex');
    const expiraEm = new Date();
    expiraEm.setHours(expiraEm.getHours() + 1);
    await pool.query(
      'INSERT INTO recuperacao_senha (email, token, expiraEm) VALUES (?, ?, ?)',
      [email, token, expiraEm]
    );
    try {
      await enviarEmailPrimeiroAcesso(email, token, user.nome);
    } catch (emailError) {
      console.error('Erro ao enviar e-mail de primeiro acesso:', emailError.message);
      return res.status(500).json({ message: emailError.message || 'Erro ao enviar e-mail de ativação. Verifique a configuração SMTP.' });
    }
    res.json({ message: 'Link de ativação enviado para o e-mail informado.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const criarUsuarioAdmin = async () => {
  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@processo.gov.br']);
    if (rows.length === 0) {
      const senhaHash = await hashSenha('admin123');
      await pool.query(
        'INSERT INTO users (nome, email, senha, cargo, setor, nivelAcesso) VALUES (?, ?, ?, ?, ?, ?)',
        ['Administrador', 'admin@processo.gov.br', senhaHash, 'Administrador', 'Administrador', 'admin']
      );
      console.log('Usuário admin criado: admin@processo.gov.br / admin123');
    }
  } catch (error) {
    console.error('Erro ao criar admin:', error);
  }
};

/**
 * Refresh token - gera novo access token a partir do refresh token
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token é obrigatório.' });
    }

    const result = await refreshAccessToken(refreshToken);
    if (!result) {
      return res.status(401).json({ message: 'Refresh token inválido ou expirado.' });
    }

    res.json(result);
  } catch (error) {
    logger.error(`Erro ao fazer refresh token: ${error.message}`, {
      error: error.stack,
      request: sanitizeRequestForLog(req)
    });
    res.status(500).json({ message: error.message });
  }
};

/**
 * Logout - revoga o refresh token
 */
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    logger.info(`Logout: ${req.user?.email || 'Unknown'}`, {
      userId: req.user?.id,
      ip: req.ip
    });

    res.json({ message: 'Logout realizado com sucesso.' });
  } catch (error) {
    logger.error(`Erro ao fazer logout: ${error.message}`, {
      error: error.stack,
      request: sanitizeRequestForLog(req)
    });
    res.status(500).json({ message: error.message });
  }
};
