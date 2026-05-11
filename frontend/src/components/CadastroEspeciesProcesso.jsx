import React, { useEffect, useMemo, useRef, useState } from 'react';
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
                {a.icon && (
                  <span className="actions-dropdown-item-icon" aria-hidden="true">
                    {a.icon}
                  </span>
                )}
                <span>{a.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

function AcoesDropdownLinha({ t, viewEspecie, abrirModalEditar, excluir, desativar }) {
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
          onClick: () => viewEspecie(t),
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
          onClick: () => desativar(t.id),
        },
      ]}
    />
  );
}

function CadastroEspeciesProcesso() {
  const [especies, setEspecies] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [setores, setSetores] = useState([]);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [somenteLeitura, setSomenteLeitura] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    id: null,
    nome: '',
    tipo_processo_id: '',
    setor_id: '',
    prazo_minimo: '',
    prazo_maximo: '',
    dias_uteis: false,
    mensagem_customizada: '',
  });

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    setErro('');
    try {
      const [eRes, tRes, sRes] = await Promise.all([
        api.get('/especies-processo'),
        api.get('/tipos-processo'),
        api.get('/setores'),
      ]);
      setEspecies(eRes.data);
      setTipos(tRes.data);
      setSetores(sRes.data);
    } catch {
      setErro('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setSalvando(false);
    setErro('');
    setSomenteLeitura(false);
  };

  const abrirModalNovo = () => {
    setErro('');
    setEditando(false);
    setSomenteLeitura(false);
    setForm({
      id: null,
      nome: '',
      tipo_processo_id: '',
      setor_id: '',
      prazo_minimo: '',
      prazo_maximo: '',
      dias_uteis: false,
      mensagem_customizada: '',
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (item) => {
    setErro('');
    setEditando(true);
    setSomenteLeitura(false);
    setForm({
      id: item.id,
      nome: item.nome || '',
      tipo_processo_id: item.tipo_processo_id ?? '',
      setor_id: item.setor_id ?? '',
      prazo_minimo: item.prazo_minimo ?? '',
      prazo_maximo: item.prazo_maximo ?? '',
      dias_uteis: !!item.dias_uteis,
      mensagem_customizada: item.mensagem_customizada || '',
    });
    setMostrarModal(true);
  };

  const viewEspecie = (item) => {
    setErro('');
    setEditando(false);
    setSomenteLeitura(true);
    setForm({
      id: item.id,
      nome: item.nome || '',
      tipo_processo_id: item.tipo_processo_id ?? '',
      setor_id: item.setor_id ?? '',
      prazo_minimo: item.prazo_minimo ?? '',
      prazo_maximo: item.prazo_maximo ?? '',
      dias_uteis: !!item.dias_uteis,
      mensagem_customizada: item.mensagem_customizada || '',
    });
    setMostrarModal(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');

    if (!form.nome.trim()) {
      setErro('Nome é obrigatório.');
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        ...form,
        prazo_minimo: form.prazo_minimo !== '' && form.prazo_minimo !== null ? parseInt(form.prazo_minimo) : null,
        prazo_maximo: form.prazo_maximo !== '' && form.prazo_maximo !== null ? parseInt(form.prazo_maximo) : null,
      };

      if (editando) await api.put(`/especies-processo/${form.id}`, payload);
      else await api.post('/especies-processo', payload);

      fecharModal();
      carregarDados();
    } catch {
      setErro('Erro ao salvar especie.');
    } finally {
      setSalvando(false);
    }
  };

  const desativar = async (id) => {
    setErro('');
    const ok = confirm('Deseja desativar esta especie?');
    if (!ok) return;

    try {
      await api.delete(`/especies-processo/${id}`);
      carregarDados();
    } catch {
      setErro('Erro ao desativar especie.');
    }
  };

  const excluir = async (id) => {
    setErro('');
    const ok = confirm('Deseja excluir/desativar esta especie definitivamente?');
    if (!ok) return;

    try {
      await api.delete(`/especies-processo/${id}`);
      carregarDados();
    } catch {
      setErro('Erro ao excluir especie.');
    }
  };

  const getTipoNome = useMemo(
    () => (id) => tipos.find(t => t.id === id)?.nome || '—',
    [tipos]
  );
  const getSetorNome = useMemo(
    () => (id) => setores.find(s => s.id === id)?.nome || '—',
    [setores]
  );

  if (loading)
    return (
      <div className="loading">
        <span className="spinner" />
        Carregando...
      </div>
    );

  const modalTitle = editando ? 'Editar Especie' : somenteLeitura ? 'Visualizar Especie' : 'Novo Especie de Processo';

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
          <h1>Cadastro de Espécies de Processo</h1>
          <p>Configure tipo, setor e prazos para cada espécie.</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="button" className="btn btn-primary" onClick={abrirModalNovo}>
            Nova Espécie
          </button>
        </div>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="card" style={{ overflow: 'visible' }}>
        <div className="card-header" style={{ marginBottom: 12 }}>
          <div className="card-title">Lista de Espécies</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 700 }}>
            {especies.length} {especies.length === 1 ? 'registro' : 'registros'}
          </div>
        </div>

        <div className="table-container">
          <table className="fade-in-list">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo de Processo</th>
                <th>Setor</th>
                <th>Prazo Min</th>
                <th>Prazo Max</th>
                <th>Dias Uteis</th>
                <th style={{ width: 220 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {especies.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state small">
                    Nenhuma espécie cadastrada
                  </td>
                </tr>
              ) : (
                especies.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{item.nome}</td>
                    <td>{item.tipo_processo_nome || getTipoNome(item.tipo_processo_id)}</td>
                    <td>{item.setor_nome || getSetorNome(item.setor_id)}</td>
                    <td>{item.prazo_minimo ?? '—'}</td>
                    <td>{item.prazo_maximo ?? '—'}</td>
                    <td>{item.dias_uteis ? 'Sim' : 'Nao'}</td>
                    <td>
                      <div className="actions-dropdown" style={{ position: 'relative' }}>
                        <AcoesDropdownLinha
                          t={item}
                          viewEspecie={viewEspecie}
                          abrirModalEditar={abrirModalEditar}
                          excluir={excluir}
                          desativar={desativar}
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
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 820 }}
          >
            <div className="modal-header">
              <div className="form-hero" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                <div className="form-hero-icon" style={{ width: 52, height: 52 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" opacity="0.25" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </div>
                <div className="form-hero-content" style={{ marginTop: 2 }}>
                  <h1 style={{ fontSize: 24 }}>{modalTitle}</h1>
                  <p style={{ marginTop: 2 }}>
                    {somenteLeitura ? 'Somente visualização.' : editando ? 'Atualize os dados da espécie.' : 'Preencha os dados para cadastrar.'}
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
                    <label>Tipo de Processo</label>
                    <select
                      className="form-control"
                      value={form.tipo_processo_id}
                      onChange={(e) => setForm({ ...form, tipo_processo_id: e.target.value })}
                      disabled={somenteLeitura}
                    >
                      <option value="">Selecione</option>
                      {tipos.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Setor Responsavel</label>
                    <select
                      className="form-control"
                      value={form.setor_id}
                      onChange={(e) => setForm({ ...form, setor_id: e.target.value })}
                      disabled={somenteLeitura}
                    >
                      <option value="">Selecione</option>
                      {setores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Prazo Minimo (dias)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.prazo_minimo}
                      onChange={(e) => setForm({ ...form, prazo_minimo: e.target.value })}
                      min="0"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group">
                    <label>Prazo Maximo (dias)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.prazo_maximo}
                      onChange={(e) => setForm({ ...form, prazo_maximo: e.target.value })}
                      min="0"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 28 }}>
                    <input
                      type="checkbox"
                      id="dias_uteis"
                      checked={form.dias_uteis}
                      onChange={(e) => setForm({ ...form, dias_uteis: e.target.checked })}
                      disabled={somenteLeitura}
                    />
                    <label htmlFor="dias_uteis" style={{ margin: 0, fontWeight: 700, color: 'var(--gray-700)' }}>
                      Contar dias uteis
                    </label>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Mensagem Customizada</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={form.mensagem_customizada}
                      onChange={(e) => setForm({ ...form, mensagem_customizada: e.target.value })}
                      placeholder="Mensagem que sera exibida nos processos desta especie..."
                      disabled={somenteLeitura}
                    />
                  </div>
                </div>

                {erro && <div className="alert alert-danger" style={{ marginTop: 14 }}>{erro}</div>}

                <div className="modal-footer" style={{ marginTop: 14 }}>
                  <button type="button" className="btn btn-secondary" onClick={fecharModal} disabled={salvando}>
                    {somenteLeitura ? 'Fechar' : 'Cancelar'}
                  </button>

                  {!somenteLeitura && (
                    <button type="submit" className="btn btn-primary" disabled={salvando}>
                      {salvando ? 'Salvando...' : editando ? 'Atualizar' : 'Salvar'}
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

export default CadastroEspeciesProcesso;

