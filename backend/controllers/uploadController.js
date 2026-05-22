import pool from '../config/database.js';
import logger from '../config/logger.js';
import { registrarHistorico } from '../utils/historico.js';

// Magic bytes para validação de tipos de arquivo
const MAGIC_BYTES = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  'application/msword': [[0xD0, 0xCF, 0x11, 0xE0]], // OLE2
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [[0xD0, 0xCF, 0x11, 0xE0]], // OLE2 (same as doc)
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'text/plain': [], // Text doesn't have magic bytes
};

/**
 * Valida magic bytes do arquivo para evitar spoofing de MIME type
 */
const validateMagicBytes = (buffer, mimetype) => {
  // Texto não tem validação de magic bytes
  if (mimetype === 'text/plain') return true;

  const signatures = MAGIC_BYTES[mimetype];
  if (!signatures) return false;

  for (const sig of signatures) {
    const match = sig.every((byte, i) => buffer[i] === byte);
    if (match) return true;
  }
  return false;
};

export const uploadDocumento = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    const [rows] = await connection.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      logger.warn(`Tentativa de upload em processo inexistente: ${req.params.id}`, {
        processoId: req.params.id,
        arquivo: req.file.originalname,
        usuarioId: req.user.id,
      });
      return res.status(404).json({ message: 'Processo não encontrado.' });
    }

    const tiposPermitidos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png', 'text/plain'
    ];

    if (!tiposPermitidos.includes(req.file.mimetype)) {
      logger.warn(`Upload de tipo de arquivo não permitido`, {
        processoId: req.params.id,
        arquivo: req.file.originalname,
        mimeType: req.file.mimetype,
        usuarioId: req.user.id,
      });
      return res.status(400).json({ message: 'Tipo de arquivo não permitido.' });
    }

    // Validar magic bytes para prevenir spoofing
    if (!validateMagicBytes(req.file.buffer, req.file.mimetype)) {
      logger.warn(`Upload com magic bytes inválidos (possível spoofing)`, {
        processoId: req.params.id,
        arquivo: req.file.originalname,
        mimeType: req.file.mimetype,
        usuarioId: req.user.id,
      });
      return res.status(400).json({ message: 'Arquivo corrompido ou extensão não corresponde ao conteúdo.' });
    }

    await connection.beginTransaction();

    const [docExistente] = await connection.query(
      'SELECT versao FROM documentos WHERE processoId = ? AND nome = ? ORDER BY versao DESC LIMIT 1',
      [req.params.id, req.file.originalname]
    );
    const versao = docExistente.length > 0 ? docExistente[0].versao + 1 : 1;

    const [result] = await connection.query(
      'INSERT INTO documentos (processoId, nome, tipo, caminho, tamanho, versao, usuario, conteudo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.params.id, req.file.originalname, req.file.mimetype, null, req.file.size, versao, req.user.id, req.file.buffer]
    );

    await connection.query(
      `INSERT INTO historico (processoId, tipo, descricao, usuario, metadata) VALUES (?, ?, ?, ?, ?)`,
      [req.params.id, 'documento', `Documento "${req.file.originalname}" anexado (v${versao}).`, req.user.id,
       JSON.stringify({ nome: req.file.originalname, versao, tamanho: req.file.size })]
    );

    // Audit log
    await connection.query(
      `INSERT INTO audit_log (userId, usuarioTipo, acao, recurso, recursoId, detalhes, ip, userAgent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.tipo || 'staff', 'UPLOAD_DOCUMENTO', 'documento', result.insertId,
       JSON.stringify({ processoId: req.params.id, nome: req.file.originalname, tamanho: req.file.size }),
       req.ip, req.get('user-agent')]
    );

    await connection.commit();

    const [doc] = await pool.query(
      'SELECT id, processoId, nome, tipo, caminho, tamanho, versao, dataUpload, usuario FROM documentos WHERE id = ?',
      [result.insertId]
    );

    logger.info(`Documento enviado com sucesso`, {
      processoId: req.params.id,
      documentoId: result.insertId,
      arquivo: req.file.originalname,
      mimeType: req.file.mimetype,
      tamanho: req.file.size,
      versao,
      usuarioId: req.user.id,
    });

    res.status(201).json({
      message: 'Documento anexado com sucesso.',
      documento: doc[0],
      notificacao: 'Partes e órgãos envolvidos notificados automaticamente.'
    });
  } catch (error) {
    await connection.rollback();
    logger.error(`Erro ao fazer upload de documento: ${error.message}`, {
      error: error.stack,
      processoId: req.params.id,
      arquivo: req.file?.originalname,
      usuarioId: req.user?.id,
    });
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

export const listarDocumentos = async (req, res) => {
  try {
    const [documentos] = await pool.query(
      `SELECT d.id, d.processoId, d.nome, d.tipo, d.tamanho, d.versao, d.dataUpload, u.nome as usuarioNome FROM documentos d
       LEFT JOIN users u ON d.usuario = u.id WHERE d.processoId = ? ORDER BY d.dataUpload DESC`,
      [req.params.id]
    );
    res.json(documentos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadDocumento = async (req, res) => {
  try {
    const [documentos] = await pool.query(
      `SELECT d.conteudo, d.nome, d.tipo, d.processoId, p.numero as processoNumero FROM documentos d
       LEFT JOIN processos p ON d.processoId = p.id WHERE d.id = ?`,
      [req.params.id]
    );
    if (documentos.length === 0 || !documentos[0].conteudo) {
      return res.status(404).json({ message: 'Documento não encontrado.' });
    }

    const doc = documentos[0];

    // Registrar download no audit log
    await pool.query(
      `INSERT INTO audit_log (userId, usuarioTipo, acao, recurso, recursoId, detalhes, ip, userAgent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, req.user.tipo || 'staff', 'DOWNLOAD_DOCUMENTO', 'documento', req.params.id,
       JSON.stringify({ processoId: doc.processoId, processoNumero: doc.processoNumero, nome: doc.nome }),
       req.ip, req.get('user-agent')]
    );

    res.setHeader('Content-Type', doc.tipo);
    res.setHeader('Content-Disposition', `attachment; filename="${doc.nome}"`);
    res.send(doc.conteudo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
