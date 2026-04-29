import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check users (staff)
    let [rows] = await pool.query(
      'SELECT id, nome, email, cargo, setor, nivelAcesso, ativo FROM users WHERE id = ? AND ativo = 1',
      [decoded.id]
    );
    if (rows.length > 0) {
      req.user = { ...rows[0], tipo: 'staff' };
      return next();
    }
    // Check requerentes
    [rows] = await pool.query(
      'SELECT id, nome, email, nivelAcesso, ativo FROM requerentes WHERE id = ? AND ativo = 1',
      [decoded.id]
    );
    if (rows.length > 0) {
      req.user = { ...rows[0], tipo: 'requerente' };
      return next();
    }
    return res.status(401).json({ message: 'Usuário não encontrado ou inativo.' });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido.' });
  }
};


export const adminOnly = (req, res, next) => {
  if (req.user.nivelAcesso !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores.' });
  }
  next();
};

