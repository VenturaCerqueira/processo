import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="login-container">
        <div className="login-visual">
          <div className="visual-content">
            <div className="brand-section">
              <div className="brand-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="brand-title">Processo Eletrônico</h1>
              <p className="brand-subtitle">Sistema de Gestão de Processos Administrativos</p>
            </div>
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="feature-text">
                  <h4>Trâmite Digital</h4>
                  <p>Acompanhe seus processos em tempo real</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="feature-text">
                  <h4>Segurança</h4>
                  <p>Seus dados protegidos com criptografia</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="feature-text">
                  <h4>Eficiência</h4>
                  <p>Automatize tarefas e ganhe produtividade</p>
                </div>
              </div>
            </div>
          </div>
          <div className="visual-decoration">
            <div className="decoration-circle circle-1" />
            <div className="decoration-circle circle-2" />
            <div className="decoration-circle circle-3" />
          </div>
        </div>

        <div className="login-form-container">
          <div className="login-card">
            <div className="login-header">
              <h2>Bem-vindo</h2>
              <p>Entre com suas credenciais para acessar</p>
            </div>

            {erro && (
              <div className="alert-modern alert-danger">
                <div className="alert-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="alert-content">
                  <span className="alert-title">Erro</span>
                  <span className="alert-message">{(() => {
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
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group-float">
                <div className="input-icon-float">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16v12H4z" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                </div>
                <input
                  type="email"
                  className="input-float"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder=" "
                  autoComplete="username"
                  id="email-input"
                />
                <label htmlFor="email-input" className="label-float">Email</label>
              </div>

              <div className="input-group-float">
                <div className="input-icon-float">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-float"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  placeholder=" "
                  autoComplete="current-password"
                  id="senha-input"
                />
                <label htmlFor="senha-input" className="label-float">Senha</label>
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              <button type="submit" className="btn-entrar" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="login-actions">
              <Link to="/esqueci-senha" className="btn-esqueci">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Esqueci minha senha
              </Link>
              <Link to="/primeiro-acesso" className="btn-primeiro">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Primeiro acesso?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;