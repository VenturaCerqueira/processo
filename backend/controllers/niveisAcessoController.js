import pool from '../config/database.js';

export const listarNiveisAcesso = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome, descricao, permissoes, ativo, createdAt FROM niveis_acesso ORDER BY nome');
    res.json(rows.map(r => ({
      ...r,
      permissoes: typeof r.permissoes === 'string' ? JSON.parse(r.permissoes) : r.permissoes
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const obterNivelAcesso = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome, descricao, permissoes, ativo, createdAt FROM niveis_acesso WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Nivel de acesso nao encontrado.' });
    const r = rows[0];
    r.permissoes = typeof r.permissoes === 'string' ? JSON.parse(r.permissoes) : r.permissoes;
    res.json(r);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const criarNivelAcesso = async (req, res) => {
  try {
    const { nome, descricao, permissoes } = req.body;
    const [existe] = await pool.query('SELECT id FROM niveis_acesso WHERE nome = ?', [nome]);
    if (existe.length > 0) {
      return res.status(400).json({ message: 'Ja existe um nivel de acesso com este nome.' });
    }
    const permJson = JSON.stringify(permissoes || {});
    const [result] = await pool.query(
      'INSERT INTO niveis_acesso (nome, descricao, permissoes) VALUES (?, ?, ?)',
      [nome, descricao, permJson]
    );
    const [rows] = await pool.query('SELECT id, nome, descricao, permissoes, ativo, createdAt FROM niveis_acesso WHERE id = ?', [result.insertId]);
    const r = rows[0];
    r.permissoes = typeof r.permissoes === 'string' ? JSON.parse(r.permissoes) : r.permissoes;
    res.status(201).json(r);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarNivelAcesso = async (req, res) => {
  try {
    const { nome, descricao, permissoes, ativo } = req.body;
    const [existe] = await pool.query('SELECT id FROM niveis_acesso WHERE nome = ? AND id != ?', [nome, req.params.id]);
    if (existe.length > 0) {
      return res.status(400).json({ message: 'Ja existe outro nivel de acesso com este nome.' });
    }
    const permJson = permissoes !== undefined ? JSON.stringify(permissoes) : undefined;
    if (permJson !== undefined) {
      await pool.query(
        'UPDATE niveis_acesso SET nome = ?, descricao = ?, permissoes = ?, ativo = ? WHERE id = ?',
        [nome, descricao, permJson, ativo, req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE niveis_acesso SET nome = ?, descricao = ?, ativo = ? WHERE id = ?',
        [nome, descricao, ativo, req.params.id]
      );
    }
    const [rows] = await pool.query('SELECT id, nome, descricao, permissoes, ativo, createdAt FROM niveis_acesso WHERE id = ?', [req.params.id]);
    const r = rows[0];
    r.permissoes = typeof r.permissoes === 'string' ? JSON.parse(r.permissoes) : r.permissoes;
    res.json(r);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const excluirNivelAcesso = async (req, res) => {
  try {
    const [vinculados] = await pool.query('SELECT COUNT(*) as count FROM users WHERE nivelAcesso = (SELECT nome FROM niveis_acesso WHERE id = ?)', [req.params.id]);
    if (vinculados[0].count > 0) {
      return res.status(400).json({ message: 'Nao e possivel excluir: existem usuarios vinculados a este nivel de acesso.' });
    }
    await pool.query('DELETE FROM niveis_acesso WHERE id = ?', [req.params.id]);
    res.json({ message: 'Nivel de acesso excluido com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

