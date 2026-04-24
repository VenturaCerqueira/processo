import pool from '../config/database.js';
import { gerarNumeroProcesso } from '../utils/helpers.js';

export const listarProcessos = async (req, res) => {
  try {
    const { status, tipo, setor, busca } = req.query;
    let sql = 'SELECT * FROM processos WHERE 1=1';
    const params = [];
    
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (tipo) { sql += ' AND tipo = ?'; params.push(tipo); }
    if (setor) { sql += ' AND setorAtual = ?'; params.push(setor); }
    if (busca) {
      sql += ' AND (numero LIKE ? OR requerente LIKE ? OR assunto LIKE ?)';
      const like = `%${busca}%`;
      params.push(like, like, like);
    }
    sql += ' ORDER BY createdAt DESC';
    
    const [processos] = await pool.query(sql, params);
    res.json(processos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const obterProcesso = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, e.nome as especie_nome, e.mensagem_customizada as especie_mensagem,
             e.prazo_minimo as especie_prazo_minimo, e.prazo_maximo as especie_prazo_maximo,
             e.dias_uteis as especie_dias_uteis
      FROM processos p
      LEFT JOIN especies_processo e ON p.especie_id = e.id
      WHERE p.id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Processo não encontrado.' });
    }
    const processo = rows[0];
    const [movimentacoes] = await pool.query(
      `SELECT m.*, u.nome as usuarioNome FROM movimentacoes m 
       LEFT JOIN users u ON m.usuario = u.id WHERE m.processoId = ? ORDER BY m.data DESC`,
      [req.params.id]
    );
    const [documentos] = await pool.query(
      `SELECT d.*, u.nome as usuarioNome FROM documentos d 
       LEFT JOIN users u ON d.usuario = u.id WHERE d.processoId = ? ORDER BY d.dataUpload DESC`,
      [req.params.id]
    );
    const [observacoes] = await pool.query(
      `SELECT o.*, u.nome as usuarioNome FROM observacoes o 
       LEFT JOIN users u ON o.usuario = u.id WHERE o.processoId = ? ORDER BY o.data DESC`,
      [req.params.id]
    );
    
    res.json({ ...processo, movimentacoes, documentos, observacoes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const criarProcesso = async (req, res) => {
  try {
    const { tipo, assunto, requerente, cpfCnpj, endereco, telefone, email, descricao, setorAtual, prioridade, prazo, especie_id } = req.body;
    const numero = gerarNumeroProcesso();
    const [result] = await pool.query(
      `INSERT INTO processos (numero, tipo, assunto, requerente, cpfCnpj, endereco, telefone, email, descricao, setorAtual, prioridade, prazo, especie_id, criadoPor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [numero, tipo, assunto, requerente, cpfCnpj || null, endereco || null, telefone || null, email || null, descricao || null, setorAtual, prioridade || 'normal', prazo || null, especie_id || null, req.user.id]
    );
    
    const [rows] = await pool.query('SELECT * FROM processos WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarProcesso = async (req, res) => {
  try {
    const campos = [];
    const valores = [];
    Object.keys(req.body).forEach(key => {
      campos.push(`${key} = ?`);
      valores.push(req.body[key]);
    });
    valores.push(req.params.id);
    
    await pool.query(`UPDATE processos SET ${campos.join(', ')} WHERE id = ?`, valores);
    const [rows] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const encaminharProcesso = async (req, res) => {
  try {
    const { para, parecer } = req.body;
    const [rows] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Processo não encontrado.' });
    }
    const processo = rows[0];
    await pool.query(
      'INSERT INTO movimentacoes (processoId, de, para, usuario, parecer) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, processo.setorAtual, para, req.user.id, parecer || null]
    );
    await pool.query('UPDATE processos SET setorAtual = ? WHERE id = ?', [para, req.params.id]);
    
    const [atualizado] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    res.json(atualizado[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adicionarObservacao = async (req, res) => {
  try {
    const { texto } = req.body;
    await pool.query(
      'INSERT INTO observacoes (processoId, texto, usuario) VALUES (?, ?, ?)',
      [req.params.id, texto, req.user.id]
    );
    const [rows] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const relatorioAndamento = async (req, res) => {
  try {
    const { dataInicio, dataFim, setor, tipo } = req.query;
    let sql = 'SELECT * FROM processos WHERE 1=1';
    const params = [];
    
    if (dataInicio) { sql += ' AND DATE(createdAt) >= ?'; params.push(dataInicio); }
    if (dataFim) { sql += ' AND DATE(createdAt) <= ?'; params.push(dataFim); }
    if (setor) { sql += ' AND setorAtual = ?'; params.push(setor); }
    if (tipo) { sql += ' AND tipo = ?'; params.push(tipo); }
    
    const [processos] = await pool.query(sql, params);
    const total = processos.length;
    const porStatus = {};
    const porSetor = {};
    const porTipo = {};
    processos.forEach(p => {
      porStatus[p.status] = (porStatus[p.status] || 0) + 1;
      porSetor[p.setorAtual] = (porSetor[p.setorAtual] || 0) + 1;
      porTipo[p.tipo] = (porTipo[p.tipo] || 0) + 1;
    });

    res.json({ total, porStatus, porSetor, porTipo, processos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

