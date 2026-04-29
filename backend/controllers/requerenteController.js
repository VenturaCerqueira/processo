import pool from '../config/database.js';

export const listarProcessosRequerente = async (req, res) => {
  try {
    const requerenteId = req.user.id;
    const { busca } = req.query;
    const [requerente] = await pool.query('SELECT nome, email FROM requerentes WHERE id = ?', [requerenteId]);
    if (requerente.length === 0) return res.status(404).json({ message: 'Requerente não encontrado.' });
    const nome = requerente[0].nome;
    const emailReq = requerente[0].email;
let sql = `
      SELECT p.*, 
             CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as favorito
      FROM processos p 
      LEFT JOIN favoritos f ON f.processoId = p.id AND f.usuarioId = ?
      WHERE p.requerente = ? AND p.email = ? OR p.email = ?
        AND p.situacao != 'excluido'
    `;
    const params = [requerenteId, nome, emailReq, emailReq];
    if (busca) {
      sql += ' AND (p.numero LIKE ? OR p.assunto LIKE ?)';
      params.push(`%${busca}%`, `%${busca}%`);
    }
    sql += ' ORDER BY p.createdAt DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const obterProcessoRequerente = async (req, res) => {
  try {
    const requerenteId = req.user.id;
    const processoId = req.params.id;
    // First check if belongs to requerente
    const [ownCheck] = await pool.query(
      'SELECT id FROM processos WHERE id = ? AND (LOWER(requerente) LIKE LOWER((SELECT nome FROM requerentes WHERE id = ?)) OR email = (SELECT email FROM requerentes WHERE id = ?))',
      [processoId, requerenteId, requerenteId]
    );
    if (ownCheck.length === 0) {
      return res.status(403).json({ message: 'Processo não encontrado ou acesso negado.' });
    }
    // Reuse processoController obterProcesso logic (copy or import)
    const [rows] = await pool.query(`
      SELECT p.*, e.nome as especie_nome
      FROM processos p
      LEFT JOIN especies_processo e ON p.especie_id = e.id
      WHERE p.id = ?
    `, [processoId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Processo não encontrado.' });
    // Get movimentacoes, documentos etc. (same as processoController)
    const [movimentacoes] = await pool.query('SELECT * FROM movimentacoes WHERE processoId = ? ORDER BY data DESC', [processoId]);
    const [documentos] = await pool.query('SELECT * FROM documentos WHERE processoId = ? ORDER BY dataUpload DESC', [processoId]);
    const [observacoes] = await pool.query('SELECT * FROM observacoes WHERE processoId = ? ORDER BY data DESC', [processoId]);
    res.json({ ...rows[0], movimentacoes, documentos, observacoes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listarNotificacoesRequerente = async (req, res) => {
  try {
    // TODO: Create notificacoes_requerentes table or repurpose
    // For now, empty or adapt from processos updates
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

