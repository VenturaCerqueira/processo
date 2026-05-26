import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function Dashboard() {
  const [estatisticas, setEstatisticas] = useState({ total: 0, tramitando: 0, aguardando: 0, concluido: 0, indeferido: 0, urgentes: 0 });
  const [caixaResumo, setCaixaResumo] = useState({ novo: 0, recebido: 0, aprovado: 0, pausado: 0, arquivado: 0, indeferido: 0 });
  const [processosRecentes, setProcessosRecentes] = useState([]);
  const [processosUrgentes, setProcessosUrgentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ nome: '' });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
  const [selectedDeadline, setSelectedDeadline] = useState(null);
  const [processosPorPrazo, setProcessosPorPrazo] = useState({});
  const navigate = useNavigate();

  const getSaudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Bom dia';
    if (hora < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const parseDateValue = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  };

  const getDateKey = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date) => {
    if (!date) return 'Sem data selecionada';
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const buildCalendarDays = (month, grouped) => {
    const days = [];
    const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const startDay = new Date(firstOfMonth);
    startDay.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

    for (let index = 0; index < 42; index += 1) {
      const current = new Date(startDay);
      current.setDate(startDay.getDate() + index);
      const key = getDateKey(current);
      days.push({
        date: current,
        key,
        count: grouped[key] ? grouped[key].length : 0,
        isCurrentMonth: current.getMonth() === month.getMonth(),
        isToday: getDateKey(current) === getDateKey(new Date()),
      });
    }

    return days;
  };

  const changeMonth = (amount) => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
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

        const contaPorSituacao = (lista) => ({
          encaminhado: lista.filter(p => p.situacao === 'encaminhado').length,
          recebido: lista.filter(p => p.situacao === 'recebido' || p.situacao === 'retornado').length,
          aprovado: lista.filter(p => p.situacao === 'aprovado').length,
          pausado: lista.filter(p => p.situacao === 'pausado').length,
          arquivado: lista.filter(p => p.situacao === 'arquivado').length,
          indeferido: lista.filter(p => p.situacao === 'indeferido').length,
        });

        setUser(userData);
        const totalGeral = processos.length;
        const geral = contaPorSituacao(processos);

        setEstatisticas({
          total: totalGeral,
          tramitando: geral.recebido + geral.encaminhado,
          aguardando: geral.pausado,
          concluido: geral.aprovado,
          indeferido: geral.indeferido,
          urgentes: processos.filter(p => p.prioridade === 'urgente').length,
        });

        const resumo = contaPorSituacao(meusProcessos);
        setCaixaResumo({
          novo: 0,
          recebido: resumo.recebido,
          aprovado: resumo.aprovado,
          pausado: resumo.pausado,
          arquivado: resumo.arquivado,
          indeferido: resumo.indeferido,
        });

        const ordenarPorDataDesc = (lista) => [...lista].sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });

        setProcessosRecentes(ordenarPorDataDesc(meusProcessos).slice(0, 5));
        setProcessosUrgentes(ordenarPorDataDesc(meusProcessos.filter(p => p.prioridade === 'urgente')).slice(0, 5));

        const groupedByPrazo = processos.reduce((acc, processo) => {
          const prazoDate = parseDateValue(processo.prazo);
          if (!prazoDate) return acc;
          const key = getDateKey(prazoDate);
          if (!acc[key]) acc[key] = [];
          acc[key].push(processo);
          return acc;
        }, {});

        setProcessosPorPrazo(groupedByPrazo);

        const todayKey = getDateKey(new Date());
        setSelectedDeadline(groupedByPrazo[todayKey] ? new Date() :
          Object.keys(groupedByPrazo).sort()[0] ? parseDateValue(Object.keys(groupedByPrazo).sort()[0]) : new Date());
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
    { key: 'total', label: 'Total de Processos', color: 'blue', gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' },
    { key: 'tramitando', label: 'Em Tramitação', color: 'yellow', gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' },
    { key: 'aguardando', label: 'Aguardando', color: 'purple', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' },
    { key: 'concluido', label: 'Concluídos', color: 'green', gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
    { key: 'indeferido', label: 'Indeferidos', color: 'red', gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' },
    { key: 'urgentes', label: 'Urgentes', color: 'red', gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' },
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

  const calendarDays = buildCalendarDays(calendarMonth, processosPorPrazo);
  const selectedDeadlineKey = selectedDeadline ? getDateKey(selectedDeadline) : null;
  const selectedProcesses = selectedDeadlineKey ? processosPorPrazo[selectedDeadlineKey] || [] : [];

  const getSituacaoClass = (situacao) => {
    const map = {
      aprovado: 'success',
      deferido: 'success',
      indeferido: 'danger',
      arquivado: 'secondary',
      pausado: 'warning',
      suspenso: 'warning',
      recebido: 'info',
      retornado: 'info',
      encaminhamento: 'info',
      encaminhamento_pendente: 'warning',
    };
    return map[situacao] || 'info';
  };

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="header-title">
              <span className="greeting">{getSaudacao()},</span>
              <span className="user-name">{primeiroNome}</span>
            </h1>
            <p className="header-date">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatarData()}
            </p>
          </div>
          <Link to="/processos/novo" className="btn btn-primary btn-lg">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Processo
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        {statConfig.map(stat => {
          const valor = estatisticas[stat.key];
          const pct = calcularPorcentagem(valor, estatisticas.total);
          return (
            <div className="stat-card-modern" key={stat.key}>
              <div className="stat-card-bg" style={{ background: stat.gradient }} />
              <div className="stat-card-content">
                <div className="stat-header">
                  <div className={`stat-icon-wrapper ${stat.color}`}>
                    {renderIcon(stat.key)}
                  </div>
                  <span className="stat-percentage">{pct}%</span>
                </div>
                <div className="stat-body">
                  <h3 className="stat-value">{valor}</h3>
                  <p className="stat-label">{stat.label}</p>
                </div>
                <div className="stat-progress">
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${stat.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="dashboard-main-grid">

        {/* Calendar Section */}
        <div className="dashboard-card calendar-card">
          <div className="card-header-modern">
            <div className="card-header-left">
              <div className="card-icon calendar-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="card-title">Calendário de Vencimentos</h2>
                <p className="card-subtitle">{calendarMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="calendar-nav">
              <button className="nav-btn" onClick={() => changeMonth(-1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button className="nav-btn" onClick={() => changeMonth(1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
          <div className="calendar-body">
            <div className="calendar-grid-container">
              <div className="weekdays">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="weekday">{day}</div>
                ))}
              </div>
              <div className="days-grid">
                {calendarDays.map((day) => {
                  const isSelected = selectedDeadlineKey === day.key;
                  return (
                    <button
                      key={day.key}
                      type="button"
                      className={`day-cell ${day.isCurrentMonth ? '' : 'other-month'} ${day.isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${day.count > 0 ? 'has-events' : ''}`}
                      onClick={() => setSelectedDeadline(day.date)}
                    >
                      <span className="day-number">{day.date.getDate()}</span>
                      {day.count > 0 && (
                        <span className="event-indicator">
                          <span className="event-dot" />
                          <span className="event-count">{day.count}</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="calendar-sidebar">
              <div className="sidebar-header">
                <h3>{selectedDeadline ? formatDateDisplay(selectedDeadline) : 'Selecione uma data'}</h3>
                <p>{selectedProcesses.length} processo{selectedProcesses.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="sidebar-list">
                {selectedProcesses.length === 0 ? (
                  <div className="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="32" height="32">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Nenhum processo com vencimento nesta data</p>
                  </div>
                ) : selectedProcesses.map((processo) => (
                  <Link
                    to={`/processos/${processo.id}`}
                    className="process-item"
                    key={processo.id}
                  >
                    <div className="process-item-header">
                      <span className="process-numero">{processo.numero}</span>
                      <span className={`status-badge ${getSituacaoClass(processo.situacao)}`}>
                        {processo.situacao || 'info'}
                      </span>
                    </div>
                    <p className="process-item-meta">{processo.tipo} • {processo.requerente || processo.assunto}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="dashboard-bottom-grid">

        {/* Recent Processes */}
        <div className="dashboard-card processes-card">
          <div className="card-header-modern">
            <div className="card-header-left">
              <div className="card-icon processes-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="card-title">Processos Recentes</h2>
                <p className="card-subtitle">Últimos processos cadastrados</p>
              </div>
            </div>
            <Link to="/caixa-entrada" className="see-all-btn">
              Ver todos
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Link>
          </div>
          <div className="table-container-modern">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Tipo</th>
                  <th>Interessado</th>
                  <th>Status</th>
                  <th>Setor</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {processosRecentes.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="40" height="40">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h4>Nenhum processo encontrado</h4>
                        <p>Cadastre um novo processo para começar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  processosRecentes.map(p => (
                    <tr key={p.id} onClick={() => navigate(`/processos/${p.id}`)}>
                      <td>
                        <span className="table-link">{p.numero}</span>
                      </td>
                      <td>{p.tipo}</td>
                      <td>{p.requerente}</td>
                      <td>
                        <span className={`status-badge ${getSituacaoClass(p.situacao)}`}>
                          {p.situacao || p.status || 'Não informado'}
                        </span>
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
        {user.id && (() => {
          const totalMeus = Object.values(caixaResumo).reduce((a, b) => a + b, 0);
          if (totalMeus === 0) return null;
          const caixaConfig = [
            { key: 'encaminhado', label: 'Encaminhados', color: 'blue' },
            { key: 'recebido', label: 'Recebidos', color: 'yellow' },
            { key: 'aprovado', label: 'Deferidos', color: 'green' },
            { key: 'pausado', label: 'Suspensos', color: 'purple' },
            { key: 'arquivado', label: 'Arquivados', color: 'secondary' },
            { key: 'indeferido', label: 'Indeferidos', color: 'danger' },
          ];
          return (
            <div className="dashboard-card inbox-card">
              <div className="card-header-modern">
                <div className="card-header-left">
                  <div className="card-icon inbox-icon">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="card-title">Minha Caixa de Entrada</h2>
                    <p className="card-subtitle">Processos atribuídos a você</p>
                  </div>
                </div>
                <Link to="/caixa-entrada" className="see-all-btn">
                  Ver todos
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </Link>
              </div>
              <div className="inbox-stats">
                {caixaConfig.map(cfg => (
                  <div className="inbox-stat-item" key={cfg.key} onClick={() => navigate('/caixa-entrada')}>
                    <div className={`inbox-stat-icon ${cfg.color}`}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <div className="inbox-stat-info">
                      <span className="inbox-stat-value">{caixaResumo[cfg.key]}</span>
                      <span className="inbox-stat-label">{cfg.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Urgent Processes */}
        <div className="dashboard-card urgent-card">
          <div className="card-header-modern">
            <div className="card-header-left">
              <div className="card-icon urgent-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="card-title">Processos Urgentes</h2>
                <p className="card-subtitle">Prioridade alta</p>
              </div>
            </div>
          </div>
          <div className="urgent-list">
            {processosUrgentes.length === 0 ? (
              <div className="empty-state small">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="32" height="32">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4>Nenhum processo urgente</h4>
                <p>Todos os processos estão sob controle</p>
              </div>
            ) : (
              processosUrgentes.map(p => (
                <Link to={`/processos/${p.id}`} className="urgent-item" key={p.id}>
                  <div className="urgent-indicator" />
                  <div className="urgent-info">
                    <span className="urgent-numero">{p.numero}</span>
                    <span className="urgent-meta">{p.requerente} • {p.setorAtual}</span>
                  </div>
                  <span className={`status-badge ${getSituacaoClass(p.situacao)}`}>
                    {p.situacao || p.status || 'info'}
                  </span>
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