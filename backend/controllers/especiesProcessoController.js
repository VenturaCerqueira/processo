import pool from '../config/database.js';

export const listarEspecies = async (req, res) => {
  try {
    const { tipo, setor, ativos } = req.query;
    let sql = `
      SELECT e.*, tp.nome as tipo_processo_nome, s.nome as setor_nome
      FROM especies_processo e
      LEFT JOIN tipos_processo tp ON e.tipo_processo_id = tp.id
      LEFT JOIN setores s ON e.setor_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (ativos === '1' || ativos === 1) {
      sql += ' AND e.ativo = 1';
    } else if (ativos === '0' || ativos === 0) {
      sql += ' AND e.ativo = 0';
    }

    if (tipo) {
      sql += ' AND e.tipo_processo_id = ?';
      params.push(tipo);
    }
    if (setor) {
      sql += ' AND e.setor_id = ?';
      params.push(setor);
    }
    sql += ' ORDER BY e.nome';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const obterEspecie = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, tp.nome as tipo_processo_nome, s.nome as setor_nome
      FROM especies_processo e
      LEFT JOIN tipos_processo tp ON e.tipo_processo_id = tp.id
      LEFT JOIN setores s ON e.setor_id = s.id
      WHERE e.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Especie nao encontrada.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const criarEspecie = async (req, res) => {
  try {
    const {
      codigo,
      nome,
      tipo_processo_id,
      setor_id,
      prazo_minimo,
      prazo_maximo,
      dias_uteis,
      mensagem_customizada
    } = req.body;

    if (!codigo || !codigo.toString().trim()) {
      return res.status(400).json({ message: 'Código da espécie é obrigatório.' });
    }

    const [result] = await pool.query(
      `INSERT INTO especies_processo
       (codigo, nome, tipo_processo_id, setor_id, prazo_minimo, prazo_maximo, dias_uteis, mensagem_customizada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo.toString().trim(),
        nome,
        tipo_processo_id || null,
        setor_id || null,
        prazo_minimo || null,
        prazo_maximo || null,
        dias_uteis ? 1 : 0,
        mensagem_customizada || null
      ]
    );

    const [rows] = await pool.query(`
      SELECT e.*, tp.nome as tipo_processo_nome, s.nome as setor_nome
      FROM especies_processo e
      LEFT JOIN tipos_processo tp ON e.tipo_processo_id = tp.id
      LEFT JOIN setores s ON e.setor_id = s.id
      WHERE e.id = ?
    `, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarEspecie = async (req, res) => {
  try {
    const {
      codigo,
      nome,
      tipo_processo_id,
      setor_id,
      prazo_minimo,
      prazo_maximo,
      dias_uteis,
      mensagem_customizada,
      ativo
    } = req.body;

    if (!codigo || !codigo.toString().trim()) {
      return res.status(400).json({ message: 'Código da espécie é obrigatório.' });
    }

    await pool.query(
      `UPDATE especies_processo SET
       codigo = ?,
       nome = ?,
       tipo_processo_id = ?,
       setor_id = ?,
       prazo_minimo = ?,
       prazo_maximo = ?,
       dias_uteis = ?,
       mensagem_customizada = ?,
       ativo = ?
       WHERE id = ?`,
      [
        codigo,
        nome,
        tipo_processo_id || null,
        setor_id || null,
        prazo_minimo || null,
        prazo_maximo || null,
        dias_uteis !== undefined ? (dias_uteis ? 1 : 0) : 0,
        mensagem_customizada || null,
        ativo !== undefined ? ativo : 1,
        req.params.id
      ]
    );

    const [rows] = await pool.query(`
      SELECT e.*, tp.nome as tipo_processo_nome, s.nome as setor_nome
      FROM especies_processo e
      LEFT JOIN tipos_processo tp ON e.tipo_processo_id = tp.id
      LEFT JOIN setores s ON e.setor_id = s.id
      WHERE e.id = ?
    `, [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const excluirEspecie = async (req, res) => {
  try {
    await pool.query('UPDATE especies_processo SET ativo = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Especie desativada com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== Campos/Anexos cadastrados na espécie =====
export const listarAnexosEspecie = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT id, especie_id, titulo, tipo, obrigatorio, ordem, opcoes, ativo
       FROM especie_anexos
       WHERE especie_id = ? AND ativo = 1
       ORDER BY ordem ASC, id ASC`,
      [id],
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const salvarAnexosEspecie = async (req, res) => {
  try {
    const { id } = req.params;
    const { anexos } = req.body;

    if (!Array.isArray(anexos)) {
      return res.status(400).json({ message: 'Payload invalido. Envie { anexos: [...] }.' });
    }

    // valida espécie existe
    const [especieRows] = await pool.query(
      `SELECT id FROM especies_processo WHERE id = ? AND ativo = 1`,
      [id],
    );
    if (especieRows.length === 0) {
      return res.status(404).json({ message: 'Especie nao encontrada.' });
    }

    // Recria (simplificação por versão)
    await pool.query(`DELETE FROM especie_anexos WHERE especie_id = ?`, [id]);

    if (anexos.length === 0) {
      return res.json({ message: 'Anexos da especie atualizados com sucesso.', count: 0 });
    }

    // Normaliza e insere
    const inserts = anexos.map((a, idx) => {
      const titulo = (a?.titulo ?? '').toString().trim();
      const tipo = (a?.tipo ?? 'arquivo').toString().trim(); // texto|numero|data|arquivo
      const obrigatorio = a?.obrigatorio ? 1 : 0;
      const ordem = Number.isFinite(a?.ordem) ? Number(a.ordem) : (idx + 1);

      if (!titulo) return null;
      if (!['texto', 'numero', 'data', 'arquivo'].includes(tipo)) return null;

      const opcoes = a?.opcoes ?? null; // pode ser objeto/array
      return { titulo, tipo, obrigatorio, ordem, opcoes };
    }).filter(Boolean);

    if (inserts.length === 0) {
      return res.json({ message: 'Anexos da especie atualizados com sucesso.', count: 0 });
    }

    const values = inserts.map((i) => [
      id,
      i.titulo,
      i.tipo,
      i.obrigatorio,
      i.ordem,
      i.opcoes ? JSON.stringify(i.opcoes) : null,
    ]);

    await pool.query(
      `INSERT INTO especie_anexos (especie_id, titulo, tipo, obrigatorio, ordem, opcoes)
       VALUES ?`,
      [values],
    );

    // Verifica se realmente gravou (ajuda a debugar casos de payload vazio/valores inválidos)
    const [checkRows] = await pool.query(
      `SELECT COUNT(*) as count FROM especie_anexos WHERE especie_id = ? AND ativo = 1`,
      [id]
    );

    res.json({ message: 'Anexos da especie atualizados com sucesso.', count: checkRows?.[0]?.count ?? inserts.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

