import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../api';
import { createPortal } from 'react-dom';

const PERMISSOES_PADRAO = {
  dashboard: false,
  processos_ver: false,
  processos_criar: false,
  processos_editar: false,
  processos_excluir: false,
  relatorios_ver: false,
  relatorios_gerar: false,
  cadastros_ver: false,
  cadastros_editar: false,
  usuarios_ver: false,
  usuarios_editar: false,
  configuracoes_ver: false,
};

const GRUPOS_PERMISSOES = [
  {
    titulo: 'Dashboard',
    permissoes: [{ key: 'dashboard', label: 'Acessar Dashboard' }],
  },
  {
    titulo: 'Processos',
    permissoes: [
      { key: 'processos_ver', label: 'Visualizar' },
      { key: 'processos_criar', label: 'Criar' },
      { key: 'processos_editar', label: 'Editar' },
      { key: 'processos_excluir', label: 'Excluir' },
    ],
  },
  {
    titulo: 'Relatórios',
    permissoes: [
      { key: 'relatorios_ver', label: 'Visualizar' },
      { key: 'relatorios_gerar', label: 'Gerar' },
    ],
  },
  {
    titulo: 'Cadastros',
    permissoes: [
      { key: 'cadastros_ver', label: 'Visualizar' },
      { key: 'cadastros_editar', label: 'Editar' },
    ],
  },
  {
    titulo: 'Usuários',
    permissoes: [
      { key: 'usuarios_ver', label: 'Visualizar' },
      { key: 'usuarios_editar', label: 'Editar' },
    ],
  },
  {
    titulo: 'Configurações',
    permissoes: [{ key: 'configuracoes_ver', label: 'Visualizar' }],
  },
];

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

      const top = spaceBelow >= menuHeight || spaceBelow >= spaceAbove ? rect.bottom + 6 : rect.top - menuHeight - 6;

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
          label: 'Excluir',
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

