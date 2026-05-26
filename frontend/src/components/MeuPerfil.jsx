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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="page-content">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div className="profile-title-area">
            <h2>Meu Perfil</h2>
            <p>Gerencie suas informações pessoais e segurança</p>
          </div>
        </div>
        <div className="profile-header-decoration"></div>
      </div>

      <div className="profile-content">
        {/* Profile Info Card */}
        <div className="profile-info-card">
          <div className="profile-info-header">
            <div className="profile-info-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <span>Informações da Conta</span>
          </div>

          <div className="profile-data-grid">
            <div className="profile-data-item">
              <label>Nome Completo</label>
              <div className="profile-data-value">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span>{user.nome}</span>
              </div>
            </div>

            <div className="profile-data-item">
              <label>E-mail</label>
              <div className="profile-data-value">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span>{user.email}</span>
              </div>
            </div>

            <div className="profile-data-item">
              <label>Nível de Acesso</label>
              <div className="profile-data-value">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.573 2.43-1.5 3.28a6.018 6.018 0 01-3 1.03c-2.29 0-4.21-1.42-4.97-3.44-.32-.86-.5-1.77-.5-2.72a8 8 0 0116 0c0 1.06-.19 2.06-.5 2.89-.77 2.01-2.66 3.35-4.78 3.35H12c-1.26 0-2.39-.96-2.77-2.23" />
                </svg>
                <span className="access-badge">{user.nivel?.nome || 'Usuário'}</span>
              </div>
            </div>

            <div className="profile-data-item">
              <label>Status</label>
              <div className="profile-data-value">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="status-indicator">
                  <span className="status-dot active"></span>
                  Ativo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form Card */}
        <div className="profile-form-card">
          <div className="profile-form-header">
            <div className="profile-form-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a5.018 5.018 0 01-2.652 2.652 5.018 5.018 0 01-2.652-2.652L13.026 7.69a5.018 5.018 0 012.652-2.652L16.862 4.487z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.5v3.75m-6.75 3h3.75" />
              </svg>
            </div>
            <span>Editar Perfil</span>
          </div>

          {erro && <div className="alert-modern alert-danger-modern">{erro}</div>}
          {mensagem && <div className="alert-modern alert-success-modern">{mensagem}</div>}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row-2">
              <div className="form-group-modern">
                <label>Nome Completo</label>
                <input
                  type="text"
                  className="form-control-modern"
                  value={user.nome}
                  readOnly
                  disabled
                />
              </div>
              <div className="form-group-modern">
                <label>E-mail</label>
                <input
                  type="email"
                  className="form-control-modern"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu.email@exemplo.gov.br"
                />
              </div>
            </div>

            <div className="form-section-divider">
              <span>Segurança</span>
            </div>

            <div className="form-group-modern">
              <label>Senha Atual <span className="required">*</span></label>
              <div className="input-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control-modern"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  required
                  placeholder="Informe sua senha atual"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.94 9.94" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-section-divider sub">
              <span>Trocar Senha (opcional)</span>
            </div>

            <div className="form-row-2">
              <div className="form-group-modern">
                <label>Nova Senha</label>
                <input
                  type="password"
                  className="form-control-modern"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group-modern">
                <label>Confirmar Nova Senha</label>
                <input
                  type="password"
                  className="form-control-modern"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="form-actions">
              <Link to="/" className="btn btn-secondary-modern">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
                Voltar
              </Link>
              <button type="submit" className="btn btn-primary-modern" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-modern"></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MeuPerfil;