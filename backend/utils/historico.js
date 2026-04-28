import pool from '../config/database.js';

export async function registrarHistorico(processoId, tipo, descricao, usuario, metadata = null) {
  try {
    await pool.query(
      'INSERT INTO historico (processoId, tipo, descricao, usuario, metadata) VALUES (?, ?, ?, ?, ?)',
      [processoId, tipo, descricao, usuario, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (error) {
    console.error('Erro ao registrar histórico:', error.message);
  }
}

export async function listarHistorico(processoId) {
  const [rows] = await pool.query(
    `SELECT h.*, u.nome as usuarioNome 
     FROM historico h 
     LEFT JOIN users u ON h.usuario = u.id 
     WHERE h.processoId = ? ORDER BY h.data DESC`,
    [processoId]
  );
  return rows;
}

