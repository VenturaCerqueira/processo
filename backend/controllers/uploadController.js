import pool from '../config/database.js';
import logger from '../config/logger.js';
import { registrarHistorico } from '../utils/historico.js';

export const uploadDocumento = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }
    const [rows] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      logger.warn(`Tentativa de upload em processo inexistente: ${req.params.id}`, {
        processoId: req.params.id,
        arquivo: req.file.originalname,
        usuarioId: req.user.id,
      });
      return res.status(404).json({ message: 'Processo não encontrado.' });
    }

    const tiposPermitidos = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png', 'text/plain'];
    
    if (!tiposPermitidos.includes(req.file.mimetype)) {
      logger.warn(`Upload de tipo de arquivo não permitido`, {
        processoId: req.params.id,
        arquivo: req.file.originalname,
        mimeType: req.file.mimetype,
        usuarioId: req.user.id,
      });
      return res.status(400).json({ message: 'Tipo de arquivo não permitido.' });
    }

    const [docExistente] = await pool.query(
      'SELECT versao FROM documentos WHERE processoId = ? AND nome = ? ORDER BY versao DESC LIMIT 1',
      [req.params.id, req.file.originalname]
    );
    const versao = docExistente.length > 0 ? docExistente[0].versao + 1 : 1;

    const [result] = await pool.query(
      'INSERT INTO documentos (processoId, nome, tipo, caminho, tamanho, versao, usuario, conteudo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.params.id, req.file.originalname, req.file.mimetype, null, req.file.size, versao, req.user.id, req.file.buffer]
    );

    await registrarHistorico(req.params.id, 'documento', `Documento "${req.file.originalname}" anexado (v${versao}).`, req.user.id, { nome: req.file.originalname, versao, tamanho: req.file.size });

    const [doc] = await pool.query('SELECT id, processoId, nome, tipo, caminho, tamanho, versao, dataUpload, usuario FROM documentos WHERE id = ?', [result.insertId]);

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
    logger.error(`Erro ao fazer upload de documento: ${error.message}`, {
      error: error.stack,
      processoId: req.params.id,
      arquivo: req.file?.originalname,
      usuarioId: req.user?.id,
    });
    res.status(500).json({ message: error.message });
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
      'SELECT conteudo, nome, tipo FROM documentos WHERE id = ?',
      [req.params.id]
    );
    if (documentos.length === 0 || !documentos[0].conteudo) {
      return res.status(404).json({ message: 'Documento não encontrado.' });
    }
    res.setHeader('Content-Type', documentos[0].tipo);
    res.setHeader('Content-Disposition', `attachment; filename="${documentos[0].nome}"`);
    res.send(documentos[0].conteudo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
