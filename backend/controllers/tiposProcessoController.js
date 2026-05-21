import pool from '../config/database.js';

export const listarTipos = async (req, res) => {
  try {
    const incluiInativos = req.query?.incluiInativos === '1';
    const sql = incluiInativos
      ? 'SELECT * FROM tipos_processo ORDER BY nome'
      : 'SELECT * FROM tipos_processo WHERE ativo = 1 ORDER BY nome';
    const [rows] = await pool.query(sql);
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
    const { nome, codigo, icone_svg } = req.body;
    const [result] = await pool.query(
      'INSERT INTO tipos_processo (nome, codigo, icone_svg) VALUES (?, ?, ?)',
      [nome, codigo || null, icone_svg || null]
    );

    const [rows] = await pool.query('SELECT * FROM tipos_processo WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarTipo = async (req, res) => {
  try {
    const { nome, codigo, icone_svg, ativo } = req.body;
    await pool.query(
      'UPDATE tipos_processo SET nome = ?, codigo = ?, icone_svg = ?, ativo = ? WHERE id = ?',
      [nome, codigo || null, icone_svg || null, ativo !== undefined ? ativo : 1, req.params.id]
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

