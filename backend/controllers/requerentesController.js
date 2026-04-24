import pool from '../config/database.js';

export const listarRequerentes = async (req, res) => {
  try {
    const { busca } = req.query;
    let sql = 'SELECT * FROM requerentes WHERE ativo = 1';
    const params = [];
    if (busca) {
      sql += ' AND (nome LIKE ? OR cpfCnpj LIKE ?)';
      const like = `%${busca}%`;
      params.push(like, like);
    }
    sql += ' ORDER BY nome';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const obterRequerente = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM requerentes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Requerente nao encontrado.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const criarRequerente = async (req, res) => {
  try {
    const { nome, cpfCnpj, tipoPessoa, endereco, numero, complemento, bairro, cidade, estado, cep, telefone, email } = req.body;
    const [result] = await pool.query(
      `INSERT INTO requerentes (nome, cpfCnpj, tipoPessoa, endereco, numero, complemento, bairro, cidade, estado, cep, telefone, email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, cpfCnpj || null, tipoPessoa || 'fisica', endereco || null, numero || null, complemento || null, bairro || null, cidade || null, estado || null, cep || null, telefone || null, email || null]
    );
    const [rows] = await pool.query('SELECT * FROM requerentes WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarRequerente = async (req, res) => {
  try {
    const { nome, cpfCnpj, tipoPessoa, endereco, numero, complemento, bairro, cidade, estado, cep, telefone, email, ativo } = req.body;
    await pool.query(
      `UPDATE requerentes SET nome = ?, cpfCnpj = ?, tipoPessoa = ?, endereco = ?, numero = ?, complemento = ?, bairro = ?, cidade = ?, estado = ?, cep = ?, telefone = ?, email = ?, ativo = ? WHERE id = ?`,
      [nome, cpfCnpj || null, tipoPessoa || 'fisica', endereco || null, numero || null, complemento || null, bairro || null, cidade || null, estado || null, cep || null, telefone || null, email || null, ativo !== undefined ? ativo : 1, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM requerentes WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const excluirRequerente = async (req, res) => {
  try {
    await pool.query('UPDATE requerentes SET ativo = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Requerente desativado com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

