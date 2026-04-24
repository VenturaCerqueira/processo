import pool from '../config/database.js';

export const listarTipos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tipos_processo WHERE ativo = 1 ORDER BY nome');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const obterTipo = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tipos_processo WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Tipo nao encontrado.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const criarTipo = async (req, res) => {
  try {
    const { nome, codigo } = req.body;
    const [result] = await pool.query(
      'INSERT INTO tipos_processo (nome, codigo) VALUES (?, ?)',
      [nome, codigo || null]
    );
    const [rows] = await pool.query('SELECT * FROM tipos_processo WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarTipo = async (req, res) => {
  try {
    const { nome, codigo, ativo } = req.body;
    await pool.query(
      'UPDATE tipos_processo SET nome = ?, codigo = ?, ativo = ? WHERE id = ?',
      [nome, codigo || null, ativo !== undefined ? ativo : 1, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM tipos_processo WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const excluirTipo = async (req, res) => {
  try {
    await pool.query('UPDATE tipos_processo SET ativo = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Tipo desativado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

