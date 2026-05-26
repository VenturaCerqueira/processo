import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function PrimeiroAcesso() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');

    if (!email) {
      setErro('Informe seu e-mail.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/primeiro-acesso', { email });
      setMensagem(response.data.message);
      setEnviado(true);
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao processar');
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="brand-title">Primeiro Acesso</h1>
              <p className="brand-subtitle">Crie sua conta no sistema de processo eletrônico</p>
            </div>
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="feature-text">
                  <h4>Conta Ativada</h4>
                  <p>Receba um link para ativar sua conta institucional</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="feature-text">
                  <h4>Acesso Seguro</h4>
                  <p>Suas credenciais protegidas com criptografia</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="feature-text">
                  <h4>Rápido e Prático</h4>
                  <p>Ative sua conta em apenas alguns cliques</p>
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
              <h2>Criar minha conta</h2>
              <p>Informe seu email para receber o link de ativação</p>
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
                <h3 className="success-title">Link Enviado!</h3>
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
                    id="email-ativacao"
                  />
                  <label htmlFor="email-ativacao" className="label-float">Email institucional</label>
                </div>

                <button type="submit" className="btn-ativar" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Link de Ativação</span>
                      <svg width="20" height="20" fill="none" stroke="#ffffff" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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

export default PrimeiroAcesso;