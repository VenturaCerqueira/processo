import express from 'express';
import pool from '../config/database.js';
import logger from '../config/logger.js';

const router = express.Router();

// GET /api/logs - Listar logs com filtros
router.get('/', async (req, res) => {
  try {
    const {
      level,
      limit = 100,
      offset = 0,
      startDate,
      endDate,
      search
    } = req.query;

    let query = 'SELECT * FROM logs WHERE 1=1';
    const params = [];

    if (level) {
      query += ' AND level = ?';
      params.push(level);
    }

    if (startDate) {
      query += ' AND timestamp >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND timestamp <= ?';
      params.push(endDate);
    }

    if (search) {
      query += ' AND message LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);

    // Obter total de registros
    let countQuery = 'SELECT COUNT(*) as total FROM logs WHERE 1=1';
    const countParams = [];

    if (level) {
      countQuery += ' AND level = ?';
      countParams.push(level);
    }

    if (startDate) {
      countQuery += ' AND timestamp >= ?';
      countParams.push(startDate);
    }

    if (endDate) {
      countQuery += ' AND timestamp <= ?';
      countParams.push(endDate);
    }

    if (search) {
      countQuery += ' AND message LIKE ?';
      countParams.push(`%${search}%`);
    }

    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.json({
      logs: rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + rows.length < total
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar logs', { error: error.message });
    res.status(500).json({ message: 'Erro ao buscar logs' });
  }
});

// GET /api/logs/stats - Estatísticas de logs
router.get('/stats', async (req, res) => {
  try {
    const [byLevel] = await pool.query(`
      SELECT level, COUNT(*) as count
      FROM logs
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY level
    `);

    const [byDay] = await pool.query(`
      SELECT DATE(timestamp) as date, COUNT(*) as count
      FROM logs
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `);

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM logs WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
    );

    res.json({
      total,
      byLevel,
      byDay
    });
  } catch (error) {
    logger.error('Erro ao buscar estatísticas de logs', { error: error.message });
    res.status(500).json({ message: 'Erro ao buscar estatísticas' });
  }
});

// DELETE /api/logs - Limpar logs antigos (manutenção)
router.delete('/', async (req, res) => {
  try {
    const { daysToKeep = 30 } = req.query;

    const [result] = await pool.query(
      'DELETE FROM logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [parseInt(daysToKeep)]
    );

    logger.info(`Logs limpos: ${result.affectedRows} registros removidos`);
    res.json({ message: `${result.affectedRows} logs removidos` });
  } catch (error) {
    logger.error('Erro ao limpar logs', { error: error.message });
    res.status(500).json({ message: 'Erro ao limpar logs' });
  }
});

export default router;