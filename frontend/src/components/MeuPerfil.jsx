import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function MeuPerfil({ onUpdateUser }) {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setEmail(parsed.email || '');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');

    if (!senhaAtual) {
      setErro('Informe sua senha atual para confirmar as alterações.');
      return;
    }

    if (novaSenha && novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (novaSenha && novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const payload = { email, senhaAtual };
      if (novaSenha) payload.novaSenha = novaSenha;

      const response = await api.put('/auth/perfil', payload);
      const updatedUser = response.data.user;
      setMensagem(response.data.message);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUpdateUser(updatedUser);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="login-page" style={{ minHeight: 'calc(100vh - 0px)', alignItems: 'flex-start', paddingTop: 40 }}>
      <div className="login-card" style={{ maxWidth: 480, width: '100%' }}>
        <div className="logo">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2>Meu Perfil</h2>
        <h3>Atualize seu e-mail ou senha</h3>

        {erro && <div className="alert alert-danger">{erro}</div>}
        {mensagem && <div className="alert alert-success">{mensagem}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input type="text" className="form-control" value={user.nome} readOnly disabled />
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu.email@exemplo.gov.br"
            />
          </div>
          <div className="form-group">
            <label>Senha Atual <span style={{ color: 'var(--danger)', fontWeight: 700 }}>*</span></label>
            <input
              type="password"
              className="form-control"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              required
              placeholder="Informe sua senha atual"
              autoComplete="current-password"
            />
          </div>
          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--gray-200)' }} />
          <div className="form-group">
            <label>Nova Senha <span style={{ color: 'var(--gray-500)', fontWeight: 400 }}>(opcional)</span></label>
            <input
              type="password"
              className="form-control"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label>Confirmar Nova Senha</label>
            <input
              type="password"
              className="form-control"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita a nova senha"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18, marginRight: 8 }} />Salvando...</> : 'Salvar Alterações'}
          </button>
        </form>

        <div className="login-links">
          <Link to="/">Voltar para o Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

export default MeuPerfil;

