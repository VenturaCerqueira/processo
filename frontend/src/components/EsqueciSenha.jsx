import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function EsqueciSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenGerado, setTokenGerado] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setMensagem('');
    try {
      const response = await api.post('/auth/esqueci-senha', { email });
      setMensagem(response.data.message);
      setTokenGerado(response.data.token);
    } catch (error) { setErro(error.response?.data?.message || 'Erro ao processar'); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
        </div>
        <h2>Recuperar Senha</h2>
        <h3>Informe seu email para gerar um token de recuperação</h3>
        
        {erro && <div className="alert alert-danger">{erro}</div>}
        {mensagem && <div className="alert alert-success">{mensagem}</div>}

        {tokenGerado ? (
          <div>
            <div className="form-group">
              <label>Token de Recuperação</label>
              <input type="text" className="form-control" value={tokenGerado} readOnly onClick={e => e.target.select()} style={{ fontFamily: 'monospace', backgroundColor: '#f8fafc', fontSize: 13 }} />
            </div>
            <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 16 }}>Este token expira em 1 hora. Copie-o para redefinir sua senha.</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/redefinir-senha', { state: { email, token: tokenGerado } })}>
              Redefinir Senha
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email cadastrado</label>
              <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu.email@exemplo.gov.br" />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} />Gerando...</> : 'Gerar Token de Recuperação'}
            </button>
          </form>
        )}

        <div className="login-links">
          <Link to="/login">Voltar para o login</Link>
        </div>
      </div>
    </div>
  );
}

export default EsqueciSenha;

