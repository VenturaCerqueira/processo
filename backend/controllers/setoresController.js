import pool from '../config/database.js';

export const listarSetores = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        s.id,
        s.nome,
        s.sigla,
        s.ativo,
        s.administradorUserId,
        u.nome AS administradorNome,
        s.createdAt,
        s.updatedAt
      FROM setores s
      LEFT JOIN users u ON u.id = s.administradorUserId
      WHERE s.ativo = 1
      ORDER BY s.nome
      `
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const obterSetor = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        s.id,
        s.nome,
        s.sigla,
        s.ativo,
        s.administradorUserId,
        u.nome AS administradorNome,
        s.createdAt,
        s.updatedAt
      FROM setores s
      LEFT JOIN users u ON u.id = s.administradorUserId
      WHERE s.id = ?
      `,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Setor nao encontrado.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const criarSetor = async (req, res) => {
  try {
    const { nome, sigla, administradorUserId } = req.body;

    const [result] = await pool.query(
      'INSERT INTO setores (nome, sigla, administradorUserId) VALUES (?, ?, ?)',
      [nome, sigla || null, administradorUserId || null]
    );

    const [rows] = await pool.query(
      'SELECT id, nome, sigla, ativo, administradorUserId, createdAt, updatedAt FROM setores WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const atualizarSetor = async (req, res) => {
  try {
    const { nome, sigla, ativo, administradorUserId } = req.body;

    await pool.query(
      'UPDATE setores SET nome = ?, sigla = ?, ativo = ?, administradorUserId = ? WHERE id = ?',
      [nome, sigla || null, ativo !== undefined ? ativo : 1, administradorUserId || null, req.params.id]
    );

    const [rows] = await pool.query(
      'SELECT id, nome, sigla, ativo, administradorUserId, createdAt, updatedAt FROM setores WHERE id = ?',
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const excluirSetor = async (req, res) => {
  try {
    await pool.query('UPDATE setores SET ativo = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Setor desativado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

