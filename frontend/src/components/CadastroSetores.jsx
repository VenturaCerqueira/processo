import React, { useEffect, useMemo, useRef, useState } from 'react';
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
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const [busca, setBusca] = useState('');

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [somenteLeitura, setSomenteLeitura] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({ id: null, nome: '', sigla: '' });

  useEffect(() => {
    carregarSetores();
  }, []);

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
    setForm({ id: null, nome: '', sigla: '' });
    setMostrarModal(true);
  };

  const abrirModalEditar = (s) => {
    setErro('');
    setEditando(true);
    setSomenteLeitura(false);
    setForm({ id: s.id, nome: s.nome || '', sigla: s.sigla || '' });
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
    try {
      const payload = {
        nome: form.nome,
        sigla: form.sigla || null,
        ...(editando ? { ativo: 1 } : {}),
      };

      if (editando) {
        await api.put(`/setores/${form.id}`, payload);
      } else {
        await api.post('/setores', payload);
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

  const buscar = async () => {
    setErro('');
    // backend não implementa busca por /setores; mantém UX simples: recarrega
    // e limpa se o usuário quiser.
    await carregarSetores();
  };

  const contadorLabel = useMemo(() => {
    const n = setores.length;
    return `${n} ${n === 1 ? 'registro' : 'registros'}`;
  }, [setores.length]);

  if (loading) {
    return (
      <div className="loading">
        <span className="spinner" />Carregando...
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="form-hero">
        <div className="form-hero-icon">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'white' }}
          >
            <path d="M4 4h16v16H4z" opacity="0.25" />
            <path d="M9 9h6M9 13h6" />
            <path d="M7 4v16" />
          </svg>
        </div>

        <div className="form-hero-content">
          <h1>Cadastro de Setores</h1>
          <p>Organize os setores e mantenha a tramitação sempre atualizada.</p>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="button" className="btn btn-primary" onClick={abrirModalNovo}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              Novo Setor
            </span>
          </button>
        </div>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="card" style={{ overflow: 'visible' }}>
        <div className="card-header" style={{ marginBottom: 12 }}>
          <div className="card-title">Lista de Setores</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 700 }}>{contadorLabel}</div>
        </div>

        <div className="search-box" style={{ marginBottom: 16 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nome ou sigla..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button className="btn btn-primary" onClick={buscar}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              Buscar
            </span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setBusca('');
              carregarSetores();
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 16H6L5 6" />
              </svg>
              Limpar
            </span>
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 420 }}>Nome</th>
                <th>Sigla</th>
                <th style={{ width: 160 }}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {setores.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty-state small">
                    Nenhum setor cadastrado
                  </td>
                </tr>
              ) : (
                setores.map((s) => (
                  <tr key={s.id}>
                    <td>{s.nome}</td>
                    <td>{s.sigla || '—'}</td>
                    <td>
                      <div className="actions-dropdown" style={{ position: 'relative' }}>
                        <AcoesDropdownLinha
                          abrirModalEditar={() => abrirModalEditar(s)}
                          excluir={() => excluir(s.id)}
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
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" opacity="0.25" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </div>

                <div className="form-hero-content" style={{ marginTop: 2 }}>
                  <h1 style={{ fontSize: 24 }}>{editando ? 'Editar Setor' : 'Novo Setor'}</h1>
                  <p style={{ marginTop: 2 }}>Preencha os dados do setor.</p>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <form onSubmit={salvar}>
                <div className="form-row-modern">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Nome *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      required
                      placeholder="Ex: Secretaria de Obras"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group">
                    <label>Sigla</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.sigla}
                      onChange={(e) => setForm({ ...form, sigla: e.target.value })}
                      placeholder="Ex: SMO"
                      disabled={somenteLeitura}
                    />
                  </div>
                </div>

                {erro && (
                  <div className="alert alert-danger" style={{ marginTop: 14 }}>
                    {erro}
                  </div>
                )}

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

export default CadastroSetores;

