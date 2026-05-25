import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Gestão Completa',
    description: 'Cadastro, tramitação e acompanhamento de processos em um único lugar.',
    color: '#3b82f6',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: 'Trâmites',
    description: 'Encaminhe processos entre setores com controle de fluxo completo.',
    color: '#8b5cf6',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Prazos',
    description: 'Controle de prazos com alertas automáticos para não perder nenhuma data.',
    color: '#10b981',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    title: 'Notificações',
    description: 'Receba alertas sobre andamentos, prazos e movimentações.',
    color: '#f59e0b',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    title: 'Anexos',
    description: 'Upload e gerenciamento de documentos com suporte a múltiplos formatos.',
    color: '#ec4899',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Relatórios',
    description: 'Gere relatórios detalhados com gráficos e estatísticas em tempo real.',
    color: '#14b8a6',
  },
];

const categories = [
  { name: 'Cadastro Fiscal Municipal', color: '#6366f1' },
  { name: 'Parcelamento do Solo', color: '#10b981' },
  { name: 'Edificação e Postura', color: '#f59e0b' },
  { name: 'Cadastro Fiscal Imobiliário', color: '#ec4899' },
  { name: 'Transmissão Imobiliária', color: '#8b5cf6' },
  { name: 'Transporte de Passageiros', color: '#14b8a6' },
  { name: 'Atividade em Logradouro', color: '#3b82f6' },
  { name: 'Publicidade', color: '#10b981' },
  { name: 'Administrativo Tributário', color: '#f59e0b' },
  { name: 'Administrativo Fiscal', color: '#ec4899' },
  { name: 'Diversos', color: '#8b5cf6' },
];

function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <>{count.toLocaleString()}{suffix}</>;
}