function CadastroNiveisAcesso() {
  const [niveis, setNiveis] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [nivelEditando, setNivelEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [form, setForm] = useState({ nome: '', descricao: '', permissoes: { ...PERMISSOES_PADRAO } });
  const [salvando, setSalvando] = useState(false);

  const carregarNiveis = async () => {
    setErro('');
    setLoading(true);
    try {
      const response = await api.get('/niveis-acesso');
      setNiveis(response.data);
    } catch {
      setErro('Erro ao carregar níveis de acesso');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarNiveis();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
    setSalvando(true);
    try {
      await api.post('/niveis-acesso', form);
      setMensagem('Nível de acesso cadastrado!');
      setForm({ nome: '', descricao: '', permissoes: { ...PERMISSOES_PADRAO } });
      setMostrarForm(false);
      await carregarNiveis();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao cadastrar');
    } finally {
      setSalvando(false);
    }
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
    setSalvando(true);
    try {
      await api.put(`/niveis-acesso/${nivelEditando.id}`, nivelEditando);
      setMensagem('Nível de acesso atualizado!');
      setMostrarEditar(false);
      setNivelEditando(null);
      await carregarNiveis();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao atualizar');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este nível de acesso?')) return;
    setErro('');
    setMensagem('');
    setSalvando(true);
    try {
      await api.delete(`/niveis-acesso/${id}`);
      setMensagem('Nível de acesso excluído!');
      await carregarNiveis();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao excluir');
    } finally {
      setSalvando(false);
    }
  };

  const togglePermissao = (target, key) => {
    const next = { ...target.permissoes, [key]: !target.permissoes[key] };
    if (target.id) {
      setNivelEditando({ ...target, permissoes: next });
    } else {
      setForm({ ...target, permissoes: next });
    }
  };

  const renderPermissoesEditor = (target) => (
    <div className="permissoes-editor-modern">
      {GRUPOS_PERMISSOES.map((grupo) => (
        <div key={grupo.titulo} className="permissao-grupo-modern">
          <h4 className="permissao-grupo-titulo">{grupo.titulo}</h4>
          <div className="permissao-itens-modern">
            {grupo.permissoes.map((p) => (
              <label key={p.key} className="permissao-item-modern">
                <input
                  type="checkbox"
                  className="permissao-checkbox"
                  checked={!!target.permissoes[p.key]}
                  onChange={() => togglePermissao(target, p.key)}
                />
                <span className="permissao-checkbox-custom"></span>
                <span className="permissao-label">{p.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const abrirModalNovo = () => {
    setErro('');
    setMensagem('');
    setNivelEditando(null);
    setMostrarEditar(false);
    setForm({ nome: '', descricao: '', permissoes: { ...PERMISSOES_PADRAO } });
    setMostrarForm(true);
  };

  const abrirModalEditar = (n) => {
    setErro('');
    setMensagem('');
    setNivelEditando({ ...n, permissoes: n.permissoes || {} });
    setMostrarForm(false);
    setMostrarEditar(true);
  };

  const fecharModal = () => {
    setMostrarForm(false);
    setMostrarEditar(false);
    setSalvando(false);
    setErro('');
  };

  if (loading) return (
    <div className="loading-modern">
      <span className="spinner"></span>
      <span>Carregando...</span>
    </div>
  );

  return (
    <div className="page-content">
      {/* Header */}
      <div className="nivel-header">
        <div className="nivel-header-content">
          <div className="nivel-icon-wrapper">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="nivel-title-area">
            <h2>Níveis de Acesso e Permissões</h2>
            <p>Defina quais ações cada nível pode executar</p>
          </div>
        </div>
        <button className="btn btn-primary btn-new-nivel" onClick={abrirModalNovo}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo Nível
        </button>
        <div className="nivel-header-decoration"></div>
      </div>

      {/* Alerts */}
      {erro && <div className="alert-modern alert-danger-modern">{erro}</div>}
      {mensagem && <div className="alert-modern alert-success-modern">{mensagem}</div>}

      {/* Stats Cards */}
      <div className="nivel-stats-grid">
        <div className="nivel-stat-card">
          <div className="nivel-stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="nivel-stat-info">
            <span className="nivel-stat-number">{niveis.length}</span>
            <span className="nivel-stat-label">Total de Níveis</span>
          </div>
        </div>
        <div className="nivel-stat-card active">
          <div className="nivel-stat-icon green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="nivel-stat-info">
            <span className="nivel-stat-number">{niveis.filter(n => n.ativo).length}</span>
            <span className="nivel-stat-label">Níveis Ativos</span>
          </div>
        </div>
        <div className="nivel-stat-card inactive">
          <div className="nivel-stat-icon gray">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <div className="nivel-stat-info">
            <span className="nivel-stat-number">{niveis.filter(n => !n.ativo).length}</span>
            <span className="nivel-stat-label">Níveis Inativos</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="nivel-table-card">
        <div className="nivel-table-header">
          <div className="nivel-table-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
            </svg>
            <span>Lista de Níveis de Acesso</span>
          </div>
          <div className="nivel-table-count">
            <span className="count-badge">{niveis.length}</span>
            <span>{niveis.length === 1 ? 'registro' : 'registros'}</span>
          </div>
        </div>

        <div className="table-container modern-table">
          <table>
            <thead>
              <tr>
                <th>Nível</th>
                <th>Descrição</th>
                <th>Permissões</th>
                <th>Status</th>
                <th style={{ width: 120 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {niveis.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="table-empty-state">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <h4>Nenhum nível cadastrado</h4>
                      <p>Cadastre o primeiro nível de acesso</p>
                    </div>
                  </td>
                </tr>
              ) : (
                niveis.map((n, index) => (
                  <tr key={n.id} className="nivel-row" style={{ animationDelay: `${index * 30}ms` }}>
                    <td>
                      <div className="nivel-cell">
                        <div className="nivel-icon-box">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                        </div>
                        <span className="nivel-cell-name">{n.nome}</span>
                      </div>
                    </td>
                    <td>
                      <span className="descricao-text">{n.descricao || '—'}</span>
                    </td>
                    <td>
                      <span className="permissoes-badge">
                        {Object.entries(n.permissoes || {}).filter(([, v]) => v).length} permissões
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${n.ativo ? 'active' : 'inactive'}`}>
                        <span className={`status-dot ${n.ativo ? 'active' : ''}`}></span>
                        {n.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <AcoesDropdownLinha
                        abrirModalEditar={() => abrirModalEditar(n)}
                        excluir={() => handleExcluir(n.id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo */}
      {mostrarForm && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content modal-modern modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <div className="modal-header-icon violet">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="modal-header-text">
                <h2>Cadastrar Novo Nível de Acesso</h2>
                <p>Preencha os dados e selecione as permissões</p>
              </div>
              <button className="modal-close" onClick={fecharModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body-modern">
              <form onSubmit={handleSubmit}>
                <div className="form-row-grid">
                  <div className="form-group-modern">
                    <label>Nome <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control-modern"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      required
                      placeholder="Ex: Admin"
                      disabled={salvando}
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>Descrição</label>
                    <input
                      type="text"
                      className="form-control-modern"
                      value={form.descricao}
                      onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                      placeholder="Breve descrição do nível"
                      disabled={salvando}
                    />
                  </div>
                </div>

                <div className="form-group-modern" style={{ gridColumn: '1 / -1' }}>
                  <label>Permissões</label>
                  {renderPermissoesEditor(form)}
                </div>

                {erro && <div className="alert-modern alert-danger-modern" style={{ marginTop: 16 }}>{erro}</div>}

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary-modern" onClick={fecharModal} disabled={salvando}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary-modern violet" disabled={salvando}>
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
                        Salvar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {mostrarEditar && nivelEditando && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content modal-modern modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <div className="modal-header-icon violet">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
              </div>
              <div className="modal-header-text">
                <h2>Editar Nível de Acesso</h2>
                <p>Atualize informações e permissões</p>
              </div>
              <button className="modal-close" onClick={fecharModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body-modern">
              <form onSubmit={handleEditar}>
                <div className="form-row-grid">
                  <div className="form-group-modern">
                    <label>Nome <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control-modern"
                      value={nivelEditando.nome}
                      onChange={(e) => setNivelEditando({ ...nivelEditando, nome: e.target.value })}
                      required
                      disabled={salvando}
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>Descrição</label>
                    <input
                      type="text"
                      className="form-control-modern"
                      value={nivelEditando.descricao || ''}
                      onChange={(e) => setNivelEditando({ ...nivelEditando, descricao: e.target.value })}
                      disabled={salvando}
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>Status</label>
                    <select
                      className="form-control-modern"
                      value={nivelEditando.ativo}
                      onChange={(e) => setNivelEditando({ ...nivelEditando, ativo: parseInt(e.target.value, 10) })}
                      disabled={salvando}
                    >
                      <option value={1}>Ativo</option>
                      <option value={0}>Inativo</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-modern" style={{ gridColumn: '1 / -1' }}>
                  <label>Permissões</label>
                  {renderPermissoesEditor(nivelEditando)}
                </div>

                {erro && <div className="alert-modern alert-danger-modern" style={{ marginTop: 16 }}>{erro}</div>}

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary-modern" onClick={fecharModal} disabled={salvando}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary-modern violet" disabled={salvando}>
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
                        Atualizar
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

export default CadastroNiveisAcesso;