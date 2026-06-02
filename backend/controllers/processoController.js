import pool from "../config/database.js";
import logger from '../config/logger.js';
import { gerarNumeroProcesso } from "../utils/helpers.js";
import { criarNotificacao } from "./notificacaoController.js";
import { registrarHistorico } from "../utils/historico.js";
import {
  asPrioridade,
  isNonEmptyString,
  parseOptionalInt,
  parseOptionalNumber,
  toOptionalTrimmedString,
  validateDateISO,
  validateEmailBasic,
} from "../utils/validators.js";


export const listarProcessos = async (req, res) => {
  try {
    const { status, tipo, setor, busca, situacao, usuarioResponsavel } =
      req.query;
    let sql =
      "SELECT p.*, u.nome as usuarioResponsavelNome, tp.icone_svg as tipo_icone_svg FROM processos p LEFT JOIN users u ON p.usuarioResponsavel = u.id LEFT JOIN tipos_processo tp ON p.tipo = tp.nome WHERE 1=1";
    const params = [];

    if (status) {
      sql += " AND p.status = ?";
      params.push(status);
    }
    if (situacao) {
      sql += " AND p.situacao = ?";
      params.push(situacao);
    } else {
      sql += " AND p.situacao != 'excluido'";
    }
  
    if (tipo) {
      sql += " AND p.tipo = ?";
      params.push(tipo);
    }
    if (setor) {
      sql += " AND p.setorAtual = ?";
      params.push(setor);
    }
    if (usuarioResponsavel) {
      sql += " AND p.usuarioResponsavel = ?";
      params.push(usuarioResponsavel);
    }
    if (busca) {
      sql +=
        " AND (p.numero LIKE ? OR p.requerente LIKE ? OR p.assunto LIKE ?)";
      const like = `%${busca}%`;
      params.push(like, like, like);
    }
    sql += " ORDER BY p.createdAt DESC";

    const [processos] = await pool.query(sql, params);
    res.json(processos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const obterProcesso = async (req, res) => {
  try {
    // Fazer todas as queries em paralelo ao invés de sequencial
    const [rows, movimentacoes, documentos, observacoes, filhos, historico] = await Promise.all([
      pool.query(
        `SELECT p.*, e.nome as especie_nome, e.mensagem_customizada as especie_mensagem,
               e.prazo_minimo as especie_prazo_minimo, e.prazo_maximo as especie_prazo_maximo,
               e.dias_uteis as especie_dias_uteis, u.nome as usuarioResponsavelNome
        FROM processos p
        LEFT JOIN especies_processo e ON p.especie_id = e.id
        LEFT JOIN users u ON p.usuarioResponsavel = u.id
        LEFT JOIN tipos_processo tp ON p.tipo = tp.nome
        WHERE p.id = ?`,
        [req.params.id],
      ).then(r => r[0]),
      pool.query(
        `SELECT m.*, u.nome as usuarioNome, ud.nome as usuarioDestinoNome 
         FROM movimentacoes m 
         LEFT JOIN users u ON m.usuario = u.id 
         LEFT JOIN users ud ON m.usuarioDestino = ud.id 
         WHERE m.processoId = ? ORDER BY m.data DESC`,
        [req.params.id],
      ).then(r => r[0]),
      pool.query(
        `SELECT d.id, d.processoId, d.nome, d.tipo, d.caminho, d.tamanho, d.versao, d.dataUpload, u.nome as usuarioNome FROM documentos d 
         LEFT JOIN users u ON d.usuario = u.id WHERE d.processoId = ? ORDER BY d.dataUpload DESC`,
        [req.params.id],
      ).then(r => r[0]),
      pool.query(
        `SELECT o.*, u.nome as usuarioNome FROM observacoes o 
         LEFT JOIN users u ON o.usuario = u.id WHERE o.processoId = ? ORDER BY o.data DESC`,
        [req.params.id],
      ).then(r => r[0]),
      pool.query(
        `SELECT id, numero, tipo, assunto, status, situacao, createdAt FROM processos WHERE processoPaiId = ? ORDER BY createdAt DESC`,
        [req.params.id],
      ).then(r => r[0]),
      pool.query(
        `SELECT h.*, u.nome as usuarioNome FROM historico h 
         LEFT JOIN users u ON h.usuario = u.id WHERE h.processoId = ? ORDER BY h.data DESC`,
        [req.params.id],
      ).then(r => r[0]),
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Processo não encontrado." });
    }

    const processo = rows[0];

    // Carregar documentos dos processos filhos em uma única query
    let filhosComDocumentos = filhos.map((f) => ({
      ...f,
      documentos: [],
    }));

    if (filhos.length > 0) {
      const placeholders = filhos.map(() => '?').join(',');
      const [filhosDocumentos] = await pool.query(
        `SELECT d.id, d.processoId, d.nome, d.tipo, d.caminho, d.tamanho, d.versao, d.dataUpload, u.nome as usuarioNome
         FROM documentos d
         LEFT JOIN users u ON d.usuario = u.id
         WHERE d.processoId IN (${placeholders})
         ORDER BY d.dataUpload DESC`,
        filhos.map((f) => f.id),
      );

      const idxPorId = new Map(filhosComDocumentos.map((f, i) => [f.id, i]));
      filhosDocumentos.forEach((doc) => {
        const i = idxPorId.get(doc.processoId);
        if (i !== undefined) filhosComDocumentos[i].documentos.push(doc);
      });
    }

    res.json({
      ...processo,
      movimentacoes,
      documentos,
      observacoes,
      filhos: filhosComDocumentos,
      historico,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const criarProcesso = async (req, res) => {
  try {
    const {
      tipo,
      assunto,
      requerente,
      cpfCnpj,
      endereco,
      telefone,
      email,
      descricao,
      setorAtual,
      prioridade,
      prazo,
      especie_id,
      usuarioResponsavel,
      anexosValores, // [{ especie_anexo_id, valor_texto?, valor_numero?, valor_data?, documento_id? }]
    } = req.body;

    // ===== Validação base do "Novo Processo" =====
    if (!isNonEmptyString(tipo)) {
      return res.status(400).json({ message: "Campo tipo é obrigatório." });
    }
    if (!isNonEmptyString(assunto) || String(assunto).trim().length > 200) {
      return res.status(400).json({ message: "Campo assunto é obrigatório e deve ter até 200 caracteres." });
    }
    if (!isNonEmptyString(requerente)) {
      return res.status(400).json({ message: "Campo requerente é obrigatório." });
    }
    if (!isNonEmptyString(setorAtual)) {
      // no frontend costuma vir como id string/numero (ex.: "3")
      const setorInt = parseOptionalInt(setorAtual);
      if (setorInt === null) {
        return res.status(400).json({ message: "Campo setorAtual é obrigatório." });
      }
    }

    const prioridadeFinal = asPrioridade(prioridade);
    if (!prioridadeFinal) {
      return res.status(400).json({ message: "Prioridade inválida." });
    }

    const prazoNum =
      prazo !== undefined && prazo !== null && String(prazo).trim() !== ""
        ? parseOptionalNumber(prazo)
        : null;

    if (prazoNum !== null && typeof prazoNum === 'number' && !Number.isFinite(prazoNum)) {
      return res.status(400).json({ message: "Campo prazo deve ser um número válido." });
    }

    if (email !== undefined && email !== null && String(email).trim() !== '') {
      if (!validateEmailBasic(email)) {
        return res.status(400).json({ message: "Email inválido." });
      }
    }

    const tipoFinalInput = toOptionalTrimmedString(tipo);
    const assuntoFinalInput = String(assunto).trim();
    const requerenteFinalInput = String(requerente).trim();
    const setorAtualFinalInput = parseOptionalInt(setorAtual) ?? setorAtual;

    // normalizações opcionais
    const cpfCnpjFinal = toOptionalTrimmedString(cpfCnpj);
    const enderecoFinal = toOptionalTrimmedString(endereco);
    const telefoneFinal = toOptionalTrimmedString(telefone);
    const emailFinal = toOptionalTrimmedString(email);
    const descricaoFinal = toOptionalTrimmedString(descricao);



    let especieDisponivel = null;
    let usuarioResponsavelFinal = usuarioResponsavel ?? null;

    // Garantir consistência + disponibilidade: espécie deve pertencer ao tipo e estar disponível para abertura
    // (validações ficam dentro do if abaixo)

    if (especie_id) {
      const especieIdNum = parseInt(especie_id);
      if (!Number.isNaN(especieIdNum)) {
        const [especieRows] = await pool.query(
          `SELECT
              e.id,
              e.ativo,
              e.tipo_processo_id,
              tp.nome as tipo_processo_nome,
              e.setor_id,
              e.prazo_minimo,
              e.prazo_maximo,
              e.dias_uteis,
              e.mensagem_customizada
           FROM especies_processo e
           LEFT JOIN tipos_processo tp ON e.tipo_processo_id = tp.id
           WHERE e.id = ?`,
          [especieIdNum],
        );

        if (especieRows.length === 0) {
          return res.status(400).json({ message: "Espécie inválida." });
        }

        especieDisponivel = especieRows[0];

        if (!especieDisponivel.ativo) {
          return res.status(400).json({
            message: "Espécie não disponível para o requerente abrir o processo.",
          });
        }

        const tipoDaEspecieNome = especieDisponivel.tipo_processo_nome;

        if (tipoFinal && tipoDaEspecieNome && tipoFinal !== tipoDaEspecieNome) {
          return res.status(400).json({
            message:
              "A espécie selecionada não pertence ao tipo do processo escolhido.",
          });
        }

        tipoFinal = tipoDaEspecieNome || tipoFinal;

        // Validação de prazo (se o cliente informar prazo)
        // - no banco: prazo_minimo/prazo_maximo são INT (dias)
        // - no request: prazo chega em formato que o frontend envia; tentamos interpretar como número de dias
        const prazoNum = prazo !== undefined && prazo !== null && String(prazo).trim() !== ""
          ? Number(prazo)
          : null;

        const temPrazoMin = especieDisponivel.prazo_minimo !== undefined && especieDisponivel.prazo_minimo !== null;
        const temPrazoMax = especieDisponivel.prazo_maximo !== undefined && especieDisponivel.prazo_maximo !== null;

        if (prazoNum !== null && Number.isFinite(prazoNum) && (temPrazoMin || temPrazoMax)) {
          if (temPrazoMin && prazoNum < especieDisponivel.prazo_minimo) {
            return res.status(400).json({
              message: `Prazo informado está abaixo do mínimo permitido para esta espécie (mínimo: ${especieDisponivel.prazo_minimo}).`,
            });
          }
          if (temPrazoMax && prazoNum > especieDisponivel.prazo_maximo) {
            return res.status(400).json({
              message: `Prazo informado está acima do máximo permitido para esta espécie (máximo: ${especieDisponivel.prazo_maximo}).`,
            });
          }
        }

        // Validação de dias_uteis (apenas coerência quando definido)
        if (especieDisponivel.dias_uteis !== undefined && especieDisponivel.dias_uteis !== null) {
          const diasUteisNum = Number(especieDisponivel.dias_uteis);
          if (!Number.isNaN(diasUteisNum) && diasUteisNum < 0) {
            return res.status(400).json({
              message: "Configuração inválida de dias úteis na espécie selecionada.",
            });
          }
        }
      }
    }

    const numero = await gerarNumeroProcesso();
    const [result] = await pool.query(
      `INSERT INTO processos (numero, tipo, assunto, requerente, cpfCnpj, endereco, telefone, email, descricao, setorAtual, usuarioResponsavel, prioridade, prazo, especie_id, situacao, criadoPor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numero,
        tipoFinal,
        assunto,
        requerente,
        cpfCnpj || null,
        endereco || null,
        telefone || null,
        email || null,
        descricao || null,
        setorAtual,
        usuarioResponsavelFinal,
        prioridade || "normal",
        prazo || null,
        especie_id || null,
        "encaminhado",
        req.user.id,
      ],
    );

    // Persistir valores dos anexos/campos da espécie (primeira versão: validar e inserir)
    if (Array.isArray(anexosValores) && anexosValores.length > 0) {
      // valida: busca obrigatórios e ids válidos
      const especieAnexoIds = anexosValores
        .map((v) => parseInt(v?.especie_anexo_id))
        .filter((n) => !Number.isNaN(n));

      const [defRows] = await pool.query(
        `SELECT id, tipo, obrigatorio
         FROM especie_anexos
         WHERE especie_id = ? AND ativo = 1 AND id IN (${especieAnexoIds.length ? especieAnexoIds.map(() => '?').join(',') : 'NULL'})`,
        especie_id || null,
        especieAnexoIds,
      );

      // regra: se especie_id não existe, ignora validação (mas ainda tenta inserir)
      const obrigatorios = defRows.filter((d) => d.obrigatorio === 1);

      for (const o of obrigatorios) {
        const match = anexosValores.find(
          (x) => parseInt(x?.especie_anexo_id) === o.id
        );
        if (!match) {
          return res.status(400).json({
            message: `Campo obrigatório do anexo não preenchido (id ${o.id}).`,
          });
        }

        const tipo = o.tipo;
        const valido =
          tipo === "texto"
            ? (match.valor_texto ?? "").toString().trim().length > 0
            : tipo === "numero"
              ? match.valor_numero !== undefined &&
                match.valor_numero !== null &&
                String(match.valor_numero).toString().trim() !== ""
              : tipo === "data"
                ? !!match.valor_data
                : tipo === "arquivo"
                  ? !!match.documento_id
                  : false;

        if (!valido) {
          return res.status(400).json({
            message: `Campo obrigatório '${o.id}' (${o.tipo}) não preenchido.`,
          });
        }
      }

      // limpar e inserir valores
      await pool.query(
        `DELETE FROM processo_anexos_valores WHERE processo_id = ?`,
        [result.insertId],
      );

      // Montagem correta sem coluna extra
      const valuesFinal = anexosValores
        .filter((v) => v && !Number.isNaN(parseInt(v.especie_anexo_id)))
        .map((v) => [
          result.insertId,
          parseInt(v.especie_anexo_id),
          v.valor_texto ?? null,
          v.valor_numero ?? null,
          v.valor_data ?? null,
          v.documento_id ?? null,
        ]);

      if (valuesFinal.length > 0) {
        await pool.query(
          `INSERT INTO processo_anexos_valores
           (processo_id, especie_anexo_id, valor_texto, valor_numero, valor_data, documento_id)
           VALUES ?`,
          [valuesFinal],
        );
      }
    }

    // Regra de atribuição ao setor/caixa de entrada:
    // - Se o cliente informar usuarioResponsavel, atribui ao usuário
    // - Caso contrário, deixa null para notificar todos os usuários ativos do setor
    if (usuarioResponsavelFinal) {

      await criarNotificacao(
        usuarioResponsavelFinal,
        result.insertId,
        "Novo processo na Caixa de Entrada",
        `O processo ${numero} foi criado e atribuído a você no setor ${setorAtual}.`,
        "info",
        prioridade || "normal",
      );
    } else {
      const [usuariosSetor] = await pool.query(
        'SELECT id FROM users WHERE ativo = 1 AND setor = ? ORDER BY id',
        [setorAtual],
      );

      for (const u of usuariosSetor) {
        await criarNotificacao(
          u.id,
          result.insertId,
          "Novo processo na Caixa de Entrada do setor",
          `O processo ${numero} chegou ao setor ${setorAtual}.`,
          "info",
          prioridade || "normal",
        );
      }
    }

    await registrarHistorico(
      result.insertId,
      "criacao",
      `Processo ${numero} criado no setor ${setorAtual}.`,
      req.user.id,
      { tipo: tipoFinal, assunto, requerente, setorAtual },
    );

    const [rows] = await pool.query("SELECT * FROM processos WHERE id = ?", [
      result.insertId,
    ]);
    
    logger.info(`Novo processo criado: ${numero}`, {
      processoId: result.insertId,
      numero,
      tipo: tipoFinal,
      assunto,
      requerente,
      setor: setorAtual,
      prioridade: prioridade || "normal",
      usuarioId: req.user.id,
    });
    
    res.status(201).json(rows[0]);
  } catch (error) {
    logger.error(`Erro ao criar novo processo: ${error.message}`, {
      error: error.stack,
      usuarioId: req.user?.id,
      body: req.body,
    });
    res.status(500).json({ message: error.message });
  }
};

export const atualizarProcesso = async (req, res) => {
  try {
    const [anterior] = await pool.query(
      "SELECT * FROM processos WHERE id = ?",
      [req.params.id],
    );
    if (anterior.length === 0) {
      return res.status(404).json({ message: "Processo não encontrado." });
    }
    const processoAntes = anterior[0];

    const campos = [];
    const valores = [];
    const alteracoes = [];
    Object.keys(req.body).forEach((key) => {
      if (key === "status") return;
      campos.push(`${key} = ?`);
      valores.push(req.body[key]);
      if (processoAntes[key] !== req.body[key]) {
        alteracoes.push(
          `${key}: ${processoAntes[key] || "—"} → ${req.body[key] || "—"}`,
        );
      }
    });
    if (campos.length === 0) {
      return res
        .status(400)
        .json({ message: "Nenhum campo válido para atualizar." });
    }
    valores.push(req.params.id);

    await pool.query(
      `UPDATE processos SET ${campos.join(", ")} WHERE id = ?`,
      valores,
    );
    if (alteracoes.length > 0) {
      await registrarHistorico(
        req.params.id,
        "edicao",
        `Campos alterados: ${alteracoes.join("; ")}`,
        req.user.id,
        { alteracoes },
      );
    }
    const [rows] = await pool.query("SELECT * FROM processos WHERE id = ?", [
      req.params.id,
    ]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const encaminharProcesso = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { para, parecer, paraUsuario } = req.body;
    const [rows] = await connection.query("SELECT * FROM processos WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Processo não encontrado." });
    }
    const processo = rows[0];

    if (!processo.numero) {
      await connection.rollback();
      return res.status(400).json({
        message: "O processo precisa estar gerado para permitir encaminhamento (número do processo ausente).",
      });
    }

    if (processo.situacao === "encaminhado") {
      await connection.rollback();
      return res.status(400).json({
        message: "Processo já inúmeracional. Aguarde o recebimento para reencaminhar.",
      });
    }
    if (paraUsuario && parseInt(paraUsuario) === req.user.id) {
      await connection.rollback();
      return res.status(400).json({
        message: "Você não pode encaminhante um processo para si mesmo.",
      });
    }
    await connection.query(
      "INSERT INTO movimentacoes (processoId, de, para, usuarioDestino, usuario, parecer) VALUES (?, ?, ?, ?, ?, ?)",
      [req.params.id, processo.setorAtual, para, paraUsuario || null, req.user.id, parecer || null],
    );
    await connection.query(
      "UPDATE processos SET setorAtual = ?, usuarioResponsavel = ?, situacao = ? WHERE id = ?",
      [para, paraUsuario || null, "encaminhado", req.params.id],
    );

    if (paraUsuario) {
      await connection.query(
        "INSERT INTO notificacoes (usuarioId, processoId, titulo, mensagem, tipo, prioridade) VALUES (?, ?, ?, ?, ?, ?)",
        [paraUsuario, req.params.id, "Processo encaminhante para você",
         `O processo ${processo.numero} foi encaminhante para o setor ${para} com você como responsável.`,
         "info", processo.prioridade || "normal"]
      );
    }

    await connection.query(
      `INSERT INTO historico (processoId, tipo, descricao, usuario, metadata) VALUES (?, ?, ?, ?, ?)`,
      [req.params.id, "encaminhamento", `Processo encaminhante de ${processo.setorAtual} para ${para}.`,
       req.user.id, JSON.stringify({ de: processo.setorAtual, para, parecer, paraUsuario })]
    );

    await connection.commit();

    const [atualizado] = await pool.query("SELECT * FROM processos WHERE id = ?", [req.params.id]);

    logger.info(`Processo encaminhante: ${processo.numero}`, {
      processoId: req.params.id,
      numero: processo.numero,
      deSetor: processo.setorAtual,
      paraSetor: para,
      paraUsuario: paraUsuario || null,
      usuarioId: req.user.id,
      parecer: parecer ? parecer.substring(0, 100) : null,
    });

    res.json(atualizado[0]);
  } catch (error) {
    await connection.rollback();
    logger.error(`Erro ao encaminhante processo ${req.params.id}: ${error.message}`, {
      error: error.stack,
      usuarioId: req.user?.id,
      processoId: req.params.id,
      body: req.body,
    });
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

export const receberProcesso = async (req, res) => {
  try {
    await pool.query(
      "UPDATE processos SET situacao = ?, status = ? WHERE id = ?",
      ["recebido", "tramitando", req.params.id],
    );
    await registrarHistorico(
      req.params.id,
      "recebimento",
      "Processo recebido.",
      req.user.id,
    );
    res.json({ id: req.params.id, situacao: "recebido", status: "tramitando" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const voltarProcesso = async (req, res) => {
  try {
    const { observacao } = req.body;
    const [rows] = await pool.query("SELECT * FROM processos WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Processo não encontrado." });
    }
    const processo = rows[0];
    if (processo.situacao !== "encaminhado") {
      return res
        .status(400)
        .json({ message: "O processo não está em situação de encaminhado." });
    }

    // Buscar a última movimentação para saber de onde veio
    const [movimentacoes] = await pool.query(
      "SELECT * FROM movimentacoes WHERE processoId = ? ORDER BY data DESC LIMIT 1",
      [req.params.id],
    );

    // Fallback: processo pode ter sido criado já como 'encaminhado' (via criarProcesso),
    // e nesse fluxo pode não existir movimentação em movimentacoes ainda.
    if (movimentacoes.length === 0) {
      const parecer = observacao
        ? `Processo devolvido: ${observacao}`
        : "Processo devolvido ao remetente";

      // Quando não existe movimentação anterior, usa-se o próprio estado atual do processo
      // para registrar a "origem" e permitir o retorno sem erro.
      await pool.query(
        "INSERT INTO movimentacoes (processoId, de, para, usuarioDestino, usuario, parecer) VALUES (?, ?, ?, ?, ?, ?)",
        [
          req.params.id,
          processo.setorAtual,
          processo.setorAtual,
          processo.usuarioResponsavel || null,
          req.user.id,
          parecer,
        ],
      );

      // Atualizar processo mantendo retorno para o mesmo setor/usuário atual, apenas ajustando situacao
      await pool.query(
        "UPDATE processos SET setorAtual = ?, usuarioResponsavel = ?, situacao = ? WHERE id = ?",
        [
          processo.setorAtual,
          processo.usuarioResponsavel || null,
          "retornado",
          req.params.id,
        ],
      );

      if (observacao) {
        await pool.query(
          "INSERT INTO observacoes (processoId, texto, usuario) VALUES (?, ?, ?)",
          [req.params.id, observacao, req.user.id],
        );
      }

      await registrarHistorico(
        req.params.id,
        "retorno",
        `Processo devolvido (fallback sem movimentação anterior) no setor ${processo.setorAtual}.`,
        req.user.id,
        { de: processo.setorAtual, para: processo.setorAtual, observacao },
      );

      return res.json({ ...processo, situacao: "retornado" });
    }

    const ultimaMov = movimentacoes[0];

    const parecer = observacao
      ? `Processo devolvido: ${observacao}`
      : "Processo devolvido ao remetente";

    // Inserir movimentação de retorno
    await pool.query(
      "INSERT INTO movimentacoes (processoId, de, para, usuarioDestino, usuario, parecer) VALUES (?, ?, ?, ?, ?, ?)",
      [
        req.params.id,
        processo.setorAtual,
        ultimaMov.de,
        ultimaMov.usuario,
        req.user.id,
        parecer,
      ],
    );

    // Atualizar processo: voltar para o setor e usuário de origem com situacao retornado
    await pool.query(
      "UPDATE processos SET setorAtual = ?, usuarioResponsavel = ?, situacao = ? WHERE id = ?",
      [ultimaMov.de, ultimaMov.usuario, "retornado", req.params.id],
    );

    // Registrar observacao do retorno
    if (observacao) {
      await pool.query(
        "INSERT INTO observacoes (processoId, texto, usuario) VALUES (?, ?, ?)",
        [req.params.id, observacao, req.user.id],
      );
    }

    // Notificar o usuário de origem
    if (ultimaMov.usuario) {
      await criarNotificacao(
        ultimaMov.usuario,
        req.params.id,
        "Processo devolvido",
        `O processo ${processo.numero} foi devolvido para o setor ${ultimaMov.de}.`,
        "warning",
        processo.prioridade || "normal",
      );
    }

    await registrarHistorico(
      req.params.id,
      "retorno",
      `Processo devolvido de ${processo.setorAtual} para ${ultimaMov.de}.`,
      req.user.id,
      { de: processo.setorAtual, para: ultimaMov.de, observacao },
    );

    const [atualizado] = await pool.query(
      "SELECT * FROM processos WHERE id = ?",
      [req.params.id],
    );
    res.json(atualizado[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const aprovarProcesso = async (req, res) => {
  try {
    await pool.query("UPDATE processos SET situacao = ? WHERE id = ?", [
      "aprovado",
      req.params.id,
    ]);
    await registrarHistorico(
      req.params.id,
      "aprovacao",
      "Processo deferido.",
      req.user.id,
    );
    res.json({ id: req.params.id, situacao: "aprovado" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const pausarProcesso = async (req, res) => {
  try {
    await pool.query(
      "UPDATE processos SET situacao = ?, status = ? WHERE id = ?",
      ["pausado", "aguardando", req.params.id],
    );
    await registrarHistorico(
      req.params.id,
      "pausa",
      "Processo suspenso.",
      req.user.id,
    );
    res.json({ id: req.params.id, situacao: "pausado", status: "aguardando" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const arquivarProcesso = async (req, res) => {
  try {
    await pool.query(
      "UPDATE processos SET situacao = ?, status = ? WHERE id = ?",
      ["arquivado", "arquivado", req.params.id],
    );
    await registrarHistorico(
      req.params.id,
      "arquivamento",
      "Processo arquivado.",
      req.user.id,
    );
    res.json({ id: req.params.id, situacao: "arquivado", status: "arquivado" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const indeferirProcesso = async (req, res) => {
  try {
    await pool.query(
      "UPDATE processos SET situacao = ?, status = ? WHERE id = ?",
      ["indeferido", "indeferido", req.params.id],
    );
    await registrarHistorico(
      req.params.id,
      "indeferimento",
      "Processo indeferido.",
      req.user.id,
    );
    res.json({ id: req.params.id, situacao: "indeferido", status: "indeferido" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listarCaixaEntrada = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    // setor do usuário logado (ex.: req.user.setor)
    const setorUsuario = req.user?.setor;

    const baseSelect = `
      SELECT p.*,
             u.nome as usuarioResponsavelNome,
             CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as favorito
      FROM processos p
      LEFT JOIN users u ON p.usuarioResponsavel = u.id
      LEFT JOIN favoritos f ON f.processoId = p.id AND f.usuarioId = ?
    `;

    // Permite que a Caixa de Entrada mostre:
    // - encaminhado (setor x usuário)
    // - recebido (setor x usuário)
    // - além de outras situações suportadas na UI (Suspenso/Arquivado/Deferido/etc.)
    //
    // Regras:
    // - caixaSetor: usuarioResponsavel IS NULL
    // - caixaUsuario: usuarioResponsavel = usuarioId
    // - ambos filtrados por (situacao IN (...) )
    const situacoesPermitidas = [
      "encaminhado",
      "recebido",
      "retornado",
      "pausado",
      "arquivado",
      "aprovado",
      "indeferido",
    ];

    const placeholdersSituacoes = situacoesPermitidas.map(() => "?").join(",");

    let sqlSetor = `
      ${baseSelect}
      WHERE p.usuarioResponsavel IS NULL
        AND p.situacao IN (${placeholdersSituacoes})
    `;
    const paramsSetor = [usuarioId, ...situacoesPermitidas];

    if (setorUsuario) {
      sqlSetor += " AND p.setorAtual = ?";
      paramsSetor.push(setorUsuario);
    }

    sqlSetor += " ORDER BY favorito DESC, p.prioridade DESC, p.createdAt DESC";

    const [processosSetor] = await pool.query(sqlSetor, paramsSetor);

    let sqlUsuario = `
      ${baseSelect}
      WHERE p.usuarioResponsavel = ?
        AND p.situacao IN (${placeholdersSituacoes})
    `;
    // no baseSelect primeiro parâmetro é usuarioId (para favoritos)
    // depois, aqui, p.usuarioResponsavel = ?
    const paramsUsuario = [usuarioId, usuarioId, ...situacoesPermitidas];

    if (setorUsuario) {
      sqlUsuario += " AND p.setorAtual = ?";
      paramsUsuario.push(setorUsuario);
    }

    sqlUsuario += " ORDER BY favorito DESC, p.prioridade DESC, p.createdAt DESC";

    const [processosUsuario] = await pool.query(sqlUsuario, paramsUsuario);

    const conta = (lista) => {
      const base = {};
      situacoesPermitidas.forEach((s) => (base[s] = 0));
      lista.forEach((p) => {
        if (base[p.situacao] !== undefined) base[p.situacao] += 1;
      });
      return base;
    };

    res.json({
      caixaSetor: {
        processos: processosSetor,
        contagem: conta(processosSetor),
      },
      caixaUsuario: {
        processos: processosUsuario,
        contagem: conta(processosUsuario),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const favoritarProcesso = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const processoId = req.params.id;

    const [existing] = await pool.query(
      "SELECT id FROM favoritos WHERE usuarioId = ? AND processoId = ?",
      [usuarioId, processoId],
    );

    if (existing.length > 0) {
      await pool.query(
        "DELETE FROM favoritos WHERE usuarioId = ? AND processoId = ?",
        [usuarioId, processoId],
      );
      res.json({ favorito: false });
    } else {
      await pool.query(
        "INSERT INTO favoritos (usuarioId, processoId) VALUES (?, ?)",
        [usuarioId, processoId],
      );
      res.json({ favorito: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const excluirProcesso = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query("SELECT id, numero, situacao FROM processos WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Processo não encontrado." });
    }
    const processo = rows[0];
    if (
      processo.situacao !== "encaminhado" &&
      processo.situacao !== "recebido" &&
      processo.situacao !== "retornado"
    ) {
      await connection.rollback();
      return res.status(400).json({ message: "Este processo não pode ser excluído." });
    }

    await connection.query(
      "UPDATE processos SET situacao = ?, deletedAt = NOW(), deletedBy = ? WHERE id = ?",
      ["excluido", req.user.id, req.params.id]
    );

    await connection.query(
      `INSERT INTO historico (processoId, tipo, descricao, usuario, metadata) VALUES (?, ?, ?, ?, ?)`,
      [req.params.id, "exclusao", "Processo excluído da Caixa de Entrada.", req.user.id,
       JSON.stringify({ numero: processo.numero })]
    );

    // Registrar no audit_log
    await connection.query(
      `INSERT INTO audit_log (userId, usuarioTipo, acao, recurso, recursoId, detalhes, ip) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.tipo || 'staff', 'EXCLUIR_PROCESSO', 'processo', req.params.id,
       JSON.stringify({ numero: processo.numero }), req.ip]
    );

    await connection.commit();

    logger.info(`Processo ${processo.numero} excluído por usuário ${req.user.id}`, {
      processoId: req.params.id,
      numero: processo.numero,
      usuarioId: req.user.id,
      ip: req.ip
    });

    res.json({ id: req.params.id, situacao: "excluido" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

export const adicionarObservacao = async (req, res) => {
  try {
    const { texto } = req.body;
    const [result] = await pool.query(
      "INSERT INTO observacoes (processoId, texto, usuario) VALUES (?, ?, ?)",
      [req.params.id, texto, req.user.id],
    );
    await registrarHistorico(
      req.params.id,
      "observacao",
      `Observação adicionada: ${texto}`,
      req.user.id,
    );
    res.json({ 
      id: result.insertId, 
      processoId: req.params.id, 
      texto, 
      usuario: req.user.id,
      createdAt: new Date()
    });
  } catch (error) {
    logger.error(`Erro ao adicionar observação: ${error.message}`, {
      error: error.stack,
      processoId: req.params.id,
      usuarioId: req.user?.id,
    });
    res.status(500).json({ message: error.message });
  }
};

// ===== Campos/Anexos preenchidos no processo =====
// POST /api/processos/:id/anexos-valores
export const salvarAnexosValoresProcesso = async (req, res) => {
  try {
    const { id } = req.params;
    const { anexosValores } = req.body;

    if (!Array.isArray(anexosValores)) {
      return res
        .status(400)
        .json({ message: 'Payload invalido. Envie { anexosValores: [...] }.' });
    }

    const processoId = parseInt(id);
    if (Number.isNaN(processoId)) {
      return res.status(400).json({ message: 'Processo invalido.' });
    }

    const [procRows] = await pool.query(
      'SELECT id FROM processos WHERE id = ?',
      [processoId],
    );
    if (procRows.length === 0) {
      return res.status(404).json({ message: 'Processo não encontrado.' });
    }

    const values = anexosValores
      .filter((v) => v && !Number.isNaN(parseInt(v.especie_anexo_id)))
      .map((v) => ({
        especie_anexo_id: parseInt(v.especie_anexo_id),
        valor_texto:
          v.valor_texto !== undefined && v.valor_texto !== null
            ? String(v.valor_texto)
            : null,
        valor_numero:
          v.valor_numero !== undefined && v.valor_numero !== null
            ? Number(v.valor_numero)
            : null,
        valor_data: v.valor_data ? v.valor_data : null,
        documento_id:
          v.documento_id !== undefined && v.documento_id !== null
            ? (v.documento_id ? parseInt(v.documento_id) : null)
            : null,
      }));

    await pool.query('DELETE FROM processo_anexos_valores WHERE processo_id = ?', [processoId]);

    if (values.length === 0) {
      return res.json({ message: 'Anexos do processo atualizados com sucesso.', count: 0 });
    }

    const insertValues = values.map((v) => [
      processoId,
      v.especie_anexo_id,
      v.valor_texto,
      v.valor_numero,
      v.valor_data,
      v.documento_id,
    ]);

    await pool.query(
      `INSERT INTO processo_anexos_valores
       (processo_id, especie_anexo_id, valor_texto, valor_numero, valor_data, documento_id)
       VALUES ?`,
      [insertValues],
    );

    const [check] = await pool.query(
      'SELECT COUNT(*) as count FROM processo_anexos_valores WHERE processo_id = ?',
      [processoId],
    );

    res.json({
      message: 'Anexos do processo atualizados com sucesso.',
      count: check?.[0]?.count ?? insertValues.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const criarProcessoFilho = async (req, res) => {
  try {
    const processoPaiId = req.params.id;
    const [paiRows] = await pool.query("SELECT * FROM processos WHERE id = ?", [
      processoPaiId,
    ]);
    if (paiRows.length === 0) {
      return res.status(404).json({ message: "Processo pai não encontrado." });
    }
    const pai = paiRows[0];

    const {
      tipo,
      assunto,
      descricao,
      setorAtual,
      prioridade,
      prazo,
      especie_id,
      usuarioResponsavel,
    } = req.body;

    // Direcionamento ao setor para “Novo Processo Filho”: entra como encaminhado de setor.
    // Regra: criar já com situacao=encaminhado e sem atribuição direta ao usuário.
    let usuarioResponsavelFinal = usuarioResponsavel ?? null;

    // Garantir consistência + disponibilidade: espécie deve pertencer ao tipo e estar disponível para abertura
    let tipoFinal = tipo;
    let especieDisponivel = null;

    if (especie_id) {
      const especieIdNum = parseInt(especie_id);
      if (!Number.isNaN(especieIdNum)) {
        const [especieRows] = await pool.query(
          `SELECT
              e.id,
              e.ativo,
              e.tipo_processo_id,
              tp.nome as tipo_processo_nome,
              e.setor_id,
              e.prazo_minimo,
              e.prazo_maximo,
              e.dias_uteis,
              e.mensagem_customizada
           FROM especies_processo e
           LEFT JOIN tipos_processo tp ON e.tipo_processo_id = tp.id
           WHERE e.id = ?`,
          [especieIdNum],
        );

        if (especieRows.length === 0) {
          return res.status(400).json({ message: "Espécie inválida." });
        }

        especieDisponivel = especieRows[0];

        if (!especieDisponivel.ativo) {
          return res.status(400).json({
            message: "Espécie não disponível para o requerente abrir o processo.",
          });
        }

        const tipoDaEspecieNome = especieDisponivel.tipo_processo_nome;

        if (tipoFinal && tipoDaEspecieNome && tipoFinal !== tipoDaEspecieNome) {
          return res.status(400).json({
            message:
              "A espécie selecionada não pertence ao tipo do processo escolhido.",
          });
        }

        tipoFinal = tipoDaEspecieNome || tipoFinal;

        // Validação de prazo (se o cliente informar prazo)
        const prazoNum =
          prazo !== undefined && prazo !== null && String(prazo).trim() !== ""
            ? Number(prazo)
            : null;

        const temPrazoMin =
          especieDisponivel.prazo_minimo !== undefined &&
          especieDisponivel.prazo_minimo !== null;
        const temPrazoMax =
          especieDisponivel.prazo_maximo !== undefined &&
          especieDisponivel.prazo_maximo !== null;

        if (
          prazoNum !== null &&
          Number.isFinite(prazoNum) &&
          (temPrazoMin || temPrazoMax)
        ) {
          if (temPrazoMin && prazoNum < especieDisponivel.prazo_minimo) {
            return res.status(400).json({
              message: `Prazo informado está abaixo do mínimo permitido para esta espécie (mínimo: ${especieDisponivel.prazo_minimo}).`,
            });
          }
          if (temPrazoMax && prazoNum > especieDisponivel.prazo_maximo) {
            return res.status(400).json({
              message: `Prazo informado está acima do máximo permitido para esta espécie (máximo: ${especieDisponivel.prazo_maximo}).`,
            });
          }
        }

        // Validação de dias_uteis (apenas coerência quando definido)
        if (
          especieDisponivel.dias_uteis !== undefined &&
          especieDisponivel.dias_uteis !== null
        ) {
          const diasUteisNum = Number(especieDisponivel.dias_uteis);
          if (!Number.isNaN(diasUteisNum) && diasUteisNum < 0) {
            return res.status(400).json({
              message:
                "Configuração inválida de dias úteis na espécie selecionada.",
            });
          }
        }
      }
    }

    const numero = await gerarNumeroProcesso();

    const [result] = await pool.query(
      `INSERT INTO processos (numero, tipo, assunto, requerente, cpfCnpj, endereco, telefone, email, descricao, setorAtual, usuarioResponsavel, prioridade, prazo, especie_id, situacao, criadoPor, processoPaiId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numero,
        tipoFinal,
        assunto,
        pai.requerente,
        pai.cpfCnpj || null,
        pai.endereco || null,
        pai.telefone || null,
        pai.email || null,
        descricao || null,
        setorAtual,
        usuarioResponsavelFinal,
        prioridade || "normal",
        prazo || null,
        especie_id || null,
        "encaminhado",
        req.user.id,
        processoPaiId,
      ],
    );

    // Notificação: quando o processo filho chega no setor (usuarioResponsavel = NULL),
    // avisamos todos os usuários ativos do setorAtual.
    // (Quando houver usuário responsável, notificamos apenas ele.)
    if (usuarioResponsavelFinal) {
      await criarNotificacao(
        usuarioResponsavelFinal,
        result.insertId,
        "Novo processo filho na Caixa de Entrada",
        `O processo filho ${numero} foi criado a partir do processo ${pai.numero} e atribuído a você no setor ${setorAtual}.`,
        "info",
        prioridade || "normal",
      );
    }

    await registrarHistorico(
      processoPaiId,
      "filho",
      `Processo filho ${numero} criado.`,
      req.user.id,
      { filhoId: result.insertId, numero, tipo, assunto, setorAtual },
    );

    const [rows] = await pool.query("SELECT * FROM processos WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const relatorioAndamento = async (req, res) => {
  try {
    const { dataInicio, dataFim, setor, tipo, status } = req.query;
    let sql = "SELECT * FROM processos WHERE 1=1";
    const params = [];

    // Consistência com listarProcessos/listas: excluir processos marcados como excluídos
    sql += " AND situacao != 'excluido'";

    if (dataInicio) {
      sql += " AND DATE(createdAt) >= ?";
      params.push(dataInicio);
    }
    if (dataFim) {
      sql += " AND DATE(createdAt) <= ?";
      params.push(dataFim);
    }
    if (setor) {
      sql += " AND setorAtual = ?";
      params.push(setor);
    }
    if (tipo) {
      sql += " AND tipo = ?";
      params.push(tipo);
    }
    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    const [processos] = await pool.query(sql, params);
    const total = processos.length;
    const porStatus = {};
    const porSetor = {};
    const porTipo = {};
    processos.forEach((p) => {
      porStatus[p.status] = (porStatus[p.status] || 0) + 1;
      porSetor[p.setorAtual] = (porSetor[p.setorAtual] || 0) + 1;
      porTipo[p.tipo] = (porTipo[p.tipo] || 0) + 1;
    });

    res.json({ total, porStatus, porSetor, porTipo, processos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listarProcessosImportados = async (req, res) => {
  try {
    const { busca, pagina = 1, limite = 20 } = req.query;
    const offset = (pagina - 1) * limite;

    let sql = `SELECT p.id, p.numero, p.tipo, p.assunto, p.requerente, p.cpfCnpj,
               p.situacao, p.status, p.prioridade, p.createdAt,
               u.nome as responsavelNome
               FROM processos p
               LEFT JOIN users u ON u.id = p.usuarioResponsavel
               WHERE p.situacao = 'importado' AND p.deletedAt IS NULL`;
    const params = [];

    if (busca) {
      sql += ` AND (p.numero LIKE ? OR p.assunto LIKE ? OR p.requerente LIKE ?)`;
      const termo = `%${busca}%`;
      params.push(termo, termo, termo);
    }

    const [processos] = await pool.query(sql + ` ORDER BY p.createdAt DESC LIMIT ? OFFSET ?`, [...params, Number(limite), Number(offset)]);
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM processos WHERE situacao = 'importado' AND deletedAt IS NULL`);

    res.json({
      processos,
      total,
      pagina: Number(pagina),
      limite: Number(limite),
      totalPaginas: Math.ceil(total / limite),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const complementarProcessoImportado = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      "SELECT * FROM processos WHERE id = ?",
      [req.params.id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Processo não encontrado." });
    }
    const processo = rows[0];

    if (processo.situacao !== 'importado') {
      return res.status(400).json({ message: "Este processo não foi importado." });
    }

    const {
      tipo,
      assunto,
      requerente,
      cpfCnpj,
      endereco,
      telefone,
      email,
      descricao,
      setorAtual,
      prioridade,
      prazo,
      especie_id,
      status,
      situacao,
    } = req.body;

    const alteracoes = [];
    const campos = [];
    const valores = [];

    const adicionarCampo = (key, valor) => {
      campos.push(`${key} = ?`);
      valores.push(valor);
      if (processo[key] !== valor) {
        alteracoes.push(`${key}: ${processo[key] || '—'} → ${valor || '—'}`);
      }
    };

    if (tipo !== undefined) adicionarCampo('tipo', tipo);
    if (assunto !== undefined) adicionarCampo('assunto', assunto);
    if (requerente !== undefined) adicionarCampo('requerente', requerente);
    if (cpfCnpj !== undefined) adicionarCampo('cpfCnpj', cpfCnpj);
    if (endereco !== undefined) adicionarCampo('endereco', endereco);
    if (telefone !== undefined) adicionarCampo('telefone', telefone);
    if (email !== undefined) adicionarCampo('email', email);
    if (descricao !== undefined) adicionarCampo('descricao', descricao);
    if (setorAtual !== undefined) adicionarCampo('setorAtual', setorAtual);
    if (prioridade !== undefined) adicionarCampo('prioridade', prioridade);
    if (prazo !== undefined) adicionarCampo('prazo', prazo);
    if (especie_id !== undefined) adicionarCampo('especie_id', especie_id);
    if (status !== undefined) adicionarCampo('status', status);
    if (situacao !== undefined) adicionarCampo('situacao', situacao);

    if (campos.length === 0) {
      return res.status(400).json({ message: "Nenhum campo para atualizar." });
    }

    valores.push(req.params.id);
    await connection.query(
      `UPDATE processos SET ${campos.join(', ')} WHERE id = ?`,
      valores,
    );

    if (alteracoes.length > 0) {
      await connection.query(
        `INSERT INTO historico (processoId, tipo, descricao, usuario, metadata) VALUES (?, ?, ?, ?, ?)`,
        [
          req.params.id,
          'edicao',
          `Processo importado complementado. Campos alterados: ${alteracoes.join('; ')}`,
          req.user.id,
          JSON.stringify({ alteracoes }),
        ],
      );
    }

    const [atualizado] = await connection.query(
      "SELECT * FROM processos WHERE id = ?",
      [req.params.id],
    );

    res.json(atualizado[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};
