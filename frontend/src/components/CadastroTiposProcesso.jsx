import React, { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';

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
        minWidth: 170,
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
        onClick={() => setOpen(v => !v)}
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

function AcoesDropdownLinha({ t, viewTipo, abrirModalEditar, excluir, desativarTipo }) {
  const btnRef = useRef(null);

  return (
    <AcoesDropdown
      btnRef={btnRef}
      actions={[
        {
          label: 'Visualizar',
          variant: 'secondary',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ),
          onClick: () => viewTipo(t),
        },
        {
          label: 'Editar',
          variant: 'secondary',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          ),
          onClick: () => abrirModalEditar(t),
        },
        {
          label: 'Excluir',
          variant: 'danger',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          ),
          onClick: () => excluir(t.id),
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
          onClick: () => desativarTipo(t.id),
        },
      ]}
    />
  );
}

function CadastroTiposProcesso() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [somenteInativos, setSomenteInativos] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [somenteLeitura, setSomenteLeitura] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ id: null, nome: '', codigo: '', icone_svg: '' });

  const [especiesDoTipo, setEspeciesDoTipo] = useState([]);
  const [loadingEspeciesDoTipo, setLoadingEspeciesDoTipo] = useState(false);
  const [erroEspeciesDoTipo, setErroEspeciesDoTipo] = useState('');

  useEffect(() => {
    carregarTipos();
  }, [somenteInativos]);

  useEffect(() => {
    const onDocDown = (e) => {
      const target = e.target;
      if (!target) return;
      if (target.closest && target.closest('.actions-dropdown')) return;
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  const carregarTipos = async () => {
    setLoading(true);
    setErro('');
    try {
      const res = await api.get('/tipos-processo', {
        params: somenteInativos ? { incluiInativos: 1 } : undefined,
      });
      setTipos(res.data);
    } catch {
      setErro('Erro ao carregar tipos.');
    } finally {
      setLoading(false);
    }
  };

  const opcoesIcones = useMemo(
    () => [
      { label: 'Criação', path: 'M12 4v16m8-8H4' },
      { label: 'Edição', path: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
      { label: 'Encaminhamento', path: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
      { label: 'Recebimento', path: 'M5 13l4 4L19 7' },
      { label: 'Retorno', path: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6' },
      { label: 'Deferimento', path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      { label: 'Suspensão', path: 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { label: 'Arquivamento', path: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
      { label: 'Indeferimento', path: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
      { label: 'Observação', path: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
      { label: 'Documento', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    ],
    []
  );

  const abrirModalNovo = () => {
    setErro('');
    setEditando(false);
    setSomenteLeitura(false);
    setForm({ id: null, nome: '', codigo: '', icone_svg: '' });
    setMostrarModal(true);
  };

  const abrirModalEditar = (t) => {
    setErro('');
    setEditando(true);
    setSomenteLeitura(false);
    setForm({ id: t.id, nome: t.nome || '', codigo: t.codigo || '', icone_svg: t.icone_svg || '' });
    setMostrarModal(true);
  };

  const viewTipo = async (t) => {
    setErro('');
    setEditando(false);
    setSomenteLeitura(true);
    setForm({ id: t.id, nome: t.nome || '', codigo: t.codigo || '', icone_svg: t.icone_svg || '' });

    setLoadingEspeciesDoTipo(true);
    setErroEspeciesDoTipo('');
    setEspeciesDoTipo([]);
    try {
      const res = await api.get('/especies-processo', { params: { tipo: t.id } });
      setEspeciesDoTipo(res.data || []);
    } catch {
      setErroEspeciesDoTipo('Erro ao carregar espécies vinculadas ao tipo.');
    } finally {
      setLoadingEspeciesDoTipo(false);
    }

    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setSalvando(false);
    setErro('');
    setSomenteLeitura(false);
    setLoadingEspeciesDoTipo(false);
    setEspeciesDoTipo([]);
    setErroEspeciesDoTipo('');
  };

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    if (!form.nome.trim()) return;

    setSalvando(true);
    try {
      const payload = {
        nome: form.nome,
        codigo: form.codigo,
        icone_svg: form.icone_svg,
      };

      if (editando) {
        await api.put(`/tipos-processo/${form.id}`, payload);
      } else {
        await api.post('/tipos-processo', payload);
      }

      fecharModal();
      carregarTipos();
    } catch {
      setErro('Erro ao salvar tipo.');
    } finally {
      setSalvando(false);
    }
  };

  const desativarTipo = async (id) => {
    setErro('');
    const ok = confirm('Deseja desativar este tipo?');
    if (!ok) return;

    try {
      await api.delete(`/tipos-processo/${id}`);
      carregarTipos();
    } catch {
      setErro('Erro ao desativar tipo.');
    }
  };

  const excluir = async (id) => {
    setErro('');
    const ok = confirm('Deseja excluir/desativar este tipo definitivamente?');
    if (!ok) return;

    try {
      await api.delete(`/tipos-processo/${id}`);
      carregarTipos();
    } catch {
      setErro('Erro ao excluir tipo.');
    }
  };

  const iconeSelecionado = opcoesIcones.find((o) => o.path === form.icone_svg);

  const filteredTipos = tipos.filter(t =>
    t.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = tipos.filter(t => t.ativo === 1).length;
  const inactiveCount = tipos.filter(t => t.ativo === 0).length;

  if (loading) return (
    <div className="loading-modern">
      <span className="spinner"></span>
      <span>Carregando...</span>
    </div>
  );

  return (
    <div className="page-content">
      {/* Header */}
      <div className="tipo-header">
        <div className="tipo-header-content">
          <div className="tipo-icon-wrapper">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16v16H4z" opacity="0.25" />
              <path d="M9 9h6M9 13h6M7 4v16" />
            </svg>
          </div>
          <div className="tipo-title-area">
            <h2>Cadastro de Tipos de Processo</h2>
            <p>Organize os tipos e associe um ícone para facilitar a identificação</p>
          </div>
        </div>
        <button className="btn btn-primary btn-new-tipo" onClick={abrirModalNovo}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo Tipo
        </button>
        <div className="tipo-header-decoration"></div>
      </div>

      {/* Stats Cards */}
      <div className="tipo-stats-grid">
        <div className="tipo-stat-card total">
          <div className="tipo-stat-icon purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16v16H4z" />
              <path d="M9 9h6M9 13h6M7 4v16" />
            </svg>
          </div>
          <div className="tipo-stat-info">
            <span className="tipo-stat-number">{tipos.length}</span>
            <span className="tipo-stat-label">Total de Tipos</span>
          </div>
        </div>
        <div className="tipo-stat-card active">
          <div className="tipo-stat-icon green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="tipo-stat-info">
            <span className="tipo-stat-number">{activeCount}</span>
            <span className="tipo-stat-label">Tipos Ativos</span>
          </div>
        </div>
        <div className="tipo-stat-card inactive">
          <div className="tipo-stat-icon gray">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <div className="tipo-stat-info">
            <span className="tipo-stat-number">{inactiveCount}</span>
            <span className="tipo-stat-label">Tipos Inativos</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="tipo-controls">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nome ou código..."
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

        <div className="filter-toggle-group">
          <button
            type="button"
            className={`filter-toggle-btn ${!somenteInativos ? 'active' : ''}`}
            onClick={() => setSomenteInativos(false)}
          >
            Ativos
          </button>
          <button
            type="button"
            className={`filter-toggle-btn ${somenteInativos ? 'active' : ''}`}
            onClick={() => setSomenteInativos(true)}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Types Table */}
      <div className="tipo-table-card">
        <div className="tipo-table-header">
          <div className="tipo-table-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
            </svg>
            <span>Lista de Tipos</span>
          </div>
          <div className="tipo-table-count">
            <span className="count-badge">{filteredTipos.length}</span>
            <span>{filteredTipos.length === 1 ? 'registro' : 'registros'}</span>
          </div>
        </div>

        <div className="table-container modern-table">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Código</th>
                <th>Status</th>
                <th style={{ width: 120 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTipos.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div className="table-empty-state">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 4h16v16H4z" />
                        <path d="M9 9h6M9 13h6M7 4v16" />
                      </svg>
                      <h4>Nenhum tipo encontrado</h4>
                      <p>{searchTerm ? 'Tente ajustar sua busca' : 'Cadastre o primeiro tipo de processo'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTipos.map((t, index) => (
                  <tr key={t.id} className="tipo-row" style={{ animationDelay: `${index * 30}ms` }}>
                    <td>
                      <div className="tipo-cell">
                        <div className={`tipo-icon-box ${t.ativo === 0 ? 'inactive' : ''}`}>
                          {t.icone_svg ? (
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d={t.icone_svg} />
                            </svg>
                          ) : (
                            <span style={{ fontSize: 12, fontWeight: 800 }}>—</span>
                          )}
                        </div>
                        <div className="tipo-cell-info">
                          <span className="tipo-cell-name">{t.nome}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="codigo-badge">{t.codigo || '—'}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${t.ativo === 1 ? 'active' : 'inactive'}`}>
                        <span className={`status-dot ${t.ativo === 1 ? 'active' : ''}`}></span>
                        {t.ativo === 1 ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <AcoesDropdownLinha
                        t={t}
                        viewTipo={viewTipo}
                        abrirModalEditar={abrirModalEditar}
                        excluir={excluir}
                        desativarTipo={desativarTipo}
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
                  <path d="M4 4h16v16H4z" />
                  <path d="M9 9h6M9 13h6M7 4v16" />
                </svg>
              </div>
              <div className="modal-header-text">
                <h2>{somenteLeitura ? 'Detalhes do Tipo' : editando ? 'Editar Tipo' : 'Novo Tipo de Processo'}</h2>
                <p>{somenteLeitura ? 'Informações do tipo e espécies vinculadas' : 'Selecione um ícone e salve o tipo'}</p>
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
                    <label>Nome <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control-modern"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      required
                      placeholder="Ex: Requerimento, Recurso..."
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>Código</label>
                    <input
                      type="text"
                      className="form-control-modern"
                      value={form.codigo}
                      onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                      placeholder="(opcional)"
                      disabled={somenteLeitura}
                    />
                  </div>
                </div>

                <div className="form-group-modern" style={{ gridColumn: '1 / -1' }}>
                  <label>Ícone</label>
                  <div className="icon-picker-modern" role="listbox">
                    {opcoesIcones.map((op) => {
                      const selecionado = op.path === form.icone_svg;
                      return (
                        <button
                          type="button"
                          key={op.path}
                          className={`icon-picker-item-modern ${selecionado ? 'active' : ''}`}
                          onClick={() => !somenteLeitura && setForm({ ...form, icone_svg: op.path })}
                          aria-selected={selecionado}
                          title={op.label}
                          disabled={somenteLeitura}
                        >
                          <span className="icon-picker-svg">
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d={op.path} />
                            </svg>
                          </span>
                          <span className="icon-picker-label">{op.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="icon-preview-wrapper">
                    <div className={`icon-preview-box ${form.icone_svg ? 'has-icon' : ''}`}>
                      {iconeSelecionado ? (
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d={iconeSelecionado.path} />
                        </svg>
                      ) : (
                        <span style={{ fontWeight: 900, fontSize: 14 }}>—</span>
                      )}
                    </div>
                    <span className="icon-preview-label">
                      {iconeSelecionado ? `Selecionado: ${iconeSelecionado.label}` : 'Nenhum ícone selecionado'}
                    </span>
                  </div>
                </div>

                {erro && <div className="alert-modern alert-danger-modern" style={{ marginTop: 16 }}>{erro}</div>}

                {somenteLeitura && (
                  <div className="especies-vinculadas">
                    <div className="especies-header">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span>Espécies vinculadas ao tipo</span>
                    </div>

                    {loadingEspeciesDoTipo ? (
                      <div className="especies-loading">
                        <span className="spinner"></span>
                        Carregando espécies...
                      </div>
                    ) : erroEspeciesDoTipo ? (
                      <div className="alert-modern alert-danger-modern">{erroEspeciesDoTipo}</div>
                    ) : especiesDoTipo.length === 0 ? (
                      <div className="especies-empty">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <p>Nenhuma espécie vinculada a este tipo</p>
                      </div>
                    ) : (
                      <div className="especies-table-wrapper">
                        <table>
                          <thead>
                            <tr>
                              <th>Nome</th>
                              <th>Setor</th>
                              <th>Prazo</th>
                              <th>Dias Úteis</th>
                            </tr>
                          </thead>
                          <tbody>
                            {especiesDoTipo.map((e) => (
                              <tr key={e.id}>
                                <td style={{ fontWeight: 700, color: '#0f172a' }}>{e.nome}</td>
                                <td>{e.setor_nome || '—'}</td>
                                <td>{e.prazo_minimo ?? '—'} a {e.prazo_maximo ?? '—'}</td>
                                <td>{e.dias_uteis ? 'Sim' : 'Não'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary-modern" onClick={fecharModal} disabled={salvando}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    {somenteLeitura ? 'Fechar' : 'Cancelar'}
                  </button>

                  {!somenteLeitura && (
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

export default CadastroTiposProcesso;