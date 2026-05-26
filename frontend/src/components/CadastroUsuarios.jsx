import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import { useModalConfirm } from './ModalConfirmProvider';

function AcoesDropdown({ btnRef, actions }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && btnRef?.current) {
      const btn = btnRef.current;
      const rect = btn.getBoundingClientRect();
      const menuHeight = Math.min(actions.length * 38 + 8, 320);
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      const top =
        spaceBelow >= menuHeight || spaceBelow >= spaceAbove
          ? rect.bottom + 6
          : rect.top - menuHeight - 6;

      setMenuStyle({
        position: 'fixed',
        top,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
        minWidth: 190,
        zIndex: 99999,
      });
    }
  }, [open, actions.length, btnRef]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (btnRef?.current && !btnRef.current.contains(e.target)) {
        const menu = document.querySelector('.actions-dropdown-fixed-menu');
        if (menu && menu.contains(e.target)) return;
        setOpen(false);
      }
    }
    if (!open) return;
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, btnRef]);

  if (!actions || actions.length === 0) return null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="actions-dropdown-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        style={{ position: 'relative', zIndex: open ? 99998 : undefined }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5h.01" />
            <path d="M12 12h.01" />
            <path d="M12 19h.01" />
          </svg>
          Ações
        </span>
      </button>

      {open &&
        createPortal(
          <div className="actions-dropdown-fixed-menu" style={menuStyle}>
            {actions.map((a, i) => (
              <button
                key={i}
                type="button"
                className={`actions-dropdown-item ${a.variant ? `item-${a.variant}` : ''}`}
                onClick={() => {
                  setOpen(false);
                  a.onClick();
                }}
              >
                {a.icon && <span className="actions-dropdown-item-icon" aria-hidden="true">{a.icon}</span>}
                <span>{a.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

function AcoesDropdownLinha({ u, abrirModalEditar, resetarSenha, alterarAtivo }) {
  const btnRef = useRef(null);

  const acaoAtivo = u.ativo ?
    {
      label: 'Inativar',
      variant: 'danger',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18" />
          <path d="M7 7l10 10" />
          <path d="M17 7L7 17" />
        </svg>
      ),
      onClick: () => alterarAtivo(u, 0),
    } :
    {
      label: 'Reativar',
      variant: 'secondary',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-9-9" />
          <path d="M21 3v6h-6" />
        </svg>
      ),
      onClick: () => alterarAtivo(u, 1),
    };

  return (
    <AcoesDropdown
      btnRef={btnRef}
      actions={[
        {
          label: 'Editar',
          variant: 'secondary',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          ),
          onClick: () => abrirModalEditar(u),
        },
        {
          label: 'Resetar senha',
          variant: 'danger',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 3v6h-6" />
            </svg>
          ),
          onClick: () => resetarSenha(u.id),
        },
        acaoAtivo,
      ]}
    />
  );
}

function CadastroUsuarios() {
  const modalConfirm = useModalConfirm();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [setores, setSetores] = useState([]);
  const [niveisAcesso, setNiveisAcesso] = useState([]);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [somenteLeitura, setSomenteLeitura] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    id: null,
    nome: '',
    email: '',
    cargo: '',
    setor: '',
    nivelAcesso: 'operador',
    ativo: 1,
  });

  useEffect(() => {
    (async function init() {
      try {
        const [resUsuarios, resSetores, resNiveis] = await Promise.all([
          api.get('/auth/usuarios'),
          api.get('/setores'),
          api.get('/niveis-acesso'),
        ]);

        setUsuarios(resUsuarios.data || []);
        setSetores(resSetores.data || []);
        setNiveisAcesso((resNiveis.data || []).filter((n) => n.ativo));
      } catch (e) {
        setErro('Erro ao carregar usuários.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const response = await api.get('/auth/usuarios');
      setUsuarios(response.data || []);
    } catch {
      setErro('Erro ao carregar usuários');
    }
  };

  const abrirModalNovo = () => {
    setErro('');
    setMensagem('');
    setEditando(false);
    setSomenteLeitura(false);
    setForm({ id: null, nome: '', email: '', cargo: '', setor: '', nivelAcesso: 'operador', ativo: 1 });
    setMostrarModal(true);
  };

  const abrirModalEditar = (u) => {
    setErro('');
    setMensagem('');
    setEditando(true);
    setSomenteLeitura(false);
    setForm({
      id: u.id,
      nome: u.nome || '',
      email: u.email || '',
      cargo: u.cargo || '',
      setor: u.setor || '',
      nivelAcesso: u.nivelAcesso || 'operador',
      ativo: u.ativo ? 1 : 0,
    });
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setSalvando(false);
    setErro('');
    setMensagem('');
    setSomenteLeitura(false);
  };

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');

    if (!form.nome.trim()) {
      setErro('Nome é obrigatório.');
      return;
    }
    if (!form.email.trim()) {
      setErro('Email é obrigatório.');
      return;
    }
    if (!form.cargo.trim()) {
      setErro('Cargo é obrigatório.');
      return;
    }
    if (!form.setor.trim()) {
      setErro('Setor é obrigatório.');
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        nome: form.nome,
        email: form.email,
        cargo: form.cargo,
        setor: form.setor,
        nivelAcesso: form.nivelAcesso,
        ativo: editando ? form.ativo : 1,
      };

      if (editando) {
        await api.put(`/auth/usuarios/${form.id}`, payload);
        setMensagem('Usuário atualizado!');
      } else {
        const response = await api.post('/auth/registrar', payload);
        setMensagem(`Usuário cadastrado! Senha temporária: ${response.data?.senhaTemporaria || ''}`);
        setForm({ id: null, nome: '', email: '', cargo: '', setor: '', nivelAcesso: 'operador', ativo: 1 });
      }

      fecharModal();
      carregarUsuarios();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar usuário');
    } finally {
      setSalvando(false);
    }
  };

  const resetarSenha = async (id) => {
    const novaSenha = await modalConfirm.prompt({
      title: 'Resetar senha',
      message: 'Informe a nova senha (mínimo 6 caracteres).',
      inputLabel: 'Nova senha',
      inputPlaceholder: 'Digite a nova senha',
      inputType: 'password',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      validate: (value) => {
        if (!value || String(value).length < 6) return false;
        return true;
      },
    });

    if (!novaSenha) return;

    try {
      await api.post(`/auth/usuarios/${id}/resetar-senha`, { novaSenha });
      await modalConfirm.alert({
        title: 'Senha resetada',
        message: 'Senha resetada com sucesso.',
      });
    } catch {
      await modalConfirm.alert({
        title: 'Erro',
        message: 'Erro ao resetar senha.',
      });
    }
  };

  const alterarAtivo = async (u, novoAtivo) => {
    setErro('');
    setMensagem('');

    const ok = await modalConfirm.confirm({
      title: 'Confirmar ação',
      message: novoAtivo === 1 ? 'Deseja reativar este usuário?' : 'Deseja inativar este usuário?',
      variant: 'danger',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
    });
    if (!ok) return;

    try {
      await api.put(`/auth/usuarios/${u.id}`, {
        nome: u.nome || '',
        email: u.email || '',
        cargo: u.cargo || '',
        setor: u.setor || '',
        nivelAcesso: u.nivelAcesso || 'operador',
        ativo: novoAtivo,
      });

      setMensagem(novoAtivo === 1 ? 'Usuário reativado!' : 'Usuário inativado!');
      carregarUsuarios();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao alterar status do usuário');
    }
  };

  const filteredUsers = usuarios.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      u.nome?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.cargo?.toLowerCase().includes(term) ||
      u.setor?.toLowerCase().includes(term)
    );
  });

  const activeUsers = filteredUsers.filter(u => u.ativo);
  const inactiveUsers = filteredUsers.filter(u => !u.ativo);

  if (loading) return (
    <div className="loading-modern">
      <span className="spinner"></span>
      <span>Carregando...</span>
    </div>
  );

  return (
    <div className="page-content">
      {/* Header */}
      <div className="users-header">
        <div className="users-header-content">
          <div className="users-icon-wrapper">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="users-title-area">
            <h2>Cadastro de Usuários</h2>
            <p>Gerencie os usuários do sistema</p>
          </div>
        </div>
        <button className="btn btn-primary btn-new-user" onClick={abrirModalNovo}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo Usuário
        </button>
        <div className="users-header-decoration"></div>
      </div>

      {/* Alerts */}
      {erro && <div className="alert-modern alert-danger-modern">{erro}</div>}
      {mensagem && <div className="alert-modern alert-success-modern">{mensagem}</div>}

      {/* Stats Cards */}
      <div className="users-stats-grid">
        <div className="user-stat-card primary">
          <div className="user-stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <div className="user-stat-info">
            <span className="user-stat-number">{usuarios.length}</span>
            <span className="user-stat-label">Total de Usuários</span>
          </div>
        </div>
        <div className="user-stat-card active">
          <div className="user-stat-icon green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="user-stat-info">
            <span className="user-stat-number">{activeUsers.length}</span>
            <span className="user-stat-label">Usuários Ativos</span>
          </div>
        </div>
        <div className="user-stat-card inactive">
          <div className="user-stat-icon gray">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <div className="user-stat-info">
            <span className="user-stat-number">{inactiveUsers.length}</span>
            <span className="user-stat-label">Usuários Inativos</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="users-search-section">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nome, email, cargo ou setor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-card">
        <div className="users-table-header">
          <div className="users-table-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
            </svg>
            <span>Lista de Usuários</span>
          </div>
          <div className="users-table-count">
            <span className="count-badge">{filteredUsers.length}</span>
            <span>{filteredUsers.length === 1 ? 'registro' : 'registros'}</span>
          </div>
        </div>

        <div className="table-container modern-table">
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Cargo / Setor</th>
                <th>Nível</th>
                <th>Status</th>
                <th style={{ width: 120 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="table-empty-state">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                      <h4>Nenhum usuário encontrado</h4>
                      <p>{searchTerm ? 'Tente ajustar sua busca' : 'Cadastre o primeiro usuário'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, index) => (
                  <tr key={u.id} className="user-row" style={{ animationDelay: `${index * 30}ms` }}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">
                          {u.nome?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-cell-info">
                          <span className="user-cell-name">{u.nome}</span>
                          <span className="user-cell-email">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-role-cell">
                        <span className="user-role">{u.cargo}</span>
                        <span className="user-sector">{u.setor}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`nivel-badge nivel-${u.nivelAcesso?.toLowerCase()}`}>
                        {u.nivelAcesso || 'operador'}
                      </span>
                    </td>
                    <td>
                      {u.primeiroAcesso === 1 ? (
                        <span className="status-badge warning">Pendente</span>
                      ) : (
                        <span className={`status-badge ${u.ativo ? 'active' : 'inactive'}`}>
                          <span className={`status-dot ${u.ativo ? 'active' : ''}`}></span>
                          {u.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      )}
                    </td>
                    <td>
                      <AcoesDropdownLinha
                        u={u}
                        abrirModalEditar={abrirModalEditar}
                        resetarSenha={resetarSenha}
                        alterarAtivo={alterarAtivo}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content modal-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <div className="modal-header-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
              </div>
              <div className="modal-header-text">
                <h2>{editando ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                <p>{editando ? 'Atualize os dados do usuário' : 'Cadastre um novo usuário no sistema'}</p>
              </div>
              <button className="modal-close" onClick={fecharModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body-modern">
              <form onSubmit={salvar}>
                <div className="form-row-grid">
                  <div className="form-group-modern">
                    <label>Nome Completo <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control-modern"
                      value={form.nome}
                      onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
                      required
                      placeholder="Ex: Maria Silva"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>E-mail <span className="required">*</span></label>
                    <input
                      type="email"
                      className="form-control-modern"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      required
                      placeholder="exemplo@dominio.com"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>Cargo <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control-modern"
                      value={form.cargo}
                      onChange={(e) => setForm((prev) => ({ ...prev, cargo: e.target.value }))}
                      required
                      placeholder="Ex: Analista"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>Setor <span className="required">*</span></label>
                    <select
                      className="form-control-modern"
                      value={form.setor}
                      onChange={(e) => setForm((prev) => ({ ...prev, setor: e.target.value }))}
                      required
                      disabled={somenteLeitura}
                    >
                      <option value="">Selecione</option>
                      {setores.map((s) => (
                        <option key={s.id} value={s.nome}>{s.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-modern">
                    <label>Nível de Acesso</label>
                    <select
                      className="form-control-modern"
                      value={form.nivelAcesso}
                      onChange={(e) => setForm((prev) => ({ ...prev, nivelAcesso: e.target.value }))}
                      disabled={somenteLeitura}
                    >
                      {niveisAcesso.length === 0 ? (
                        <option value="operador">Operador</option>
                      ) : (
                        niveisAcesso.map((n) => (
                          <option key={n.id} value={n.nome}>{n.nome}</option>
                        ))
                      )}
                    </select>
                  </div>

                  {editando && (
                    <div className="form-group-modern">
                      <label>Status</label>
                      <select
                        className="form-control-modern"
                        value={form.ativo}
                        onChange={(e) => setForm((prev) => ({ ...prev, ativo: parseInt(e.target.value, 10) }))}
                        disabled={somenteLeitura}
                      >
                        <option value={1}>Ativo</option>
                        <option value={0}>Inativo</option>
                      </select>
                    </div>
                  )}
                </div>

                {erro && <div className="alert-modern alert-danger-modern" style={{ marginTop: 16 }}>{erro}</div>}

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary-modern" onClick={fecharModal} disabled={salvando}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary-modern" disabled={salvando}>
                    {salvando ? (
                      <>
                        <span className="spinner"></span>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                          <polyline points="17 21 17 13 7 13 7 21" />
                          <polyline points="7 3 7 8 15 8" />
                        </svg>
                        {editando ? 'Atualizar' : 'Salvar'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CadastroUsuarios;