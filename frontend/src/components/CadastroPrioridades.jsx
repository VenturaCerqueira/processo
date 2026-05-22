import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';

function CadastroPrioridades() {
  const [prioridades, setPrioridades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const [busca, setBusca] = useState('');

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [somenteLeitura, setSomenteLeitura] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({ id: null, nome: '', nivel: 0, cor: '#2563eb' });

  useEffect(() => {
    carregarPrioridades();
  }, []);

  const carregarPrioridades = async () => {
    setLoading(true);
    setErro('');
    try {
      const res = await api.get('/prioridades');
      setPrioridades(res.data);
    } catch {
      setErro('Erro ao carregar prioridades.');
    } finally {
      setLoading(false);
    }
  };

  const contadorLabel = useMemo(() => {
    const n = prioridades.length;
    return `${n} ${n === 1 ? 'registro' : 'registros'}`;
  }, [prioridades.length]);

  const abrirModalNovo = () => {
    setErro('');
    setEditando(false);
    setSomenteLeitura(false);
    setSalvando(false);
    setForm({ id: null, nome: '', nivel: 0, cor: '#2563eb' });
    setMostrarModal(true);
  };

  const abrirModalEditar = (p) => {
    setErro('');
    setEditando(true);
    setSomenteLeitura(false);
    setSalvando(false);
    setForm({
      id: p.id,
      nome: p.nome || '',
      nivel: typeof p.nivel === 'number' ? p.nivel : parseInt(p.nivel) || 0,
      cor: p.cor || '#2563eb',
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

    if (!form.nome.trim()) {
      setErro('Nome é obrigatório.');
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        nome: form.nome,
        nivel: Number(form.nivel) || 0,
        cor: form.cor,
      };

      if (editando) await api.put(`/prioridades/${form.id}`, payload);
      else await api.post('/prioridades', payload);

      fecharModal();
      carregarPrioridades();
    } catch {
      setErro('Erro ao salvar prioridade.');
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id) => {
    setErro('');
    const ok = confirm('Deseja desativar esta prioridade?');
    if (!ok) return;

    try {
      await api.delete(`/prioridades/${id}`);
      carregarPrioridades();
    } catch {
      setErro('Erro ao desativar prioridade.');
    }
  };

  const prioridadesFiltradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return prioridades;
    return prioridades.filter((p) => {
      return (
        (p.nome || '').toLowerCase().includes(q) ||
        String(p.nivel ?? '').toLowerCase().includes(q) ||
        (p.cor || '').toLowerCase().includes(q)
      );
    });
  }, [prioridades, busca]);

  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;

  return (
    <div className="page-content">
      <div className="form-hero">
        <div className="form-hero-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
            <path d="M4 4h16v16H4z" opacity="0.25" />
            <path d="M9 9h6" />
            <path d="M7 4v16" opacity="0.7" />
            <path d="M9 13h6" />
          </svg>
        </div>
        <div className="form-hero-content">
          <h1>Cadastro de Prioridades</h1>
          <p>Gerencie níveis de prioridade com cor e hierarquia.</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="button" className="btn btn-primary" onClick={abrirModalNovo}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              Nova Prioridade
            </span>
          </button>
        </div>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="card" style={{ overflow: 'visible' }}>
        <div className="card-header" style={{ marginBottom: 12 }}>
          <div className="card-title">Lista de Prioridades</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 700 }}>{contadorLabel}</div>
        </div>

        <div className="search-box" style={{ marginBottom: 16 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nome, nível ou cor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => { /* filtro local */ }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              Buscar
            </span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setBusca('')}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <th style={{ width: 340 }}>Nome</th>
                <th style={{ width: 120 }}>Nível</th>
                <th>Cor</th>
                <th style={{ width: 160 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {prioridadesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state small">Nenhuma prioridade encontrada</td>
                </tr>
              ) : (
                prioridadesFiltradas.map((p) => (
                  <tr key={p.id}>
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
                            fontWeight: 900,
                          }}
                        >
                          <span style={{ fontSize: 12 }}>
                            {p.nome ? p.nome.trim().slice(0, 1).toUpperCase() : '—'}
                          </span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              color: 'var(--gray-900)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {p.nome}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{p.nivel}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 20,
                            height: 20,
                            borderRadius: 6,
                            background: p.cor,
                            border: '1px solid var(--gray-200)',
                          }}
                        />
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)' }}>{p.cor}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => abrirModalEditar(p)}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                          Editar
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => excluir(p.id)}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
                          </svg>
                          Desativar
                        </button>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 820 }}>
            <div className="modal-header">
              <div className="form-hero" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                <div className="form-hero-icon" style={{ width: 52, height: 52 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 7h10" opacity="0.25" />
                    <path d="M7 12h10" />
                    <path d="M7 17h10" opacity="0.7" />
                  </svg>
                </div>
                <div className="form-hero-content" style={{ marginTop: 2 }}>
                  <h1 style={{ fontSize: 24 }}>{editando ? 'Editar Prioridade' : 'Cadastrar Prioridade'}</h1>
                  <p style={{ marginTop: 2 }}>Preencha os dados da prioridade.</p>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <form id="form-prioridade" onSubmit={salvar}>
                <div className="form-row-modern">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Nome *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      required
                      placeholder="Ex: Urgente"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group">
                    <label>Nível</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.nivel}
                      onChange={(e) => setForm({ ...form, nivel: parseInt(e.target.value) || 0 })}
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group">
                    <label>Cor</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="color"
                        value={form.cor}
                        onChange={(e) => setForm({ ...form, cor: e.target.value })}
                        style={{ width: 50, height: 40, border: 'none', cursor: 'pointer' }}
                        disabled={somenteLeitura}
                      />
                      <input
                        type="text"
                        className="form-control"
                        value={form.cor}
                        onChange={(e) => setForm({ ...form, cor: e.target.value })}
                        disabled={somenteLeitura}
                      />
                    </div>
                  </div>
                </div>

                {erro && <div className="alert alert-danger" style={{ marginTop: 14 }}>{erro}</div>}

                <div className="modal-footer" style={{ marginTop: 14 }}>
                  <button type="button" className="btn btn-secondary" onClick={fecharModal} disabled={salvando}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancelar
                  </button>
                  {!somenteLeitura && (
                    <button type="submit" className="btn btn-primary" disabled={salvando}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
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

export default CadastroPrioridades;


