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
      <div className="login-card">
        <div className="logo">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2>Primeiro Acesso</h2>
        <h3>Informe seu e-mail para receber o link de ativação</h3>

        {erro && <div className="alert alert-danger">{erro}</div>}
        {mensagem && <div className="alert alert-success">{mensagem}</div>}

        {enviado ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
              Verifique sua caixa de entrada e a pasta de spam. O link expira em 1 hora.
            </p>
            <Link to="/login" className="btn btn-primary btn-lg">Voltar para o login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 6, verticalAlign: 'text-bottom' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                Email
              </label>
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
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 18, height: 18, marginRight: 8 }} />Enviando...</>
              ) : (
                <>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Enviar Link de Ativação
                </>
              )}
            </button>
          </form>
        )}

        <div className="login-links">
          <Link to="/login">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 6, verticalAlign: 'text-bottom' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PrimeiroAcesso;
