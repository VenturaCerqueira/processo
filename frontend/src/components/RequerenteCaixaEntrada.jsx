import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function RequerenteCaixaEntrada() {
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarProcessos();
  }, []);

  const carregarProcessos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.append('busca', busca);
      const response = await api.get(`/requerente/processos?${params}`);
      setProcessos(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    } finally {
      setLoading(false);
    }
  };

  const processosFiltrados = processos.filter(p =>
    !busca || p.numero.toLowerCase().includes(busca.toLowerCase()) ||
    p.assunto.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) return <div className="page-content"><div className="loading">Carregando seus processos...</div></div>;

  return (
    <div className="page-content">
      <div className="top-bar">
        <h2>Meus Processos</h2>
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: 300 }}
          placeholder="Buscar por número ou assunto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Assunto</th>
                <th>Situação</th>
                <th>Prioridade</th>
                <th>Setor Atual</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {processosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h4>Nenhum processo encontrado</h4>
                    <p>Seus processos aparecerão aqui quando forem cadastrados com seu nome ou email.</p>
                  </td>
                </tr>
              ) : (
                processosFiltrados.map(p => (
                  <tr key={p.id}>
                    <td><Link to={`/processos/${p.id}`} className="table-link">{p.numero}</Link></td>
                    <td>{p.assunto}</td>
                    <td><span className={`badge badge-${p.situacao || 'info'}`}>{p.situacao || 'Novo'}</span></td>
                    <td className={`priority-${p.prioridade}`}>{p.prioridade}</td>
                    <td>{p.setorAtual}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RequerenteCaixaEntrada;

