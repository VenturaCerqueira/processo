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

  if (loading) return (
    <div className="loading-modern">
      <span className="spinner"></span>
      <span>Carregando...</span>
    </div>
  );

  return (
    <div className="page-content">
      {/* Header */}
      <div className="prioridade-header">
        <div className="prioridade-header-content">
          <div className="prioridade-icon-wrapper">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 7h10" opacity="0.25" />
              <path d="M7 12h10" />
              <path d="M7 17h10" opacity="0.7" />
            </svg>
          </div>
          <div className="prioridade-title-area">
            <h2>Cadastro de Prioridades</h2>
            <p>Gerencie níveis de prioridade com cor e hierarquia</p>
          </div>
        </div>
        <button className="btn btn-primary btn-new-prioridade" onClick={abrirModalNovo}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nova Prioridade
        </button>
        <div className="prioridade-header-decoration"></div>
      </div>

      {/* Stats Card */}
      <div className="prioridade-stats-grid">
        <div className="prioridade-stat-card">
          <div className="prioridade-stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 7h10M7 12h10M7 17h10" />
            </svg>
          </div>
          <div className="prioridade-stat-info">
            <span className="prioridade-stat-number">{prioridades.length}</span>
            <span className="prioridade-stat-label">Total de Prioridades</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="prioridade-controls">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nome, nível ou cor..."
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
      <div className="prioridade-table-card">
        <div className="prioridade-table-header">
          <div className="prioridade-table-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
            </svg>
            <span>Lista de Prioridades</span>
          </div>
          <div className="prioridade-table-count">
            <span className="count-badge">{prioridadesFiltradas.length}</span>
            <span>{prioridadesFiltradas.length === 1 ? 'registro' : 'registros'}</span>
          </div>
        </div>

        <div className="table-container modern-table">
          <table>
            <thead>
              <tr>
                <th>Prioridade</th>
                <th>Nível</th>
                <th>Cor</th>
                <th style={{ width: 140 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {prioridadesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div className="table-empty-state">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M7 7h10M7 12h10M7 17h10" />
                      </svg>
                      <h4>Nenhuma prioridade encontrada</h4>
                      <p>{busca ? 'Tente ajustar sua busca' : 'Cadastre a primeira prioridade'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                prioridadesFiltradas.map((p, index) => (
                  <tr key={p.id} className="prioridade-row" style={{ animationDelay: `${index * 30}ms` }}>
                    <td>
                      <div className="prioridade-cell">
                        <div className="prioridade-icon-box" style={{ background: `${p.cor}20`, borderColor: `${p.cor}40`, color: p.cor }}>
                          <span style={{ fontSize: 14, fontWeight: 800 }}>{p.nome ? p.nome.trim().slice(0, 1).toUpperCase() : '—'}</span>
                        </div>
                        <span className="prioridade-cell-name">{p.nome}</span>
                      </div>
                    </td>
                    <td>
                      <span className="nivel-badge">{p.nivel}</span>
                    </td>
                    <td>
                      <div className="cor-cell">
                        <span className="cor-swatch" style={{ background: p.cor }} />
                        <span className="cor-code">{p.cor}</span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-sm btn-edit" onClick={() => abrirModalEditar(p)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                          Editar
                        </button>
                        <button className="btn btn-sm btn-danger-modern" onClick={() => excluir(p.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                            <path d="M8 12h8" />
                          </svg>
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

      {/* Modal */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content modal-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <div className="modal-header-icon yellow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 7h10M7 12h10M7 17h10" />
                </svg>
              </div>
              <div className="modal-header-text">
                <h2>{editando ? 'Editar Prioridade' : 'Nova Prioridade'}</h2>
                <p>Preencha os dados da prioridade</p>
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
                  <label>Nome da Prioridade <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control-modern"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    required
                    placeholder="Ex: Urgente"
                    disabled={somenteLeitura}
                  />
                </div>

                <div className="form-row-grid">
                  <div className="form-group-modern">
                    <label>Nível</label>
                    <input
                      type="number"
                      className="form-control-modern"
                      value={form.nivel}
                      onChange={(e) => setForm({ ...form, nivel: parseInt(e.target.value) || 0 })}
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>Cor</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        className="color-picker"
                        value={form.cor}
                        onChange={(e) => setForm({ ...form, cor: e.target.value })}
                        disabled={somenteLeitura}
                      />
                      <input
                        type="text"
                        className="form-control-modern"
                        value={form.cor}
                        onChange={(e) => setForm({ ...form, cor: e.target.value })}
                        disabled={somenteLeitura}
                      />
                    </div>
                  </div>
                </div>

                {erro && <div className="alert-modern alert-danger-modern" style={{ marginTop: 16 }}>{erro}</div>}

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary-modern" onClick={fecharModal} disabled={salvando}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    Cancelar
                  </button>

                  {!somenteLeitura && (
                    <button type="submit" className="btn btn-primary-modern yellow" disabled={salvando}>
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

export default CadastroPrioridades;