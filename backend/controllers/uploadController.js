import pool from '../config/database.js';
import { registrarHistorico } from '../utils/historico.js';

export const uploadDocumento = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }
    const [rows] = await pool.query('SELECT * FROM processos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Processo não encontrado.' });
    }

    const tiposPermitidos = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png', 'text/plain'];
    
    if (!tiposPermitidos.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Tipo de arquivo não permitido.' });
    }

    const [docExistente] = await pool.query(
      'SELECT versao FROM documentos WHERE processoId = ? AND nome = ? ORDER BY versao DESC LIMIT 1',
      [req.params.id, req.file.originalname]
    );
    const versao = docExistente.length > 0 ? docExistente[0].versao + 1 : 1;

    const [result] = await pool.query(
      'INSERT INTO documentos (processoId, nome, tipo, caminho, tamanho, versao, usuario) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.params.id, req.file.originalname, req.file.mimetype, `/uploads/${req.file.filename}`, req.file.size, versao, req.user.id]
    );

    await registrarHistorico(req.params.id, 'documento', `Documento "${req.file.originalname}" anexado (v${versao}).`, req.user.id, { nome: req.file.originalname, versao, tamanho: req.file.size });

    const [doc] = await pool.query('SELECT * FROM documentos WHERE id = ?', [result.insertId]);

    res.status(201).json({ 
      message: 'Documento anexado com sucesso.',
      documento: doc[0],
      notificacao: 'Partes e órgãos envolvidos notificados automaticamente.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listarDocumentos = async (req, res) => {
  try {
    const [documentos] = await pool.query(
      `SELECT d.*, u.nome as usuarioNome FROM documentos d 
       LEFT JOIN users u ON d.usuario = u.id WHERE d.processoId = ? ORDER BY d.dataUpload DESC`,
      [req.params.id]
    );
    res.json(documentos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
