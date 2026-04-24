import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { hashSenha, compararSenha } from '../utils/helpers.js';
import { randomBytes } from 'crypto';

const gerarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND ativo = 1', [email]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    const senhaValida = await compararSenha(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    const token = gerarToken(user.id);
    res.json({
      token,
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
    res.status(500).json({ message: error.message });
  }
};

export const registrar = async (req, res) => {
  try {
    const { nome, email, senha, cargo, setor, nivelAcesso = 'operador' } = req.body;
    const [existe] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existe.length > 0) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }
    const senhaHash = await hashSenha(senha);
    const [result] = await pool.query(
      'INSERT INTO users (nome, email, senha, cargo, setor, nivelAcesso) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, email, senhaHash, cargo, setor, nivelAcesso]
    );
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const user = rows[0];
    const token = gerarToken(user.id);
    res.status(201).json({
      token,
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
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ? AND ativo = 1', [email]);
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
    res.json({ message: 'Token de recuperação gerado.', token });
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
    res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listarUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome, email, cargo, setor, nivelAcesso, ativo, createdAt FROM users ORDER BY nome');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const obterUsuario = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome, email, cargo, setor, nivelAcesso, ativo, createdAt FROM users WHERE id = ?', [req.params.id]);
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

