import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

export const hashSenha = async (senha) => {
  return await bcrypt.hash(senha, 10);
};

export const compararSenha = async (senha, hash) => {
  return await bcrypt.compare(senha, hash);
};

/**
 * Gera número de processo único usando sequência do banco
 * Formato: AAAA.NNNNNNN (Ano + Sequencial de 7 dígitos)
 * Garante unicidade mesmo em ambiente concorrente através de LOCK TABLES
 */
export const gerarNumeroProcesso = async () => {
  const ano = new Date().getFullYear();
  const prefixo = `${ano}.`;

  const connection = await pool.getConnection();
  try {
    // Bloquear tabela para evitar race condition
    await connection.query('LOCK TABLES procesos_sequencial WRITE');

    // Obter próxima sequência para o ano atual
    const [rows] = await connection.query(
      'SELECT sequencial FROM procesos_sequencial WHERE ano = ? FOR UPDATE',
      [ano]
    );

    let proximoSequencial;
    if (rows.length === 0) {
      // Inserir novo registro para o ano
      await connection.query(
        'INSERT INTO procesos_sequencial (ano, sequencial) VALUES (?, 1)',
        [ano]
      );
      proximoSequencial = 1;
    } else {
      proximoSequencial = rows[0].sequencial + 1;
      await connection.query(
        'UPDATE procesos_sequencial SET sequencial = ? WHERE ano = ?',
        [proximoSequencial, ano]
      );
    }

    await connection.query('UNLOCK TABLES');

    return `${prefixo}${proximoSequencial.toString().padStart(7, '0')}`;
  } catch (error) {
    await connection.query('UNLOCK TABLES');
    throw error;
  } finally {
    connection.release();
  }
};

