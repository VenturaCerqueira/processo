import pool from '../config/database.js';
import logger from '../config/logger.js';
import { gerarNumeroProcesso } from '../utils/helpers.js';
import { registrarHistorico } from '../utils/historico.js';

const MAGIC_BYTES = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
  'application/msword': [[0xD0, 0xCF, 0x11, 0xE0]],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [[0xD0, 0xCF, 0x11, 0xE0]],
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'text/plain': [],
};

const validateMagicBytes = (buffer, mimetype) => {
  if (mimetype === 'text/plain') return true;
  const signatures = MAGIC_BYTES[mimetype];
  if (!signatures) return false;
  for (const sig of signatures) {
    const match = sig.every((byte, i) => buffer[i] === byte);
    if (match) return true;
  }
  return false;
};

export const importarProcesso = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { numeroProcesso } = req.body;

    if (!numeroProcesso || !numeroProcesso.trim()) {
      return res.status(400).json({ message: 'Número do processo é obrigatório.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    const tiposPermitidos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'text/plain',
    ];

    if (!tiposPermitidos.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Tipo de arquivo não permitido.' });
    }

    if (!validateMagicBytes(req.file.buffer, req.file.mimetype)) {
      return res.status(400).json({ message: 'Arquivo corrompido ou extensão não corresponde ao conteúdo.' });
    }

    await connection.beginTransaction();

    // Verificar se já existe processo com mesmo número
    const [existente] = await connection.query(
      'SELECT id FROM processos WHERE numero = ?',
      [numeroProcesso.trim()]
    );

    if (existente.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: `Já existe um processo com o número ${numeroProcesso}.` });
    }

    // Gerar novo número de processo
    const novoNumero = await gerarNumeroProcesso(connection);

    // Criar processo importado com situacao 'importado'
    // O número do processo antigo é salvo apenas no histórico/metadata, não em coluna
    const [result] = await connection.query(
      `INSERT INTO processos (
        numero, tipo, assunto, requerente, cpfCnpj, endereco, telefone, email,
        prioridade, prazo, situacao, status, usuarioResponsavel, criadoPor,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        novoNumero,
        'Importado', // tipo placeholder - usuário complementa no NovoProcesso
        'Processo importado - pendente complementação',
        '', // requerente
        '', // cpfCnpj
        '', // endereco
        '', // telefone
        '', // email
        'Normal', // prioridade default
        null, // prazo
        'importado', // situacao especial para processos pendentes de complementação
        'pendente',
        req.user.id, // usuarioResponsavel
        req.user.id, // criadoPor
      ]
    );

    const processoId = result.insertId;

    // Anexar o documento ao processo
    await connection.query(
      `INSERT INTO documentos (processoId, nome, tipo, caminho, tamanho, versao, usuario, conteudo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        processoId,
        req.file.originalname,
        req.file.mimetype,
        req.file.originalname, // caminho = nome do arquivo quando não há armazenamento em disco
        req.file.size,
        1,
        req.user.id,
        req.file.buffer,
      ]
    );

    // Registrar no histórico
    await connection.query(
      `INSERT INTO historico (processoId, tipo, descricao, usuario, metadata) VALUES (?, ?, ?, ?, ?)`,
      [
        processoId,
        'importacao',
        `Processo importado a partir de ${numeroProcesso}. Documento "${req.file.originalname}" anexado.`,
        req.user.id,
        JSON.stringify({
          processoOrigemNumero: numeroProcesso.trim(),
          nomeArquivo: req.file.originalname,
          tamanho: req.file.size,
        }),
      ]
    );

    // Audit log
    await connection.query(
      `INSERT INTO audit_log (userId, usuarioTipo, acao, recurso, recursoId, detalhes, ip, userAgent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        req.user.tipo || 'staff',
        'IMPORTAR_PROCESSO',
        'processo',
        processoId,
        JSON.stringify({
          numeroGerado: novoNumero,
          processoOrigemNumero: numeroProcesso.trim(),
          nomeArquivo: req.file.originalname,
          tamanho: req.file.size,
        }),
        req.ip,
        req.get('user-agent'),
      ]
    );

    await connection.commit();

    logger.info(`Processo importado com sucesso`, {
      processoId,
      numeroGerado: novoNumero,
      processoOrigemNumero: numeroProcesso.trim(),
      arquivo: req.file.originalname,
      usuarioId: req.user.id,
    });

    res.status(201).json({
      message: 'Processo importado com sucesso. Complete os dados restantes.',
      processo: {
        id: processoId,
        numero: novoNumero,
        processoOrigemNumero: numeroProcesso.trim(),
        situacao: 'importado',
        status: 'pendente',
      },
    });
  } catch (error) {
    await connection.rollback();
    logger.error(`Erro ao importar processo: ${error.message}`, {
      error: error.stack,
      numeroProcesso: req.body.numeroProcesso,
      arquivo: req.file?.originalname,
      usuarioId: req.user?.id,
    });
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};
