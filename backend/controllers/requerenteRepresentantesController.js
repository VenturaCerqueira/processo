import pool from '../config/database.js';

export const listarRepresentantesPorRequerente = async (req, res) => {
  try {
    const { requerenteId } = req.params;

    const [rows] = await pool.query(
      `SELECT id, requerenteId, nome, cpfCnpj, telefone, email, ativo, createdAt, updatedAt
       FROM requerente_representantes
       WHERE requerenteId = ? AND ativo = 1
       ORDER BY createdAt ASC`,
      [requerenteId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const salvarRepresentantesPorRequerente = async (req, res) => {
  try {
    const { requerenteId } = req.params;
    const { representantes } = req.body;

    const list = Array.isArray(representantes) ? representantes : [];

    // Regras simples: apagar e inserir novamente (bulk)
    await pool.query(
      `UPDATE requerente_representantes
       SET ativo = 0
       WHERE requerenteId = ?`,
      [requerenteId]
    );

    if (list.length === 0) {
      return res.json({ message: 'Representantes removidos com sucesso.', count: 0 });
    }

    const inserts = list.map((r) => [
      requerenteId,
      r.nome,
      r.cpfCnpj || null,
      r.telefone || null,
      r.email || null
    ]);

    // nome é obrigatório
    const invalid = inserts.find((i) => !i[1] || String(i[1]).trim().length === 0);
    if (invalid) {
      return res.status(400).json({ message: 'Representante inválido: campo nome é obrigatório.' });
    }

    await pool.query(
      `INSERT INTO requerente_representantes (requerenteId, nome, cpfCnpj, telefone, email, ativo)
       VALUES ?`,
      [inserts.map((i) => [i[0], i[1], i[2], i[3], i[4], 1])]
    );

    const [rows] = await pool.query(
      `SELECT id, requerenteId, nome, cpfCnpj, telefone, email, ativo, createdAt, updatedAt
       FROM requerente_representantes
       WHERE requerenteId = ? AND ativo = 1
       ORDER BY createdAt ASC`,
      [requerenteId]
    );

    res.json({ message: 'Representantes salvos com sucesso.', representantes: rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
