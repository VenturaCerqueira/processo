import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api';

const COLORS = {
  tramitando: '#2563eb',
  aguardando: '#d97706',
  concluido: '#059669',
  indeferido: '#dc2626',
  pausado: '#7c3aed',
  arquivado: '#64748b'
};

function RequerenteDashboard() {
  const [processos, setProcessos] = useState([]);
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

        const response = await api.get('/requerente/processos');
        const processosData = response.data || [];

        if (!mounted) return;

        setUser(userData);
        setProcessos(processosData);
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

  const primeiroNome = user.nome ? user.nome.split(' ')[0] : 'Requerente';

  // Calcular estatísticas
  const estatisticas = {
    total: processos.length,
    tramitando: processos.filter(p => p.situacao === 'encaminhado' || p.situacao === 'recebido').length,
    aguardando: processos.filter(p => p.situacao === 'aguardando' || p.situacao === 'pausado').length,
    concluido: processos.filter(p => p.situacao === 'aprovado').length,
    indeferido: processos.filter(p => p.situacao === 'indeferido').length,
    arquivado: processos.filter(p => p.situacao === 'arquivado').length
  };

  // Dados para o gráfico de pizza (distribuição por status)
  const pieData = [
    { name: 'Em Tramitação', value: estatisticas.tramitando, color: COLORS.tramitando },
    { name: 'Aguardando', value: estatisticas.aguardando, color: COLORS.aguardando },
    { name: 'Concluídos/Deferidos', value: estatisticas.concluido, color: COLORS.concluido },
    { name: 'Indeferidos', value: estatisticas.indeferido, color: COLORS.indeferido },
    { name: 'Arquivados', value: estatisticas.arquivado, color: COLORS.arquivado }
  ].filter(item => item.value > 0);

  // Dados para o gráfico de barras (processos por mês)
  const processosPorMes = {};
  processos.forEach(p => {
    const mes = new Date(p.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    processosPorMes[mes] = (processosPorMes[mes] || 0) + 1;
  });
  
  const barData = Object.entries(processosPorMes)
    .map(([mes, count]) => ({ mes: mes.charAt(0).toUpperCase() + mes.slice(1), processos: count }))
    .slice(-6); // Últimos 6 meses

  const statConfig = [
    { key: 'total', label: 'Total de Processos', color: 'blue' },
    { key: 'tramitando', label: 'Em Tramitação', color: 'blue' },
    { key: 'aguardando', label: 'Aguardando', color: 'yellow' },
    { key: 'concluido', label: 'Deferidos', color: 'green' },
    { key: 'indeferido', label: 'Indeferidos', color: 'red' },
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
      case 'indeferido':
        return (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const calcularPorcentagem = (valor, total) => {
    if (!total) return 0;
    return Math.round((valor / total) * 100);
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

      {/* Charts Section */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 24 }}>
        {/* Pie Chart - Distribution by Status */}
        <div className="card">
          <div className="card-header">
            <div>
              <span className="card-title">Distribuição por Status</span>
              <p className="card-subtitle">Visão geral dos seus processos</p>
            </div>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, 'Processos']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state small">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h4>Nenhum processo encontrado</h4>
              <p>Cadastre um novo processo para começar</p>
            </div>
          )}
        </div>

        {/* Bar Chart - Processes by Month */}
        <div className="card">
          <div className="card-header">
            <div>
              <span className="card-title">Processos por Mês</span>
              <p className="card-subtitle">Quantidade de processos cadastrados</p>
            </div>
          </div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip 
                  formatter={(value) => [value, 'Processos']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="processos" fill="#0f4c81" radius={[4, 4, 0, 0]} name="Processos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state small">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h4>Nenhum dado disponível</h4>
              <p>Cadastre processos para ver estatísticas</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Processes */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <span className="card-title">Meus Processos Recentes</span>
            <p className="card-subtitle">Últimos processos cadastrados</p>
          </div>
          <Link to="/requerente/inbox" className="btn btn-secondary btn-sm">Ver todos</Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Assunto</th>
                <th>Situação</th>
                <th>Prioridade</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {processos.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state small">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h4>Nenhum processo encontrado</h4>
                      <p>Seus processos aparecerão aqui</p>
                    </div>
                  </td>
                </tr>
              ) : (
                processos.slice(0, 5).map(p => (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/processos/${p.id}`} className="table-link">{p.numero}</Link>
                    </td>
                    <td>{p.assunto}</td>
                    <td>
                      <span className={`badge badge-${p.situacao || 'info'}`}>{p.situacao || 'Novo'}</span>
                    </td>
                    <td className={`priority-${p.prioridade}`}>{p.prioridade}</td>
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

export default RequerenteDashboard;
