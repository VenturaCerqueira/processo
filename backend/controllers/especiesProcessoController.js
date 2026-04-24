import pool from '../config/database.js';

export const listarEspecies = async (req, res) => {
  try {
    const { tipo, setor } = req.query;
    let sql = `
      SELECT e.*, tp.nome as tipo_processo_nome, s.nome as setor_nome
      FROM especies_processo e
      LEFT JOIN tipos_processo tp ON e.tipo_processo_id = tp.id
      LEFT JOIN setores s ON e.setor_id = s.id
      WHERE e.ativo = 1
    `;
    const params = [];

    if (tipo) {
      sql += ' AND e.tipo_processo_id = ?';
      params.push(tipo);
    }
    if (setor) {
      sql += ' AND e.setor_id = ?';
      params.push(setor);
    }
    sql += ' ORDER BY e.nome';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const obterEspecie = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, tp.nome as tipo_processo_nome, s.nome as setor_nome
      FROM especies_processo e
      LEFT JOIN tipos_processo tp ON e.tipo_processo_id = tp.id
      LEFT JOIN setores s ON e.setor_id = s.id
      WHERE e.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Especie nao encontrada.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const criarEspecie = async (req, res) => {
  try {
    const {
      nome,
      tipo_processo_id,
      setor_id,
      prazo_minimo,
      prazo_maximo,
      dias_uteis,
      mensagem_customizada
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO especies_processo
       (nome, tipo_processo_id, setor_id, prazo_minimo, prazo_maximo, dias_uteis, mensagem_customizada)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nome,
        tipo_processo_id || null,
        setor_id || null,
        prazo_minimo || null,
        prazo_maximo || null,
        dias_uteis ? 1 : 0,
        mensagem_customizada || null
      ]
    );

    const [rows] = await pool.query(`
      SELECT e.*, tp.nome as tipo_processo_nome, s.nome as setor_nome
      FROM especies_processo e
      LEFT JOIN tipos_processo tp ON e.tipo_processo_id = tp.id
      LEFT JOIN setores s ON e.setor_id = s.id
      WHERE e.id = ?
    `, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarEspecie = async (req, res) => {
  try {
    const {
      nome,
      tipo_processo_id,
      setor_id,
      prazo_minimo,
      prazo_maximo,
      dias_uteis,
      mensagem_customizada,
      ativo
    } = req.body;

    await pool.query(
      `UPDATE especies_processo SET
       nome = ?,
       tipo_processo_id = ?,
       setor_id = ?,
       prazo_minimo = ?,
       prazo_maximo = ?,
       dias_uteis = ?,
       mensagem_customizada = ?,
       ativo = ?
       WHERE id = ?`,
      [
        nome,
        tipo_processo_id || null,
        setor_id || null,
        prazo_minimo || null,
        prazo_maximo || null,
        dias_uteis !== undefined ? (dias_uteis ? 1 : 0) : 0,
        mensagem_customizada || null,
        ativo !== undefined ? ativo : 1,
        req.params.id
      ]
    );

    const [rows] = await pool.query(`
      SELECT e.*, tp.nome as tipo_processo_nome, s.nome as setor_nome
      FROM especies_processo e
      LEFT JOIN tipos_processo tp ON e.tipo_processo_id = tp.id
      LEFT JOIN setores s ON e.setor_id = s.id
      WHERE e.id = ?
    `, [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const excluirEspecie = async (req, res) => {
  try {
    await pool.query('UPDATE especies_processo SET ativo = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Especie desativada com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