function LandingPage() {
  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="nav-brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="nav-brand-text">Processo<span className="brand-plus">+</span></span>
          </div>

          <div className="nav-links">
            <a href="#features" className="nav-link">Recursos</a>
            <a href="#categories" className="nav-link">Categorias</a>
            <a href="#contact" className="nav-link">Contato</a>
          </div>

          <div className="nav-actions">
            <Link to="/login" className="btn btn-ghost-nav">Entrar</Link>
            <Link to="/requerente/login" className="btn btn-primary-nav">Requerente</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient-1" />
          <div className="hero-gradient-2" />
          <div className="hero-grid" />
        </div>

        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Sistema de Gestão Processual
            </div>

            <h1 className="hero-title">
              Gestão de processos{' '}
              <span className="gradient-text">inteligente</span>
            </h1>

            <p className="hero-subtitle">
              Digitalize, controle e rastreie processos administrativos com segurança.
              A solução completa para transparência e eficiência na gestão pública.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="btn btn-primary-hero">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Acessar Sistema
              </Link>
              <a href="#features" className="btn btn-ghost-hero">
                Conhecer recursos
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">
                  <AnimatedCounter end={2847} duration={2000} suffix="+" />
                </span>
                <span className="stat-label">Processos Finalizados</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-value">
                  <AnimatedCounter end={156} duration={1500} />
                </span>
                <span className="stat-label">Em Andamento</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-value">
                  <AnimatedCounter end={89} duration={1500} />
                </span>
                <span className="stat-label">Usuários Ativos</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="dashboard-mockup">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span /><span /><span />
                </div>
                <span className="mockup-title">Painel de Controle</span>
              </div>
              <div className="mockup-body">
                <div className="mockup-stats">
                  <div className="mockup-stat">
                    <div className="mockup-stat-icon blue">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="mockup-stat-value">2.847</span>
                      <span className="mockup-stat-label">Finalizados</span>
                    </div>
                  </div>
                  <div className="mockup-stat">
                    <div className="mockup-stat-icon green">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="mockup-stat-value">156</span>
                      <span className="mockup-stat-label">Em Andamento</span>
                    </div>
                  </div>
                  <div className="mockup-stat">
                    <div className="mockup-stat-icon purple">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="mockup-stat-value">89</span>
                      <span className="mockup-stat-label">Usuários</span>
                    </div>
                  </div>
                </div>
                <div className="mockup-chart">
                  <div className="chart-bar" style={{ height: '60%' }} />
                  <div className="chart-bar" style={{ height: '80%' }} />
                  <div className="chart-bar" style={{ height: '45%' }} />
                  <div className="chart-bar" style={{ height: '90%' }} />
                  <div className="chart-bar" style={{ height: '70%' }} />
                  <div className="chart-bar" style={{ height: '55%' }} />
                  <div className="chart-bar" style={{ height: '75%' }} />
                </div>
                <div className="mockup-list">
                  <div className="mockup-item">
                    <div className="mockup-item-dot green" />
                    <div className="mockup-item-content">
                      <span className="mockup-item-title">Processo #2847</span>
                      <span className="mockup-item-sub">Cadastro Fiscal • Finalizado</span>
                    </div>
                    <span className="mockup-item-time">Agora</span>
                  </div>
                  <div className="mockup-item">
                    <div className="mockup-item-dot yellow" />
                    <div className="mockup-item-content">
                      <span className="mockup-item-title">Processo #2846</span>
                      <span className="mockup-item-sub">Edificação • Análise</span>
                    </div>
                    <span className="mockup-item-time">2h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="float-card float-card-1">
              <div className="float-card-icon green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="float-card-value">100%</span>
                <span className="float-card-label">Digitalizado</span>
              </div>
            </div>

            <div className="float-card float-card-2">
              <div className="float-card-icon blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <span className="float-card-value">Seguro</span>
                <span className="float-card-label">Criptografia</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="features-bg">
          <div className="features-glow features-glow-1" />
          <div className="features-glow features-glow-2" />
        </div>

        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Recursos</span>
            <h2 className="section-title">Tudo que você precisa</h2>
            <p className="section-subtitle">
              Ferramentas completas para gerenciar processos de forma eficiente e transparente.
            </p>
          </div>

          <div className="features-layout">
            <div className="features-main">
              {features.slice(0, 4).map((feature, index) => (
                <div key={index} className="feature-card-modern" style={{ '--accent': feature.color }}>
                  <div className="feature-card-bg" />
                  <div className="feature-card-number">0{index + 1}</div>
                  <div className="feature-card-icon">{feature.icon}</div>
                  <div className="feature-card-content">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                  <div className="feature-card-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14m-7-7l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            <div className="features-highlight">
              <div className="highlight-card">
                <div className="highlight-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="highlight-stats">
                  <div className="highlight-stat">
                    <span className="highlight-stat-value">2.847</span>
                    <span className="highlight-stat-label">Processos digitalizados</span>
                  </div>
                  <div className="highlight-stat">
                    <span className="highlight-stat-value">99.8%</span>
                    <span className="highlight-stat-label">Taxa de conclusão</span>
                  </div>
                </div>
                <h3>Plataforma Completa</h3>
                <p>
                  Solução integrada que atende desde o cadastro inicial até a conclusão final de cada processo administrativo.
                </p>
                <div className="highlight-badges">
                  <span className="highlight-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Gestão
                  </span>
                  <span className="highlight-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tramitação
                  </span>
                  <span className="highlight-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Relatórios
                  </span>
                </div>
              </div>

              <div className="features-secondary">
                {features.slice(4).map((feature, index) => (
                  <div key={index} className="feature-card-small" style={{ '--accent': feature.color }}>
                    <div className="feature-card-small-icon">{feature.icon}</div>
                    <div>
                      <h4>{feature.title}</h4>
                      <p>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="categories">
        <div className="section-container">
          <div className="section-header">
            <span className="section-tag">Categorias</span>
            <h2 className="section-title">Tipos de Processos</h2>
            <p className="section-subtitle">
              O sistema gerencia diversas categorias de processos administrativos.
            </p>
          </div>

          <div className="categories-grid">
            {categories.map((item, i) => (
              <div key={i} className="category-pill" style={{ '--accent': item.color }}>
                <span className="category-dot" />
                <span className="category-name">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="cta">
        <div className="cta-bg">
          <div className="cta-gradient-1" />
          <div className="cta-gradient-2" />
        </div>
        <div className="cta-content">
          <h2 className="cta-title">Pronto para modernizar?</h2>
          <p className="cta-subtitle">
            Acesse agora e descubra como o Processo+ pode transformer
            a eficiência da sua administração pública.
          </p>
          <div className="cta-actions">
            <Link to="/login" className="btn btn-white-cta">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Acessar o Sistema
            </Link>
            <Link to="/requerente/login" className="btn btn-outline-white-cta">
              Área do Requerente
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="nav-brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="footer-brand-text">Processo<span className="brand-plus">+</span></span>
          </div>
          <div className="footer-links">
            <a href="#features">Recursos</a>
            <a href="#categories">Categorias</a>
            <a href="#contact">Contato</a>
          </div>
          <p className="footer-text">Sistema de Gestão Processual Administrativa</p>
          <small className="footer-copy">Versão 1.0 — Todos os direitos reservados</small>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;