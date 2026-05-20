import React, { useState, useEffect } from 'react';
import api from '../api';

function Relatorios() {
  const [filtros, setFiltros] = useState({ dataInicio: '', dataFim: '', setor: '', tipo: '' });
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tipos, setTipos] = useState([]);
  const [setores, setSetores] = useState([]);

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

      const response = await api.get(`/processos/relatorio?${params}`);
      setRelatorio(response.data);
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

  return (
    <div className="page-content">
      <div className="top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="reports-hero-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 6h13" />
              <path d="M8 12h13" />
              <path d="M8 18h13" />
              <path d="M3 6h.01" />
              <path d="M3 12h.01" />
              <path d="M3 18h.01" />
            </svg>
          </span>
          <div>
            <h2 style={{ margin: 0 }}>Relatórios de Andamento</h2>
            <p style={{ marginTop: 4, color: 'var(--gray-500)', fontWeight: 600, fontSize: 13 }}>
              Filtre por período, setor e tipo — visualize e exporte os resultados.
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="form-row" style={{ marginBottom: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Data Início</label>
            <input
              type="date"
              className="form-control"
              value={filtros.dataInicio}
              onChange={e => setFiltros({ ...filtros, dataInicio: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Data Fim</label>
            <input
              type="date"
              className="form-control"
              value={filtros.dataFim}
              onChange={e => setFiltros({ ...filtros, dataFim: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Setor</label>
            <select
              className="form-control"
              value={filtros.setor}
              onChange={e => setFiltros({ ...filtros, setor: e.target.value })}
            >
              <option value="">Todos</option>
              {setores.map(s => (
                <option key={s.id} value={s.nome}>
                  {s.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Tipo</label>
            <select
              className="form-control"
              value={filtros.tipo}
              onChange={e => setFiltros({ ...filtros, tipo: e.target.value })}
            >
              <option value="">Todos</option>
              {tipos.map(t => (
                <option key={t.id} value={t.nome}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn btn-primary" onClick={gerarRelatorio} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" style={{ width: 16, height: 16 }} />Gerando...
            </>
          ) : (
            'Gerar Relatório'
          )}
        </button>
      </div>

      {!hasRelatorio && (
        <div className="card" style={{ padding: 26 }}>
          <div className="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <h4>Selecione os filtros e gere o relatório</h4>
            <p>Você verá o total por status, por setor e o detalhamento dos processos.</p>
          </div>
        </div>
      )}

      {hasRelatorio && (
        <>
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-icon blue">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"
                  />
                </svg>
              </div>
              <div className="stat-content">
                <h3>{relatorio.total ?? 0}</h3>
                <p>Total de Processos</p>
              </div>
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 24 }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Por Status</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(porStatus).length === 0 ? (
                      <tr>
                        <td colSpan={2}>
                          <div className="empty-state small">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.54-1.052.42-2.277-.33-2.83a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.?"
                              />
                            </svg>
                            <h4>Nenhum dado</h4>
                            <p>Não há processos para os filtros selecionados.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      Object.entries(porStatus).map(([status, qtd]) => (
                        <tr key={status}>
                          <td>
                            <span className={`badge badge-${status}`}>{status}</span>
                          </td>
                          <td>{qtd}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Por Setor</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Setor</th>
                      <th>Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(porSetor).length === 0 ? (
                      <tr>
                        <td colSpan={2}>
                          <div className="empty-state small">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12h6m-6 4h6"
                              />
                            </svg>
                            <h4>Nenhum dado</h4>
                            <p>Não há processos para os filtros selecionados.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      Object.entries(porSetor).map(([setor, qtd]) => (
                        <tr key={setor}>
                          <td>{setor}</td>
                          <td>{qtd}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Detalhamento</span>
              <button
                className="btn btn-success btn-sm"
                onClick={handleExportar}
                disabled={processos.length === 0}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Exportar CSV
              </button>
            </div>

            <div className="table-container">
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
                <tbody className="fade-in-list">
                  {processos.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <h4>Nenhum processo encontrado</h4>
                          <p>Reajuste os filtros e tente novamente.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    processos.map(p => (
                      <tr key={p.id}>
                        <td>{p.numero}</td>
                        <td>{p.tipo}</td>
                        <td>{p.assunto}</td>
                        <td>{p.requerente}</td>
                        <td>
                          <span className={`badge badge-${p.status}`}>{p.status}</span>
                        </td>
                        <td>{p.setorAtual}</td>
                        <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-BR') : ''}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Relatorios;

