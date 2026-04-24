import pool from '../config/database.js';

export const listarNotificacoes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT n.*, p.numero as processoNumero 
       FROM notificacoes n 
       LEFT JOIN processos p ON n.processoId = p.id 
       WHERE n.usuarioId = ? 
       ORDER BY n.data DESC 
       LIMIT 50`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listarNaoLidas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT n.*, p.numero as processoNumero 
       FROM notificacoes n 
       LEFT JOIN processos p ON n.processoId = p.id 
       WHERE n.usuarioId = ? AND n.lida = 0 
       ORDER BY n.data DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const marcarComoLida = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notificacoes SET lida = 1 WHERE id = ? AND usuarioId = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Notificação marcada como lida.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const marcarTodasComoLidas = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notificacoes SET lida = 1 WHERE usuarioId = ? AND lida = 0',
      [req.user.id]
    );
    res.json({ message: 'Todas as notificações marcadas como lidas.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const criarNotificacao = async (usuarioId, processoId, titulo, mensagem, tipo = 'info', prioridade = 'normal') => {
  try {
    await pool.query(
      'INSERT INTO notificacoes (usuarioId, processoId, titulo, mensagem, tipo, prioridade) VALUES (?, ?, ?, ?, ?, ?)',
      [usuarioId, processoId, titulo, mensagem, tipo, prioridade]
    );
  } catch (error) {
    console.error('Erro ao criar notificação:', error.message);
  }
};
