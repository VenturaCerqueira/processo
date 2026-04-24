import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, nome, email, cargo, setor, nivelAcesso, ativo FROM users WHERE id = ?',
      [decoded.id]
    );
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado.' });
    }
    req.user = user;
    next();
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

