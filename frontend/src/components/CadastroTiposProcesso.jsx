import React, { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';

/* =========================================================
   Dropdown de Ações — renderiza via Portal no body
   usando position:fixed para nunca ser cortado por overflow.
   ========================================================= */
function AcoesDropdown({ btnRef, actions }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && btnRef?.current) {
      const btn = btnRef.current;
      const rect = btn.getBoundingClientRect();
      const menuHeight = Math.min(actions.length * 38 + 8, 320); // estimativa
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      const top =
        spaceBelow >= menuHeight || spaceBelow >= spaceAbove
          ? rect.bottom + 6 // abre para baixo
          : rect.top - menuHeight - 6; // abre para cima

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
          label: 'View',
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
              <path d="M16.5 3.5a2.1 2 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
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


  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [somenteLeitura, setSomenteLeitura] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ id: null, nome: '', codigo: '', icone_svg: '' });

  // ====== Especies vinculadas ao tipo (VIEW) ======
  const [especiesDoTipo, setEspeciesDoTipo] = useState([]);
  const [loadingEspeciesDoTipo, setLoadingEspeciesDoTipo] = useState(false);
  const [erroEspeciesDoTipo, setErroEspeciesDoTipo] = useState('');
  // Dropdown via Portal/FIXED (nenhuma necessidade de dropdownAbertoId/estilo no estado)


  useEffect(() => {
    carregarTipos();
  }, [somenteInativos]);

  
  useEffect(() => {
    const onDocDown = (e) => {
      const target = e.target;
      if (!target) return;

      // Se clicou dentro do menu ou no botão, mantém
      if (target.closest && target.closest('.actions-dropdown')) return;
      setDropdownAbertoId(null);
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

    // carrega as espécies vinculadas ao tipo
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

  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;

  return (
    <div className="page-content">
      <div className="form-hero">
        <div className="form-hero-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
            <path d="M4 4h16v16H4z" opacity="0.25" />
            <path d="M9 9h6M9 13h6M7 4v16" />
          </svg>
        </div>
        <div className="form-hero-content">
          <h1>Cadastro de Tipos de Processo</h1>
          <p>Organize os tipos e associe um ícone para facilitar a identificação.</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="button" className="btn btn-primary" onClick={abrirModalNovo}>
            Novo Tipo
          </button>
        </div>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="card" style={{ overflow: 'visible' }}>
        <div className="card-header" style={{ marginBottom: 12 }}>
          <div className="card-title">Lista de Tipos</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 700 }}>
            {tipos.length} {tipos.length === 1 ? 'registro' : 'registros'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)' }}>
            Exibir:
          </label>
          <button
            type="button"
            className="btn btn-sm"
            style={{
              background: somenteInativos ? 'var(--gray-100)' : 'var(--primary)15',
              borderColor: 'var(--gray-200)',
              color: 'var(--gray-900)',
            }}
            onClick={() => setSomenteInativos(false)}
          >
            Ativos
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{
              background: somenteInativos ? 'var(--primary)15' : 'var(--gray-100)',
              borderColor: 'var(--gray-200)',
              color: 'var(--gray-900)',
            }}
            onClick={() => setSomenteInativos(true)}
          >
            Todos (inclui Inativos)
          </button>
        </div>


        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 320 }}>Nome</th>
                <th>Codigo</th>
                <th style={{ width: 140 }}>Status</th>
                <th style={{ width: 160 }}>Ações</th>

              </tr>
            </thead>
            <tbody>
              {tipos.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty-state small">Nenhum tipo cadastrado</td>
                </tr>
              ) : (
                tipos.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 12,
                            background: 'var(--primary)15',
                            border: '1px solid var(--primary)30',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: 'var(--primary)',
                          }}
                          aria-hidden="true"
                        >
                          {t.icone_svg ? (
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d={t.icone_svg} />
                            </svg>
                          ) : (
                            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--gray-400)' }}>—</span>
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {t.nome}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{t.codigo || '—'}</td>
                    <td>
                      <span
                        className={`badge ${t.ativo === 0 ? 'arquivado' : 'concluido'}`}
                      >
                        {t.ativo === 0 ? 'Inativo' : 'Ativo'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-dropdown" style={{ position: 'relative' }}>

                        <AcoesDropdownLinha
                          t={t}
                          viewTipo={viewTipo}
                          abrirModalEditar={abrirModalEditar}
                          excluir={excluir}
                          desativarTipo={desativarTipo}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarModal && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <div className="form-hero" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                <div className="form-hero-icon" style={{ width: 52, height: 52 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" opacity="0.25" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </div>
                <div className="form-hero-content" style={{ marginTop: 2 }}>
                  <h1 style={{ fontSize: 24 }}>{editando ? 'Editar Tipo' : 'Novo Tipo de Processo'}</h1>
                  <p style={{ marginTop: 2 }}>
                    Selecione um ícone e salve o tipo.
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <form onSubmit={salvar}>
                <div className="form-row-modern">
                  <div className="form-group">
                    <label>Nome *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      required
                      placeholder="Ex: Requerimento, Recurso..."
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group">
                    <label>Codigo</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.codigo}
                      onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                      placeholder="(opcional)"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Ícone (selecionável)</label>

                    <div className="icon-picker" role="listbox" aria-label="Selecione um ícone">
                      {opcoesIcones.map((op) => {
                        const selecionado = op.path === form.icone_svg;
                        return (
                          <button
                            type="button"
                            key={op.path}
                            className={`icon-picker-item ${selecionado ? 'active' : ''}`}
                            onClick={() => !somenteLeitura && setForm({ ...form, icone_svg: op.path })}
                            aria-selected={selecionado}
                            title={op.label}
                            disabled={somenteLeitura}
                            style={{ opacity: somenteLeitura ? 0.65 : 1, cursor: somenteLeitura ? 'not-allowed' : 'pointer' }}
                          >
                            <span className="icon-picker-svg" aria-hidden="true">
                              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d={op.path} />
                              </svg>
                            </span>
                            <span className="icon-picker-label">{op.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          background: form.icone_svg ? 'var(--primary)15' : 'var(--gray-100)',
                          border: `1px solid ${form.icone_svg ? 'var(--primary)30' : 'var(--gray-200)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: form.icone_svg ? 'var(--primary)' : 'var(--gray-400)',
                          flexShrink: 0,
                        }}
                      >
                        {iconeSelecionado ? (
                          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d={iconeSelecionado.path} />
                          </svg>
                        ) : (
                          <span style={{ fontWeight: 900, fontSize: 12 }}>—</span>
                        )}
                      </div>
                      <div style={{ color: 'var(--gray-500)', fontSize: 13, fontWeight: 600 }}>
                        {iconeSelecionado ? `Selecionado: ${iconeSelecionado.label}` : 'Nenhum ícone selecionado.'}
                      </div>
                    </div>
                  </div>
                </div>

                {erro && <div className="alert alert-danger" style={{ marginTop: 14 }}>{erro}</div>}

                {somenteLeitura && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8 }}>
                      Espécies vinculadas ao tipo
                    </div>

                    {loadingEspeciesDoTipo ? (
                      <div className="empty-state small" style={{ padding: 16 }}>
                        Carregando espécies...
                      </div>
                    ) : erroEspeciesDoTipo ? (
                      <div className="alert alert-danger">{erroEspeciesDoTipo}</div>
                    ) : especiesDoTipo.length === 0 ? (
                      <div className="empty-state small" style={{ padding: 16 }}>
                        Nenhuma espécie vinculada a este tipo.
                      </div>
                    ) : (
                      <div className="table-container">
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
                                <td style={{ fontWeight: 800, color: 'var(--gray-900)' }}>{e.nome}</td>
                                <td>{e.setor_nome || '—'}</td>
                                <td>
                                  {e.prazo_minimo ?? '—'} a {e.prazo_maximo ?? '—'}
                                </td>
                                <td>{e.dias_uteis ? 'Sim' : 'Não'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                <div className="modal-footer" style={{ marginTop: 14 }}>
                  <button type="button" className="btn btn-secondary" onClick={fecharModal} disabled={salvando}>
                    {somenteLeitura ? 'Fechar' : 'Cancelar'}
                  </button>

                  {!somenteLeitura && (
                    <button type="submit" className="btn btn-primary" disabled={salvando}>
                      {salvando ? 'Salvando...' : (editando ? 'Atualizar' : 'Salvar')}
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

