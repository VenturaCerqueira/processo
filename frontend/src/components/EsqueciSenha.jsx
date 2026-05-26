import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setMensagem('');
    try {
      const response = await api.post('/auth/esqueci-senha', { email });
      setMensagem(response.data.message);
      setEnviado(true);
    } catch (error) { setErro(error.response?.data?.message || 'Erro ao processar'); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-visual">
          <div className="visual-content">
            <div className="brand-section">
              <div className="brand-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="brand-title">Recuperação de Senha</h1>
              <p className="brand-subtitle">Não se preocupe, vamos ajudar você a acessar sua conta</p>
            </div>
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="feature-text">
                  <h4>Email Seguro</h4>
                  <p>Receba um link de recuperação no seu email cadastrado</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="feature-text">
                  <h4>Segurança Total</h4>
                  <p>Seus dados protegidos com criptografia de ponta</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="feature-text">
                  <h4> Rápido e Fácil</h4>
                  <p>Recupere o acesso em apenas alguns passos</p>
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
              <h2>Esqueci minha senha</h2>
              <p>Informe seu email para receber o link de recuperação</p>
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
                  <span className="alert-message">{erro}</span>
                </div>
              </div>
            )}

            {enviado ? (
              <div className="success-container">
                <div className="success-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="success-title">Email Enviado!</h3>
                <p className="success-message">Verifique sua caixa de entrada e a pasta de spam. O link expira em 1 hora.</p>
                <Link to="/login" className="btn-voltar">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  Voltar para o login
                </Link>
              </div>
            ) : (
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
                    id="email-recupera"
                  />
                  <label htmlFor="email-recupera" className="label-float">Email cadastrado</label>
                </div>

                <button type="submit" className="btn-enviar-link" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Link de Recuperação</span>
                      <svg width="20" height="20" fill="none" stroke="#ffffff" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="login-actions">
              <Link to="/login" className="btn-esqueci">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Voltar para o login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EsqueciSenha;