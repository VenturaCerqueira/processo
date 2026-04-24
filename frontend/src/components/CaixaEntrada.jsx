import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function CaixaEntrada() {
  const navigate = useNavigate();
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabAtiva, setTabAtiva] = useState('encaminhado');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { setUser(null); }
    }
    carregarProcessos();
  }, []);

  const carregarProcessos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/processos/caixa-entrada');
      setProcessos(response.data.processos || []);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    } finally {
      setLoading(false);
    }
  };

  const situacoes = [
    { key: 'encaminhado', label: 'Encaminhado', color: 'blue' },
    { key: 'recebido', label: 'Recebido', color: 'yellow' },
    { key: 'aprovado', label: 'Aprovado', color: 'green' },
    { key: 'pausado', label: 'Pausado', color: 'purple' },
    { key: 'arquivado', label: 'Arquivado', color: 'red' },
  ];

  const meusProcessos = user?.id
    ? processos.filter(p => p.usuarioResponsavel === user.id || p.usuarioResponsavel == user.id)
    : [];

  const processosFiltrados = meusProcessos.filter(p => p.situacao === tabAtiva);

  const contagem = situacoes.reduce((acc, s) => {
    acc[s.key] = meusProcessos.filter(p => p.situacao === s.key).length;
    return acc;
  }, {});

  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;

  return (
    <div className="page-content">
      <div className="top-bar" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Caixa de Entrada</h2>
        <button className="btn btn-primary" onClick={() => navigate('/processos/novo')}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Processo
        </button>
      </div>

      <div className="card" style={{ marginBottom: 24, padding: '12px 24px' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {situacoes.map(s => (
            <button
              key={s.key}
              className={`btn ${tabAtiva === s.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTabAtiva(s.key)}
              style={{ position: 'relative' }}
            >
              {s.label}
              {contagem[s.key] > 0 && (
                <span style={{
                  marginLeft: 8,
                  background: tabAtiva === s.key ? 'rgba(255,255,255,0.25)' : 'var(--danger)',
                  color: tabAtiva === s.key ? 'inherit' : 'white',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {contagem[s.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Tipo</th>
                <th>Assunto</th>
                <th>Requerente</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Setor</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {processosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state small">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <h4>Nenhum processo {situacoes.find(s => s.key === tabAtiva)?.label.toLowerCase()}</h4>
                      <p>Os processos atribuídos a você aparecerão aqui</p>
                    </div>
                  </td>
                </tr>
              ) : (
                processosFiltrados.map(p => (
                  <tr key={p.id}>
                    <td><Link to={`/processos/${p.id}`} className="table-link">{p.numero}</Link></td>
                    <td>{p.tipo}</td>
                    <td>{p.assunto}</td>
                    <td>{p.requerente}</td>
                    <td className={`priority-${p.prioridade}`}>{p.prioridade}</td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
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

export default CaixaEntrada;

