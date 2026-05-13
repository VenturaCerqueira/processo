import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="landing-hero">
        <div className="landing-hero-inner">
          <nav className="landing-nav">
            <div className="landing-brand">
              <div className="landing-brand-mark">
                <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="landing-brand-text">Processo Eletrônico</span>
            </div>

            <Link to="/login" className="btn landing-primary-ghost">
              Acessar Sistema
            </Link>
          </nav>

          <div style={{ maxWidth: 700 }}>
            <h1 className="landing-hero-title">
              Gestão Moderna de<br />Processos Administrativos
            </h1>
            <p className="landing-hero-subtitle">
              Sistema integrado de controle e tramitação de processos eletrônicos para órgãos públicos municipais.
              Rastreabilidade total, gestão documental e integração entre setores.
            </p>
            <div className="landing-actions">
              <Link to="/login" className="btn btn-primary">
                <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Entrar no Sistema
              </Link>
              <Link to="/requerente/login" className="btn landing-primary-ghost">
                <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Acesso do Requerente
              </Link>
              <a href="#funcionalidades" className="btn landing-primary-ghost">
                Conhecer Funcionalidades
              </a>
            </div>

          </div>
        </div>

        {/* Decorative shapes */}
        <div className="landing-shape shape-1" />
        <div className="landing-shape shape-2" />
      </header>


      {/* Stats Banner */}
      <section className="landing-section">
        <div className="landing-kpi-inner">
          <div>
            <div className="kpi-value">16</div>
            <div className="kpi-label">Setores Integrados</div>
          </div>
          <div>
            <div className="kpi-value">11</div>
            <div className="kpi-label">Tipos de Processos</div>
          </div>
          <div>
            <div className="kpi-value">100%</div>
            <div className="kpi-label">Rastreabilidade</div>
          </div>
          <div>
            <div className="kpi-value">24h</div>
            <div className="kpi-label">Acesso Contínuo</div>
          </div>
        </div>
      </section>


      {/* Features */}
      <section id="funcionalidades" className="landing-features">
        <div className="landing-center">
          <h2>Funcionalidades Principais</h2>
          <p>
            Tudo o que você precisa para gerenciar processos administrativos com eficiência e transparência.
          </p>
        </div>

        <div className="landing-feature-grid">

          <FeatureCard
            icon={(
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            )}
            color="#0f4c81"
            title="Acesso Seguro"
            description="Autenticação por login e senha com níveis de acesso diferenciados. Recuperação de senha via token seguro."
          />
          <FeatureCard
            icon={(
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            )}
            color="#059669"
            title="Recebimento de Arquivos"
            description="Anexação de petições iniciais e documentos processuais com validação automática de formato e registro de protocolo."
          />
          <FeatureCard
            icon={(
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            )}
            color="#d97706"
            title="Anexar Documentos"
            description="Upload de peças complementares com controle de versão, associação automática ao processo e notificação às partes."
          />
          <FeatureCard
            icon={(
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            )}
            color="#7c3aed"
            title="Encaminhar Processo"
            description="Distribuição interna entre setores com registro de movimentações, controle de prazos e rastreabilidade completa."
          />
          <FeatureCard
            icon={(
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            )}
            color="#dc2626"
            title="Relatórios e Estatísticas"
            description="Geração de relatórios de andamento com filtros por período, setor e tipo de processo. Exportação em CSV."
          />
          <FeatureCard
            icon={(
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
            color="#2563eb"
            title="Gestão de Usuários"
            description="Cadastro e controle de usuários por setor, com níveis de acesso hierárquicos e gerenciamento de permissões."
          />
        </div>
      </section>

      {/* Process Types */}
      <section className="landing-subsection">
        <div className="landing-subsection-inner">
          <div className="landing-center">
            <h2>Tipos de Processos Atendidos</h2>
            <p>O sistema individualiza e gerencia 11 categorias distintas de processos.</p>
          </div>
          <div className="landing-subsection-grid">

            {[
              '01 — Cadastro Fiscal Municipal',
              '02 — Parcelamento do Solo',
              '03 — Edificação e Postura',
              '04 — Cadastro Fiscal Imobiliário',
              '05 — Transmissão Imobiliária',
              '06 — Transporte de Passageiros',
              '07 — Atividade em Logradouro Público',
              '08 — Publicidade',
              '09 — Administrativo Tributário',
              '10 — Administrativo Fiscal',
              '11 — Diversos'
            ].map((item, i) => (
              <div key={i} className="landing-item-pill">
                <span className="landing-item-dot" />
                {item}
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="landing-features" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="landing-center" style={{ marginBottom: 60 }}>
          <h2>Setores Integrados</h2>
          <p>Tramitação entre todas as divisões e coordenações da Secretaria.</p>
        </div>
        <div className="landing-subsection-grid" style={{ gap: 12 }}>

          {[
            'Gabinete do Secretário',
            'Assessoria Jurídica',
            'Assessoria Técnica',
            'Divisão de Expediente de Processos',
            'Divisão de Controle e Registro de Documentos',
            'Divisão de Gestão de Tecnologia da Informação',
            'Setor de Informática e Digitalização',
            'Coordenação da Fazenda Municipal',
            'Divisão Administração Tributária',
            'Divisão de Cadastro Fiscal',
            'Setor de Cadastramento Urbano',
            'Setor de Cadastramento Rural',
            'Divisão de Controle Urbano',
            'Fiscalização do Ordenamento Uso do Solo',
            'Divisão de Inspetoria de Obras e Postura Municipal'
          ].map((setor, i) => (
            <div key={i} className="landing-item-pill" style={{ background: 'var(--gray-50)' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary)', flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {setor}
            </div>
          ))}

        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="landing-cta-inner">
          <h2>Pronto para começar?</h2>
          <p>
            Acesse o sistema com suas credenciais e comece a gerenciar processos com eficiência e transparência.
          </p>
          <Link to="/login" className="btn btn-secondary" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700 }}>
            Acessar o Sistema
          </Link>
        </div>
      </section>


      {/* Footer */}
      <footer className="landing-footer">
        <p>Processo Eletrônico — Sistema de Gestão Administrativa Municipal</p>
        <small>Versão 1.0 • Todos os direitos reservados</small>
      </footer>

    </div>
  );
}

function FeatureCard({ icon, color, title, description }) {
  return (
    <div className="landing-feature-card">
      <div
        className="landing-feature-icon"
        style={{ background: color + '15', color: color }}
      >
        {React.cloneElement(icon, { width: 26, height: 26 })}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}


export default LandingPage;

