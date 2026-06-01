import React, { useState, useEffect } from 'react';
import api from '../api';

function Relatorios() {
  const [filtros, setFiltros] = useState({ dataInicio: '', dataFim: '', setor: '', tipo: '', status: '' });
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tipos, setTipos] = useState([]);
  const [setores, setSetores] = useState([]);
  const [isGenerated, setIsGenerated] = useState(false);

  useEffect(() => {
    async function carregarOpcoes() {
      try {
        const [tRes, sRes] = await Promise.all([api.get('/tipos-processo'), api.get('/setores')]);
        setTipos(tRes.data);
        setSetores(sRes.data);
      } catch (error) {
        console.error('Erro ao carregar opcoes:', error);
      }
    }
    carregarOpcoes();
  }, []);

  const gerarRelatorio = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
      if (filtros.setor) params.append('setor', filtros.setor);
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.status) params.append('status', filtros.status);

      const response = await api.get(`/processos/relatorio?${params}`);
      setRelatorio(response.data);
      setIsGenerated(true);
    } catch {
      alert('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = () => {
    if (!relatorio) return;

    const csv = [
      ['Número', 'Tipo', 'Assunto', 'Interessado', 'Status', 'Setor Atual', 'Data'].join(';'),
      ...(relatorio?.processos || []).map(p =>
        [
          p?.numero || '',
          p?.tipo || '',
          p?.assunto || '',
          p?.requerente || '',
          p?.status || '',
          p?.setorAtual || '',
          p?.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-BR') : ''
        ].join(';')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'relatorio_processos.csv';
    link.click();
  };

  const hasRelatorio = !!relatorio;
  const porStatus = relatorio?.porStatus || {};
  const porSetor = relatorio?.porSetor || {};
  const processos = relatorio?.processos || [];

  const statusColors = {
    'Em Andamento': { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '🔄' },
    'Concluído': { bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', icon: '✅' },
    'Pendente': { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: '⏳' },
    'Arquivado': { bg: 'linear-gradient(135deg, #4b5563 0%, #6b7280 100%)', icon: '📁' },
    'Cancelado': { bg: 'linear-gradient(135deg, #eb3349 0%, #ef4060 100%)', icon: '❌' },
    'Indeferido': { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', icon: '🚫' },
    'default': { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '📋' }
  };

  const getStatusStyle = (status) => {
    const key = Object.keys(statusColors).find(k => k.toLowerCase() === status?.toLowerCase()) || 'default';
    return statusColors[key];
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="report-header">
        <div className="report-header-content">
          <div className="report-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6h13" />
              <path d="M8 12h13" />
              <path d="M8 18h13" />
              <path d="M3 6h.01" />
              <path d="M3 12h.01" />
              <path d="M3 18h.01" />
            </svg>
          </div>
          <div className="report-title-area">
            <h2>Relatórios de Andamento</h2>
            <p>Visualize métricas, filtre por período e exporte os resultados</p>
          </div>
        </div>
        <div className="report-header-decoration"></div>
      </div>

      {/* Filters Card */}
      <div className="filter-section">
        <div className="filter-header">
          <div className="filter-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filtros</span>
          </div>
          <div className="active-filters-count">
            {Object.values(filtros).filter(v => v).length > 0 && (
              <span className="filter-badge">{Object.values(filtros).filter(v => v).length} ativo(s)</span>
            )}
          </div>
        </div>

        <div className="filter-grid">
          <div className="filter-group">
            <label>Data Início</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                className="form-control modern-input"
                value={filtros.dataInicio}
                onChange={e => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Data Fim</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                className="form-control modern-input"
                value={filtros.dataFim}
                onChange={e => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Setor</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <select
                className="form-control modern-input"
                value={filtros.setor}
                onChange={e => setFiltros({ ...filtros, setor: e.target.value })}
              >
                <option value="">Todos os Setores</option>
                {setores.map(s => (
                  <option key={s.id} value={s.nome}>{s.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-group">
            <label>Tipo</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <select
                className="form-control modern-input"
                value={filtros.tipo}
                onChange={e => setFiltros({ ...filtros, tipo: e.target.value })}
              >
                <option value="">Todos os Tipos</option>
                {tipos.map(t => (
                  <option key={t.id} value={t.nome}>{t.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <select
                className="form-control modern-input"
                value={filtros.status}
                onChange={e => setFiltros({ ...filtros, status: e.target.value })}
              >
                <option value="">Todos os Status</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Pendente">Pendente</option>
                <option value="Concluído">Concluído</option>
                <option value="Indeferido">Indeferido</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Arquivado">Arquivado</option>
              </select>
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-generate" onClick={gerarRelatorio} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              <span>Gerando relatório...</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span>Gerar Relatório</span>
            </>
          )}
        </button>
      </div>

      {/* Empty State */}
      {!hasRelatorio && (
        <div className="empty-state-card">
          <div className="empty-state-visual">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M9 17v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2" />
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h4>Pronto para gerar</h4>
          <p>Selecione os filtros acima e clique em "Gerar Relatório" para visualizar as métricas</p>
          <div className="empty-state-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <span>Dica: Deixe os filtros em branco para ver todos os processos</span>
          </div>
        </div>
      )}

      {/* Report Results */}
      {hasRelatorio && (
        <div className="report-results">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card modern-stat primary-stat">
              <div className="stat-glow"></div>
              <div className="stat-icon-area">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-number">{relatorio.total ?? 0}</span>
                <span className="stat-label">Total de Processos</span>
              </div>
              <div className="stat-trend up">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
            </div>

            <div className="stat-card modern-stat">
              <div className="stat-glow blue"></div>
              <div className="stat-icon-area blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-number">{Object.keys(porStatus).length}</span>
                <span className="stat-label">Status Únicos</span>
              </div>
            </div>

            <div className="stat-card modern-stat">
              <div className="stat-glow green"></div>
              <div className="stat-icon-area green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-number">{Object.keys(porSetor).length}</span>
                <span className="stat-label">Setores Envolvidos</span>
              </div>
            </div>

            <div className="stat-card modern-stat">
              <div className="stat-glow purple"></div>
              <div className="stat-icon-area purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-number">{processos.length}</span>
                <span className="stat-label">Processos Listados</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-row">
            {/* Status Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-title">
                  <div className="chart-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <span>Distribuição por Status</span>
                </div>
              </div>
              <div className="chart-body">
                {Object.keys(porStatus).length === 0 ? (
                  <div className="chart-empty">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 15s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                    <p>Nenhum dado disponível</p>
                  </div>
                ) : (
                  <div className="status-bars">
                    {Object.entries(porStatus).map(([status, qtd]) => {
                      const style = getStatusStyle(status);
                      const percentage = ((qtd / relatorio.total) * 100).toFixed(1);
                      return (
                        <div key={status} className="status-bar-item">
                          <div className="status-bar-header">
                            <span className="status-bar-label">{status}</span>
                            <span className="status-bar-value">{qtd}</span>
                          </div>
                          <div className="status-bar-track">
                            <div
                              className="status-bar-fill"
                              style={{ background: style.bg, width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sector Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-title">
                  <div className="chart-icon green">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <span>Distribuição por Setor</span>
                </div>
              </div>
              <div className="chart-body">
                {Object.keys(porSetor).length === 0 ? (
                  <div className="chart-empty">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 15s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                    <p>Nenhum dado disponível</p>
                  </div>
                ) : (
                  <div className="sector-grid">
                    {Object.entries(porSetor).map(([setor, qtd]) => {
                      const percentage = ((qtd / relatorio.total) * 100).toFixed(1);
                      return (
                        <div key={setor} className="sector-item">
                          <div className="sector-info">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                            <span className="sector-name">{setor}</span>
                          </div>
                          <div className="sector-stats">
                            <span className="sector-count">{qtd}</span>
                            <span className="sector-percentage">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="table-card">
            <div className="table-header">
              <div className="table-title">
                <div className="table-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18" />
                  </svg>
                </div>
                <span>Detalhamento dos Processos</span>
              </div>
              <button className="btn btn-success btn-modern" onClick={handleExportar} disabled={processos.length === 0}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Exportar CSV</span>
              </button>
            </div>

            <div className="table-container modern-table">
              <table>
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Tipo</th>
                    <th>Assunto</th>
                    <th>Interessado</th>
                    <th>Status</th>
                    <th>Setor</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {processos.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="table-empty">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                          </svg>
                          <h4>Nenhum processo encontrado</h4>
                          <p>Reajuste os filtros e tente novamente</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    processos.map((p, index) => (
                      <tr key={p.id} className="table-row-animated" style={{ animationDelay: `${index * 30}ms` }}>
                        <td className="cell-number">{p.numero}</td>
                        <td className="celltipo">{p.tipo}</td>
                        <td className="cell-assunto">{p.assunto}</td>
                        <td className="cell-interessado">{p.requerente}</td>
                        <td>
                          <span className="badge-modern" style={getStatusStyle(p.status)}>
                            {p.status}
                          </span>
                        </td>
                        <td className="cell-setor">{p.setorAtual}</td>
                        <td className="cell-data">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-BR') : ''}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Relatorios;