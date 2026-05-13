import pool from '../config/database.js';

// Retorna todos os protocolos (integracoes.protocolo) dos processos vinculados ao requerente.
// Critério: processos.cpfCnpj = requerentes.cpfCnpj
export const listarProtocolosPorRequerente = async (req, res) => {
  try {
    const { requerenteId } = req.params;

    const [reqRows] = await pool.query(
      `SELECT id, nome, cpfCnpj
       FROM requerentes
       WHERE id = ? AND ativo = 1`,
      [requerenteId]
    );

    if (!reqRows || reqRows.length === 0) {
      return res.status(404).json({ message: 'Requerente não encontrado.' });
    }

    const requerente = reqRows[0];
    if (!requerente.cpfCnpj) {
      return res.json([]);
    }

    const [rows] = await pool.query(
      `SELECT i.id, i.processoId, i.sistema, i.protocolo, i.data
       FROM processos p
       INNER JOIN integracoes i ON i.processoId = p.id
       WHERE p.cpfCnpj = ?
         AND i.protocolo IS NOT NULL
       ORDER BY i.data DESC, i.id DESC`,
      [requerente.cpfCnpj]
    );

    // Mantém como lista simples para consumo na view
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

