import pool from '../config/database.js';

export const listarEntidades = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM entidades WHERE ativo = 1 ORDER BY nome');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const obterEntidade = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM entidades WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Entidade nao encontrada.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const criarEntidade = async (req, res) => {
  try {
    const { nome, slug, database_name, username, host, port } = req.body;
    const [result] = await pool.query(
      'INSERT INTO entidades (nome, slug, database_name, username, host, port) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, slug || null, database_name || null, username || null, host || null, port || null]
    );
    const [rows] = await pool.query('SELECT * FROM entidades WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarEntidade = async (req, res) => {
  try {
    const { nome, slug, database_name, username, host, port, ativo } = req.body;
    await pool.query(
      'UPDATE entidades SET nome = ?, slug = ?, database_name = ?, username = ?, host = ?, port = ?, ativo = ? WHERE id = ?',
      [nome, slug || null, database_name || null, username || null, host || null, port || null, ativo !== undefined ? ativo : 1, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM entidades WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const excluirEntidade = async (req, res) => {
  try {
    await pool.query('UPDATE entidades SET ativo = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Entidade desativada com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

