import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';

function RedefinirSenha() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [token, setToken] = useState(location.state?.token || '');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) { setErro('As senhas não coincidem.'); return; }
    if (novaSenha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return; }
    setLoading(true); setErro(''); setMensagem('');
    try {
      await api.post('/auth/redefinir-senha', { email, token, novaSenha });
      setMensagem('Senha redefinida! Redirecionando...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) { setErro(error.response?.data?.message || 'Erro ao redefinir senha'); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2>Redefinir Senha</h2>
        <h3>Informe o token e sua nova senha</h3>
        
        {erro && <div className="alert alert-danger">{erro}</div>}
        {mensagem && <div className="alert alert-success">{mensagem}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu.email@exemplo.gov.br" />
          </div>
          <div className="form-group">
            <label>Token de Recuperação</label>
            <input type="text" className="form-control" value={token} onChange={e => setToken(e.target.value)} required placeholder="Cole o token aqui" />
          </div>
          <div className="form-group">
            <label>Nova Senha</label>
            <input type="password" className="form-control" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} required placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
          </div>
          <div className="form-group">
            <label>Confirmar Nova Senha</label>
            <input type="password" className="form-control" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} required placeholder="Repita a senha" autoComplete="new-password" />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} />Redefinindo...</> : 'Redefinir Senha'}
          </button>
        </form>

        <div className="login-links">
          <Link to="/login">Voltar para o login</Link>
        </div>
      </div>
    </div>
  );
}

export default RedefinirSenha;

