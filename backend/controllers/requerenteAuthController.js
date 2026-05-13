import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { hashSenha, compararSenha } from '../utils/helpers.js';
import { randomBytes } from 'crypto';
import { enviarEmailRecuperacao } from '../utils/email.js'; // Reuse if possible
import { detectarTipoPessoa, normalizarCpfCnpj, onlyDigits } from '../utils/cpfCnpj.js';


const gerarToken = (id, tipo = 'requerente') => {
  return jwt.sign({ id, tipo }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const [rows] = await pool.query('SELECT * FROM requerentes WHERE email = ? AND ativo = 1', [email]);
    const requerente = rows[0];
    if (!requerente) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    const senhaValida = await compararSenha(senha, requerente.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }
    const token = gerarToken(requerente.id, 'requerente');
    res.json({
      token,
      user: {
        id: requerente.id,
        nome: requerente.nome,
        email: requerente.email,
        nivelAcesso: requerente.nivelAcesso || 'requerente',
        tipo: 'requerente'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registrar = async (req, res) => {
  try {
    const {
      nome,
      cpfCnpj,
      tipoPessoa,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
      telefone,
      email,
      senha,
      representantes
    } = req.body;

    const normalizadoCpfCnpj = cpfCnpj ? normalizarCpfCnpj(cpfCnpj) : null;
    const tipoDetectado = detectarTipoPessoa(normalizadoCpfCnpj);
    const tipoPessoaFinal = tipoDetectado || tipoPessoa || 'fisica';

    const [existe] = await pool.query('SELECT id FROM requerentes WHERE email = ? OR cpfCnpj = ?', [email, normalizadoCpfCnpj]);

    if (existe.length > 0) {
      return res.status(400).json({ message: 'Email ou CPF/CNPJ já cadastrado.' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres.' });
    }

    const senhaHash = await hashSenha(senha);
    const [result] = await pool.query(
      `INSERT INTO requerentes (nome, cpfCnpj, tipoPessoa, endereco, numero, complemento, bairro, cidade, estado, cep, telefone, email, senha, nivelAcesso)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'requerente')`,
      [nome, normalizadoCpfCnpj, tipoPessoaFinal, endereco, numero, complemento, bairro, cidade, estado, cep, telefone, email, senhaHash]
    );

    const requerenteId = result.insertId;

    // Salvar representantes (1 requerente pode ter vários)
    const list = Array.isArray(representantes) ? representantes : [];
    if (list.length > 0) {
      const inserts = list.map((r) => [
        requerenteId,
        r.nome,
        r.cpfCnpj || null,
        r.telefone || null,
        r.email || null,
        r.funcao || null
      ]);


      const invalid = inserts.find((i) => !i[1] || String(i[1]).trim().length === 0);

      if (invalid) {
        return res.status(400).json({ message: 'Representante inválido: campo nome é obrigatório.' });
      }

      await pool.query(
        `INSERT INTO requerente_representantes (requerenteId, nome, cpfCnpj, telefone, email, ativo)
         VALUES ?`,
        [inserts.map((i) => [i[0], i[1], i[2], i[3], i[4], 1])]
      );
    }

    const [rows] = await pool.query('SELECT id, nome, email, nivelAcesso FROM requerentes WHERE id = ?', [requerenteId]);
    const newUser = rows[0];

    res.status(201).json({
      message: 'Cadastro realizado com sucesso!',
      user: {
        id: newUser.id,
        nome: newUser.nome,
        email: newUser.email,
        nivelAcesso: newUser.nivelAcesso,
        tipo: 'requerente'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const esqueciSenha = async (req, res) => {
  try {
    const { email } = req.body;
    const [rows] = await pool.query('SELECT id, nome FROM requerentes WHERE email = ? AND ativo = 1', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Email não encontrado.' });
    }
    const token = randomBytes(32).toString('hex');
    const expiraEm = new Date();
    expiraEm.setHours(expiraEm.getHours() + 1);
    await pool.query(
      'INSERT INTO recuperacao_senha (email, token, expiraEm) VALUES (?, ?, ?)',
      [email, token, expiraEm]
    );
    try {
      await enviarEmailRecuperacao(email, token, rows[0].nome); // Reuse staff email util
    } catch {
      // Log error but don't fail
    }
    res.json({ message: 'Link de recuperação enviado para o email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const redefinirSenha = async (req, res) => {
  try {
    const { email, token, novaSenha } = req.body;
    const [rows] = await pool.query(
      'SELECT * FROM recuperacao_senha WHERE email = ? AND token = ? AND usado = 0 AND expiraEm > NOW() ORDER BY createdAt DESC LIMIT 1',
      [email, token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }
    const senhaHash = await hashSenha(novaSenha);
    await pool.query('UPDATE requerentes SET senha = ? WHERE email = ?', [senhaHash, email]);
    await pool.query('UPDATE recuperacao_senha SET usado = 1 WHERE id = ?', [rows[0].id]);
    res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const perfil = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome, email, cpfCnpj, tipoPessoa, ativo FROM requerentes WHERE id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

