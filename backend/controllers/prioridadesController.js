import pool from '../config/database.js';

export const listarPrioridades = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM prioridades WHERE ativo = 1 ORDER BY nivel');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const obterPrioridade = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM prioridades WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Prioridade nao encontrada.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const criarPrioridade = async (req, res) => {
  try {
    const { nome, nivel, cor } = req.body;
    const [result] = await pool.query(
      'INSERT INTO prioridades (nome, nivel, cor) VALUES (?, ?, ?)',
      [nome, nivel || 0, cor || null]
    );
    const [rows] = await pool.query('SELECT * FROM prioridades WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarPrioridade = async (req, res) => {
  try {
    const { nome, nivel, cor, ativo } = req.body;
    await pool.query(
      'UPDATE prioridades SET nome = ?, nivel = ?, cor = ?, ativo = ? WHERE id = ?',
      [nome, nivel || 0, cor || null, ativo !== undefined ? ativo : 1, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM prioridades WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const excluirPrioridade = async (req, res) => {
  try {
    await pool.query('UPDATE prioridades SET ativo = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Prioridade desativada com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

