import React, { useEffect, useRef, useState } from 'react';
import api from '../api';
import { createPortal } from 'react-dom';

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
        minWidth: 180,
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

function AcoesDropdownLinha({ abrirModalEditar, excluir }) {
  const btnRef = useRef(null);

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
          onClick: () => abrirModalEditar(),
        },
        {
          label: 'Desativar',
          variant: 'danger',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              <path d="M8 12h8" />
            </svg>
          ),
          onClick: () => excluir(),
        },
      ]}
    />
  );
}

function CadastroSetores() {
  const [setores, setSetores] = useState([]);
  const [administradores, setAdministradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [somenteLeitura, setSomenteLeitura] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({ id: null, nome: '', sigla: '', administradorUserId: '' });

  useEffect(() => {
    carregarAdministradores();
    carregarSetores();
  }, []);

  const carregarAdministradores = async () => {
    try {
      const res = await api.get('/auth/usuarios-ativos');
      setAdministradores(res.data.filter((u) => u.nivelAcesso === 'admin'));
    } catch {
      // ignora
    }
  };

  const carregarSetores = async () => {
    setLoading(true);
    setErro('');
    try {
      const res = await api.get('/setores');
      setSetores(res.data);
    } catch {
      setErro('Erro ao carregar setores.');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNovo = () => {
    setErro('');
    setEditando(false);
    setSomenteLeitura(false);
    setForm({ id: null, nome: '', sigla: '', administradorUserId: '' });
    setMostrarModal(true);
  };

  const abrirModalEditar = (s) => {
    setErro('');
    setEditando(true);
    setSomenteLeitura(false);
    setForm({
      id: s.id,
      nome: s.nome || '',
      sigla: s.sigla || '',
      administradorUserId: s.administradorUserId ? String(s.administradorUserId) : '',
    });
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setSalvando(false);
    setErro('');
    setSomenteLeitura(false);
  };

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    if (!form.nome.trim()) return;

    setSalvando(true);

    const payloadBase = {
      nome: form.nome,
      sigla: form.sigla || null,
      administradorUserId: form.administradorUserId || null,
      ...(editando ? { ativo: 1 } : {}),
    };

    try {
      if (editando) {
        await api.put(`/setores/${form.id}`, payloadBase);
      } else {
        await api.post('/setores', payloadBase);
      }

      fecharModal();
      await carregarSetores();
    } catch {
      setErro('Erro ao salvar setor.');
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id) => {
    setErro('');
    const ok = confirm('Deseja desativar este setor?');
    if (!ok) return;

    try {
      await api.delete(`/setores/${id}`);
      await carregarSetores();
    } catch {
      setErro('Erro ao desativar setor.');
    }
  };

  const filteredSetores = setores.filter(s =>
    s.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    s.sigla?.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) return (
    <div className="loading-modern">
      <span className="spinner"></span>
      <span>Carregando...</span>
    </div>
  );

  return (
    <div className="page-content">
      {/* Header */}
      <div className="setor-header">
        <div className="setor-header-content">
          <div className="setor-icon-wrapper">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="setor-title-area">
            <h2>Cadastro de Setores</h2>
            <p>Organize os setores e mantenha a tramitação sempre atualizada</p>
          </div>
        </div>
        <button className="btn btn-primary btn-new-setor" onClick={abrirModalNovo}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo Setor
        </button>
        <div className="setor-header-decoration"></div>
      </div>

      {/* Stats Card */}
      <div className="setor-stats-grid">
        <div className="setor-stat-card">
          <div className="setor-stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="setor-stat-info">
            <span className="setor-stat-number">{setores.length}</span>
            <span className="setor-stat-label">Total de Setores</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="setor-controls">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nome ou sigla..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {busca && (
            <button className="search-clear" onClick={() => setBusca('')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="setor-table-card">
        <div className="setor-table-header">
          <div className="setor-table-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
            </svg>
            <span>Lista de Setores</span>
          </div>
          <div className="setor-table-count">
            <span className="count-badge">{filteredSetores.length}</span>
            <span>{filteredSetores.length === 1 ? 'registro' : 'registros'}</span>
          </div>
        </div>

        <div className="table-container modern-table">
          <table>
            <thead>
              <tr>
                <th>Setor</th>
                <th>Responsável</th>
                <th>Sigla</th>
                <th style={{ width: 120 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSetores.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div className="table-empty-state">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      <h4>Nenhum setor encontrado</h4>
                      <p>{busca ? 'Tente ajustar sua busca' : 'Cadastre o primeiro setor'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSetores.map((s, index) => (
                  <tr key={s.id} className="setor-row" style={{ animationDelay: `${index * 30}ms` }}>
                    <td>
                      <div className="setor-cell">
                        <div className="setor-icon-box">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                        </div>
                        <span className="setor-cell-name">{s.nome}</span>
                      </div>
                    </td>
                    <td>
                      <span className="responsavel-name">{s.administradorNome || '—'}</span>
                    </td>
                    <td>
                      <span className="sigla-badge">{String(s.sigla ?? '—').trim() || '—'}</span>
                    </td>
                    <td>
                      <AcoesDropdownLinha
                        abrirModalEditar={() => abrirModalEditar(s)}
                        excluir={() => excluir(s.id)}
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
              <div className="modal-header-icon green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="modal-header-text">
                <h2>{editando ? 'Editar Setor' : 'Novo Setor'}</h2>
                <p>Preencha os dados do setor</p>
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
                <div className="form-group-modern full-width">
                  <label>Nome do Setor <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control-modern"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    required
                    placeholder="Ex: Secretaria de Obras"
                    disabled={somenteLeitura}
                  />
                </div>

                <div className="form-row-grid">
                  <div className="form-group-modern">
                    <label>Sigla</label>
                    <input
                      type="text"
                      className="form-control-modern"
                      value={form.sigla}
                      onChange={(e) => setForm({ ...form, sigla: e.target.value })}
                      placeholder="Ex: SMO"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>Usuário Administrador</label>
                    <select
                      className="form-control-modern"
                      value={form.administradorUserId}
                      onChange={(e) => setForm({ ...form, administradorUserId: e.target.value })}
                      disabled={somenteLeitura}
                    >
                      <option value="">Selecione (opcional)</option>
                      {administradores.map((u) => (
                        <option key={u.id} value={u.id}>{u.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {erro && <div className="alert-modern alert-danger-modern" style={{ marginTop: 16 }}>{erro}</div>}

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary-modern" onClick={fecharModal} disabled={salvando}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    {somenteLeitura ? 'Fechar' : 'Cancelar'}
                  </button>

                  {!somenteLeitura && (
                    <button type="submit" className="btn btn-primary-modern green" disabled={salvando}>
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
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CadastroSetores;