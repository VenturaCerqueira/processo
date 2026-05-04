import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function RequerenteEsqueciSenha() {
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
      const response = await api.post('/requerente/auth/esqueci-senha', { email });
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2>Recuperar Senha</h2>
        <h3>Informe seu email para receber o link de recuperação</h3>

        {erro && <div className="alert alert-danger">{erro}</div>}
        {mensagem && <div className="alert alert-success">{mensagem}</div>}

        {enviado ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 16 }}>
              Verifique sua caixa de entrada e a pasta de spam. O link expira em 1 hora.
            </p>
            <Link to="/requerente/login" className="btn btn-primary btn-lg">Voltar para o login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email cadastrado</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="seu.email@exemplo.com" 
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18 }} />
                  Enviando...
                </>
              ) : (
                <>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Enviar Link de Recuperação
                </>
              )}
            </button>
          </form>
        )}

        <div className="login-links">
          <Link to="/requerente/login">Voltar para o login</Link>
        </div>
      </div>
    </div>
  );
}

export default RequerenteEsqueciSenha;
