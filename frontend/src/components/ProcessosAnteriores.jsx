import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function ProcessosAnteriores() {
  const [processos, setProcessos] = useState([]);
  const [filtros, setFiltros] = useState({ busca: '', status: '', tipo: '' });
  const [loading, setLoading] = useState(true);
  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    carregarProcessos();
    async function carregarOpcoes() {
      try {
        const tRes = await api.get('/tipos-processo');
        setTipos(tRes.data);
      } catch (error) {
        console.error('Erro ao carregar opções:', error);
      }
    }
    carregarOpcoes();
  }, []);

  const carregarProcessos = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.status) params.append('status', filtros.status);
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.busca) params.append('busca', filtros.busca);
      const response = await api.get(`/processos/anteriores?${params}`);
      setProcessos(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    carregarProcessos();
  };

  const handleLimpar = () => {
    setFiltros({ busca: '', status: '', tipo: '' });
    setTimeout(carregarProcessos, 0);
  };

  if (loading) return (
    <div className="loading">
      <span className="spinner" />
      Carregando...
    </div>
  );

  return (
    <div className="page-content">
      <div className="top-bar">
        <h2>Processos Anteriores</h2>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={handleBuscar}>
          <div className="search-box">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por número, interessado ou assunto..."
              value={filtros.busca}
              onChange={e => setFiltros({...filtros, busca: e.target.value})}
            />
            <button type="submit" className="btn btn-primary">Buscar</button>
            <button type="button" className="btn btn-secondary" onClick={handleLimpar}>Limpar</button>
          </div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <select
              className="form-control"
              value={filtros.status}
              onChange={e => setFiltros({...filtros, status: e.target.value})}
            >
              <option value="">Todos os Status</option>
              <option value="arquivado">Arquivado</option>
              <option value="indeferido">Indeferido</option>
              <option value="aprovado">Deferido</option>
            </select>
            <select
              className="form-control"
              value={filtros.tipo}
              onChange={e => setFiltros({...filtros, tipo: e.target.value})}
            >
              <option value="">Todos os Tipos</option>
              {tipos.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
            </select>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Tipo</th>
                <th>Assunto</th>
                <th>Interessado</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {processos.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h4>Nenhum processo anterior encontrado</h4>
                      <p>Processos arquivados ou indeferidos aparecerão aqui</p>
                    </div>
                  </td>
                </tr>
              ) : processos.map(p => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/processos/${p.id}`} className="table-link">{p.numero}</Link>
                  </td>
                  <td>{p.tipo}</td>
                  <td>{p.assunto}</td>
                  <td>{p.requerente}</td>
                  <td>
                    <span className={`badge badge-${p.situacao || p.status}`}>
                      {p.situacao || p.status}
                    </span>
                  </td>
                  <td className={`priority-${p.prioridade?.toLowerCase()}`}>
                    {p.prioridade}
                  </td>
                  <td>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <Link to={`/processos/${p.id}`} className="btn btn-sm btn-secondary">
                      Ver Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProcessosAnteriores;