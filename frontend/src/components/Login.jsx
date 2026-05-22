import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { accessToken, user } = response.data;
      localStorage.setItem('token', accessToken);
      onLogin(user);
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2>Processo Eletrônico</h2>
        <h3>Entre com suas credenciais para acessar o sistema</h3>
        
        {erro && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              aria-hidden="true"
              style={{
                display: 'inline-flex',
                width: 28,
                height: 28,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(220, 38, 38, 0.12)',
                color: '#dc2626',
              }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span>{(() => {
              const msg = erro || '';
              const lower = msg.toLowerCase();

              if (lower.includes('email') && lower.includes('não encontrado')) {
                return 'E-mail não encontrado.';
              }

              if (lower.includes('credenciais inválidas')) {
                return 'E-mail ou senha inválidos.';
              }

              if (lower.includes('senha')) {
                return 'Senha incorreta.';
              }

              if (lower.includes('email') && (lower.includes('invál') || lower.includes('invalid'))) {
                return 'E-mail inválido.';
              }

              return msg;
            })()}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <div className="input-group">
              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16v12H4z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </span>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu.email@exemplo.gov.br"
                autoComplete="username"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Senha</label>
            <div className="input-group">
              <span className="input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </span>
              <input
                type="password"
                className="form-control"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? (
              <><span className="spinner" style={{ width: 18, height: 18, marginRight: 8 }} />Entrando...</>
            ) : (
              <>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Entrar no Sistema
              </>
            )}
          </button>
        </form>

        <div className="login-actions">
          <Link to="/esqueci-senha" className="btn btn-secondary">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Esqueci senha
          </Link>
          <Link to="/primeiro-acesso" className="btn btn-secondary">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Primeiro acesso
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

