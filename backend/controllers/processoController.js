import pool from '../config/database.js';
import { gerarNumeroProcesso } from '../utils/helpers.js';
import { criarNotificacao } from './notificacaoController.js';
import { registrarHistorico } from '../utils/historico.js';

export const listarProcessos = async (req, res) => {
  try {
    const { status, tipo, setor, busca, situacao, usuarioResponsavel } = req.query;
    let sql = 'SELECT p.*, u.nome as usuarioResponsavelNome FROM processos p LEFT JOIN users u ON p.usuarioResponsavel = u.id WHERE 1=1';
    const params = [];
    
    if (status) { sql += ' AND p.status = ?'; params.push(status); }
    if (situacao) { sql += ' AND p.situacao = ?'; params.push(situacao); }
    if (tipo) { sql += ' AND p.tipo = ?'; params.push(tipo); }
    if (setor) { sql += ' AND p.setorAtual = ?'; params.push(setor); }
    if (usuarioResponsavel) { sql += ' AND p.usuarioResponsavel = ?'; params.push(usuarioResponsavel); }
    if (busca) {
      sql += ' AND (p.numero LIKE ? OR p.requerente LIKE ? OR p.assunto LIKE ?)';
      const like = `%${busca}%`;
      params.push(like, like, like);
    }
    sql += ' ORDER BY p.createdAt DESC';
    
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
             e.dias_uteis as especie_dias_uteis, u.nome as usuarioResponsavelNome
      FROM processos p
      LEFT JOIN especies_processo e ON p.especie_id = e.id
      LEFT JOIN users u ON p.usuarioResponsavel = u.id
      WHERE p.id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Processo não encontrado.' });
    }
    const processo = rows[0];
    const [movimentacoes] = await pool.query(
      `SELECT m.*, u.nome as usuarioNome, ud.nome as usuarioDestinoNome 
       FROM movimentacoes m 
       LEFT JOIN users u ON m.usuario = u.id 
       LEFT JOIN users ud ON m.usuarioDestino = ud.id 
       WHERE m.processoId = ? ORDER BY m.data DESC`,
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
    const [filhos] = await pool.query(
      `SELECT id, numero, tipo, assunto, status, situacao, createdAt FROM processos WHERE processoPaiId = ? ORDER BY createdAt DESC`,
      [req.params.id]
    );
    const [historico] = await pool.query(
      `SELECT h.*, u.nome as usuarioNome FROM historico h 
       LEFT JOIN users u ON h.usuario = u.id WHERE h.processoId = ? ORDER BY h.data DESC`,
      [req.params.id]
    );
    
    res.json({ ...processo, movimentacoes, documentos, observacoes, filhos, historico });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const criarProcesso = async (req, res) => {
  try {
    const { tipo, assunto, requerente, cpfCnpj, endereco, telefone, email, descricao, setorAtual, prioridade, prazo, especie_id, usuarioResponsavel } = req.body;
    const numero = gerarNumeroProcesso();
    const [result] = await pool.query(
      `INSERT INTO processos (numero, tipo, assunto, requerente, cpfCnpj, endereco, telefone, email, descricao, setorAtual, usuarioResponsavel, prioridade, prazo, especie_id, situacao, criadoPor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [numero, tipo, assunto, requerente, cpfCnpj || null, endereco || null, telefone || null, email || null, descricao || null, setorAtual, usuarioResponsavel || null, prioridade || 'normal', prazo || null, especie_id || null, 'novo', req.user.id]
    );
    
    if (usuarioResponsavel) {
      await criarNotificacao(
        usuarioResponsavel,
        result.insertId,
        'Novo processo na Caixa de Entrada',
        `O processo ${numero} foi criado e atribuído a você no setor ${setorAtual}.`,
        'info',
        prioridade || 'normal'
      );
    }
    
    await registrarHistorico(result.insertId, 'criacao', `Processo ${numero} criado no setor ${setorAtual}.`, req.user.id, { tipo, assunto, requerente, setorAtual });
    
    const [rows] = await pool.query('SELECT * FROM processos WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarProcesso = async (req, res) => {
  try {
    const [anterior] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    if (anterior.length === 0) {
      return res.status(404).json({ message: 'Processo não encontrado.' });
    }
    const processoAntes = anterior[0];

    const campos = [];
    const valores = [];
    const alteracoes = [];
    Object.keys(req.body).forEach(key => {
      if (key === 'status') return;
      campos.push(`${key} = ?`);
      valores.push(req.body[key]);
      if (processoAntes[key] !== req.body[key]) {
        alteracoes.push(`${key}: ${processoAntes[key] || '—'} → ${req.body[key] || '—'}`);
      }
    });
    if (campos.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo válido para atualizar.' });
    }
    valores.push(req.params.id);
    
    await pool.query(`UPDATE processos SET ${campos.join(', ')} WHERE id = ?`, valores);
    if (alteracoes.length > 0) {
      await registrarHistorico(req.params.id, 'edicao', `Campos alterados: ${alteracoes.join('; ')}`, req.user.id, { alteracoes });
    }
    const [rows] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const encaminharProcesso = async (req, res) => {
  try {
    const { para, parecer, paraUsuario } = req.body;
    const [rows] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Processo não encontrado.' });
    }
    const processo = rows[0];
    if (processo.situacao === 'encaminhado') {
      return res.status(400).json({ message: 'Processo já encaminhado. Aguarde o recebimento para reencaminhar.' });
    }
    if (paraUsuario && parseInt(paraUsuario) === req.user.id) {
      return res.status(400).json({ message: 'Você não pode encaminhar um processo para si mesmo.' });
    }
    await pool.query(
      'INSERT INTO movimentacoes (processoId, de, para, usuarioDestino, usuario, parecer) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, processo.setorAtual, para, paraUsuario || null, req.user.id, parecer || null]
    );
    await pool.query(
      'UPDATE processos SET setorAtual = ?, usuarioResponsavel = ?, situacao = ? WHERE id = ?',
      [para, paraUsuario || null, 'encaminhado', req.params.id]
    );
    
    if (paraUsuario) {
      await criarNotificacao(
        paraUsuario,
        req.params.id,
        'Processo encaminhado para você',
        `O processo ${processo.numero} foi encaminhado para o setor ${para} com você como responsável.`,
        'info',
        processo.prioridade || 'normal'
      );
    }
    
    await registrarHistorico(req.params.id, 'encaminhamento', `Processo encaminhado de ${processo.setorAtual} para ${para}.`, req.user.id, { de: processo.setorAtual, para, parecer, paraUsuario });
    
    const [atualizado] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    res.json(atualizado[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const receberProcesso = async (req, res) => {
  try {
    await pool.query('UPDATE processos SET situacao = ?, status = ? WHERE id = ?', ['recebido', 'tramitando', req.params.id]);
    await registrarHistorico(req.params.id, 'recebimento', 'Processo recebido.', req.user.id);
    const [rows] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const voltarProcesso = async (req, res) => {
  try {
    const { observacao } = req.body;
    const [rows] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Processo não encontrado.' });
    }
    const processo = rows[0];
    if (processo.situacao !== 'encaminhado') {
      return res.status(400).json({ message: 'O processo não está em situação de encaminhado.' });
    }

    // Buscar a última movimentação para saber de onde veio
    const [movimentacoes] = await pool.query(
      'SELECT * FROM movimentacoes WHERE processoId = ? ORDER BY data DESC LIMIT 1',
      [req.params.id]
    );
    if (movimentacoes.length === 0) {
      return res.status(400).json({ message: 'Nenhuma movimentação encontrada para este processo.' });
    }
    const ultimaMov = movimentacoes[0];

    const parecer = observacao ? `Processo devolvido: ${observacao}` : 'Processo devolvido ao remetente';

    // Inserir movimentação de retorno
    await pool.query(
      'INSERT INTO movimentacoes (processoId, de, para, usuarioDestino, usuario, parecer) VALUES (?, ?, ?, ?, ?, ?)',
      [req.params.id, processo.setorAtual, ultimaMov.de, ultimaMov.usuario, req.user.id, parecer]
    );

    // Atualizar processo: voltar para o setor e usuário de origem com situacao retornado
    await pool.query(
      'UPDATE processos SET setorAtual = ?, usuarioResponsavel = ?, situacao = ? WHERE id = ?',
      [ultimaMov.de, ultimaMov.usuario, 'retornado', req.params.id]
    );

    // Registrar observacao do retorno
    if (observacao) {
      await pool.query(
        'INSERT INTO observacoes (processoId, texto, usuario) VALUES (?, ?, ?)',
        [req.params.id, observacao, req.user.id]
      );
    }

    // Notificar o usuário de origem
    if (ultimaMov.usuario) {
      await criarNotificacao(
        ultimaMov.usuario,
        req.params.id,
        'Processo devolvido',
        `O processo ${processo.numero} foi devolvido para o setor ${ultimaMov.de}.`,
        'warning',
        processo.prioridade || 'normal'
      );
    }

    await registrarHistorico(req.params.id, 'retorno', `Processo devolvido de ${processo.setorAtual} para ${ultimaMov.de}.`, req.user.id, { de: processo.setorAtual, para: ultimaMov.de, observacao });

    const [atualizado] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    res.json(atualizado[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const aprovarProcesso = async (req, res) => {
  try {
    await pool.query('UPDATE processos SET situacao = ? WHERE id = ?', ['aprovado', req.params.id]);
    await registrarHistorico(req.params.id, 'aprovacao', 'Processo aprovado.', req.user.id);
    const [rows] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const pausarProcesso = async (req, res) => {
  try {
    await pool.query('UPDATE processos SET situacao = ?, status = ? WHERE id = ?', ['pausado', 'aguardando', req.params.id]);
    await registrarHistorico(req.params.id, 'pausa', 'Processo pausado.', req.user.id);
    const [rows] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const arquivarProcesso = async (req, res) => {
  try {
    await pool.query('UPDATE processos SET situacao = ?, status = ? WHERE id = ?', ['arquivado', 'arquivado', req.params.id]);
    await registrarHistorico(req.params.id, 'arquivamento', 'Processo arquivado.', req.user.id);
    const [rows] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const indeferirProcesso = async (req, res) => {
  try {
    await pool.query('UPDATE processos SET situacao = ?, status = ? WHERE id = ?', ['indeferido', 'indeferido', req.params.id]);
    await registrarHistorico(req.params.id, 'indeferimento', 'Processo indeferido.', req.user.id);
    const [rows] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listarCaixaEntrada = async (req, res) => {
  try {
    const { situacao } = req.query;
    const usuarioId = req.user.id;
    let sql = 'SELECT p.*, u.nome as usuarioResponsavelNome, CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as favorito FROM processos p LEFT JOIN users u ON p.usuarioResponsavel = u.id LEFT JOIN favoritos f ON f.processoId = p.id AND f.usuarioId = ? WHERE p.usuarioResponsavel = ?';
    const params = [usuarioId, usuarioId];
    
    if (situacao) {
      sql += ' AND p.situacao = ?';
      params.push(situacao);
    } else {
      sql += " AND p.situacao IN ('encaminhado', 'recebido', 'aprovado', 'pausado', 'arquivado', 'indeferido', 'retornado')";
    }
    sql += ' ORDER BY favorito DESC, p.prioridade DESC, p.createdAt DESC';
    
    const [processos] = await pool.query(sql, params);
    
    const contagemSql = 'SELECT situacao, COUNT(*) as total FROM processos WHERE usuarioResponsavel = ? GROUP BY situacao';
    const [contagem] = await pool.query(contagemSql, [usuarioId]);
    const contagemPorSituacao = {};
    contagem.forEach(c => { contagemPorSituacao[c.situacao] = c.total; });
    
    res.json({ processos, contagem: contagemPorSituacao });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const favoritarProcesso = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const processoId = req.params.id;
    
    const [existing] = await pool.query(
      'SELECT id FROM favoritos WHERE usuarioId = ? AND processoId = ?',
      [usuarioId, processoId]
    );
    
    if (existing.length > 0) {
      await pool.query(
        'DELETE FROM favoritos WHERE usuarioId = ? AND processoId = ?',
        [usuarioId, processoId]
      );
      res.json({ favorito: false });
    } else {
      await pool.query(
        'INSERT INTO favoritos (usuarioId, processoId) VALUES (?, ?)',
        [usuarioId, processoId]
      );
      res.json({ favorito: true });
    }
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
    await registrarHistorico(req.params.id, 'observacao', `Observação adicionada: ${texto}`, req.user.id);
    const [rows] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const criarProcessoFilho = async (req, res) => {
  try {
    const processoPaiId = req.params.id;
    const [paiRows] = await pool.query('SELECT * FROM processos WHERE id = ?', [processoPaiId]);
    if (paiRows.length === 0) {
      return res.status(404).json({ message: 'Processo pai não encontrado.' });
    }
    const pai = paiRows[0];

    const { tipo, assunto, descricao, setorAtual, prioridade, prazo, especie_id, usuarioResponsavel } = req.body;
    const numero = gerarNumeroProcesso();

    const [result] = await pool.query(
      `INSERT INTO processos (numero, tipo, assunto, requerente, cpfCnpj, endereco, telefone, email, descricao, setorAtual, usuarioResponsavel, prioridade, prazo, especie_id, situacao, criadoPor, processoPaiId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [numero, tipo, assunto, pai.requerente, pai.cpfCnpj || null, pai.endereco || null, pai.telefone || null, pai.email || null, descricao || null, setorAtual, usuarioResponsavel || null, prioridade || 'normal', prazo || null, especie_id || null, 'novo', req.user.id, processoPaiId]
    );

    if (usuarioResponsavel) {
      await criarNotificacao(
        usuarioResponsavel,
        result.insertId,
        'Novo processo filho na Caixa de Entrada',
        `O processo filho ${numero} foi criado a partir do processo ${pai.numero} e atribuído a você no setor ${setorAtual}.`,
        'info',
        prioridade || 'normal'
      );
    }

    await registrarHistorico(processoPaiId, 'filho', `Processo filho ${numero} criado.`, req.user.id, { filhoId: result.insertId, numero, tipo, assunto, setorAtual });

    const [rows] = await pool.query('SELECT * FROM processos WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
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

