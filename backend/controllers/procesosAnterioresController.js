import pool from "../config/database.js";

export const listarProcessosAnteriores = async (req, res) => {
  try {
    const { status, tipo, busca } = req.query;
    let sql = `
      SELECT p.*, u.nome as usuarioResponsavelNome, tp.icone_svg as tipo_icone_svg
      FROM processos p
      LEFT JOIN users u ON p.usuarioResponsavel = u.id
      LEFT JOIN tipos_processo tp ON p.tipo = tp.nome
      WHERE p.situacao IN ('arquivado', 'indeferido', 'aprovado', 'concluido')
    `;
    const params = [];

    if (status) {
      sql += " AND p.situacao = ?";
      params.push(status);
    }
    if (tipo) {
      sql += " AND p.tipo = ?";
      params.push(tipo);
    }
    if (busca) {
      sql += " AND (p.numero LIKE ? OR p.requerente LIKE ? OR p.assunto LIKE ?)";
      const like = `%${busca}%`;
      params.push(like, like, like);
    }

    sql += " ORDER BY p.updatedAt DESC";

    const [processos] = await pool.query(sql, params);
    res.json(processos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};