import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function Dashboard() {
  const [estatisticas, setEstatisticas] = useState({ total: 0, tramitando: 0, aguardando: 0, concluido: 0, indeferido: 0, urgentes: 0 });
  const [caixaResumo, setCaixaResumo] = useState({ novo: 0, recebido: 0, aprovado: 0, pausado: 0, arquivado: 0 });
  const [processosRecentes, setProcessosRecentes] = useState([]);
  const [processosUrgentes, setProcessosUrgentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ nome: '' });
  const navigate = useNavigate();

  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Bom dia';
    if (hora < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const formatarData = () => {
    const hoje = new Date();
    return hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const calcularPorcentagem = (valor, total) => {
    if (!total) return 0;
    return Math.round((valor / total) * 100);
  };

  useEffect(() => {
    let mounted = true;

    const carregarDados = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        let userData = { nome: '' };
        if (storedUser) {
          try {
            userData = JSON.parse(storedUser);
          } catch (e) {
            userData = { nome: '' };
          }
        }

        const [processosRes, caixaRes] = await Promise.all([
          api.get('/processos'),
          api.get('/processos/caixa-entrada')
        ]);
        const processos = processosRes.data || [];
        const caixaData = caixaRes.data || { processos: [] };
        const meusProcessos = caixaData.processos || [];

        if (!mounted) return;

        setUser(userData);
        setEstatisticas({
          total: processos.length,
          tramitando: processos.filter(p => p.status === 'tramitando').length,
          aguardando: processos.filter(p => p.status === 'aguardando').length,
          concluido: processos.filter(p => p.status === 'concluido').length,
          indeferido: processos.filter(p => p.status === 'indeferido').length,
          urgentes: processos.filter(p => p.prioridade === 'urgente').length
        });
        setCaixaResumo({
          encaminhado: meusProcessos.filter(p => p.situacao === 'encaminhado').length,
          recebido: meusProcessos.filter(p => p.situacao === 'recebido' || p.situacao === 'retornado').length,
          aprovado: meusProcessos.filter(p => p.situacao === 'aprovado').length,
          pausado: meusProcessos.filter(p => p.situacao === 'pausado').length,
          arquivado: meusProcessos.filter(p => p.situacao === 'arquivado').length,
          indeferido: meusProcessos.filter(p => p.situacao === 'indeferido').length
        });
        setProcessosRecentes(meusProcessos.slice(0, 5));
        setProcessosUrgentes(meusProcessos.filter(p => p.prioridade === 'urgente').slice(0, 5));
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    carregarDados();

    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <span className="spinner" />
        Carregando...
      </div>
    );
  }

  const primeiroNome = user.nome ? user.nome.split(' ')[0] : 'Usuário';

  const statConfig = [
    { key: 'total', label: 'Total de Processos', color: 'blue' },
    { key: 'tramitando', label: 'Em Tramitação', color: 'yellow' },
    { key: 'aguardando', label: 'Aguardando', color: 'purple' },
    { key: 'concluido', label: 'Concluídos', color: 'green' },
    { key: 'indeferido', label: 'Indeferidos', color: 'red' },
    { key: 'urgentes', label: 'Urgentes', color: 'red' },
  ];

  const renderIcon = (key) => {
    switch (key) {
      case 'total':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'tramitando':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'aguardando':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
      case 'concluido':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'urgentes':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-content">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div>
          <h1 className="welcome-title">{getSaudacao()}, {primeiroNome}!</h1>
          <p className="welcome-date">{formatarData()}</p>
        </div>
        <Link to="/processos/novo" className="btn btn-primary">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Processo
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-action-card" onClick={() => navigate('/processos/novo')}>
          <div className="quick-action-icon blue">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span>Novo Processo</span>
        </button>
        <button className="quick-action-card" onClick={() => navigate('/caixa-entrada')}>
          <div className="quick-action-icon purple">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <span>Caixa de Entrada</span>
        </button>
        <button className="quick-action-card" onClick={() => navigate('/relatorios')}>
          <div className="quick-action-icon green">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span>Relatórios</span>
        </button>
        <button className="quick-action-card" onClick={() => navigate('/usuarios')}>
          <div className="quick-action-icon yellow">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span>Usuários</span>
        </button>
      </div>

      {/* Caixa de Entrada Resumo */}
      {user.id && (() => {
        const totalMeus = Object.values(caixaResumo).reduce((a, b) => a + b, 0);
        if (totalMeus === 0) return null;
        const caixaConfig = [
          { key: 'encaminhado', label: 'Encaminhados', color: 'blue' },
          { key: 'recebido', label: 'Recebidos', color: 'yellow' },
          { key: 'aprovado', label: 'Deferidos', color: 'green' },
          { key: 'pausado', label: 'Suspensos', color: 'purple' },
          { key: 'arquivado', label: 'Arquivados', color: 'red' },
          { key: 'indeferido', label: 'Indeferidos', color: 'red' },
        ];
        return (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div>
                <span className="card-title">Minha Caixa de Entrada</span>
                <p className="card-subtitle">Processos atribuídos a você</p>
              </div>
              <Link to="/caixa-entrada" className="btn btn-secondary btn-sm">Ver todos</Link>
            </div>
            <div className="stats-grid" style={{ marginBottom: 0 }}>
              {caixaConfig.map(cfg => (
                <div className="stat-card" key={cfg.key} style={{ cursor: 'pointer' }} onClick={() => navigate('/caixa-entrada')}>
                  <div className="stat-card-top">
                    <div className={`stat-icon ${cfg.color}`}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h3>{caixaResumo[cfg.key]}</h3>
                      <p>{cfg.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Stats Grid */}
      <div className="stats-grid">
        {statConfig.map(stat => {
          const valor = estatisticas[stat.key];
          const pct = calcularPorcentagem(valor, estatisticas.total);
          return (
            <div className="stat-card" key={stat.key}>
              <div className="stat-card-top">
                <div className={`stat-icon ${stat.color}`}>
                  {renderIcon(stat.key)}
                </div>
                <div className="stat-content">
                  <h3>{valor}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
              <div className="stat-progress-wrapper">
                <div className="stat-progress-bar">
                  <div
                    className={`stat-progress-fill ${stat.color}`}
                    style={{ width: pct + '%' }}
                  />
                </div>
                <span className="stat-progress-text">{pct}% do total</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Recent Processes */}
        <div className="card dashboard-card-main">
          <div className="card-header">
            <div>
              <span className="card-title">Processos Recentes</span>
              <p className="card-subtitle">Últimos processos cadastrados no sistema</p>
            </div>
            <Link to="/caixa-entrada" className="btn btn-secondary btn-sm">Ver todos</Link>
          </div>
          <div className="table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Tipo</th>
                  <th>Requerente</th>
                  <th>Status</th>
                  <th>Setor</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {processosRecentes.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state small">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h4>Nenhum processo encontrado</h4>
                        <p>Cadastre um novo processo para começar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  processosRecentes.map(p => (
                    <tr key={p.id}>
                      <td>
                        <Link to={`/processos/${p.id}`} className="table-link">{p.numero}</Link>
                      </td>
                      <td>{p.tipo}</td>
                      <td>{p.requerente}</td>
                      <td>
                        <span className={`badge badge-${p.status}`}>{p.status}</span>
                      </td>
                      <td>{p.setorAtual}</td>
                      <td>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Urgent Processes */}
        <div className="card dashboard-card-side">
          <div className="card-header">
            <div>
              <span className="card-title">Urgentes</span>
              <p className="card-subtitle">Processos com prioridade alta</p>
            </div>
          </div>
          <div className="priority-list">
            {processosUrgentes.length === 0 ? (
              <div className="empty-state small">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4>Nenhum processo urgente</h4>
                <p>Todos os processos estão sob controle</p>
              </div>
            ) : (
              processosUrgentes.map(p => (
                <Link to={`/processos/${p.id}`} className="priority-item" key={p.id}>
                  <div className="priority-dot" />
                  <div className="priority-info">
                    <span className="priority-number">{p.numero}</span>
                    <span className="priority-meta">{p.requerente} &bull; {p.setorAtual}</span>
                  </div>
                  <span className={`badge badge-${p.status}`}>{p.status}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

