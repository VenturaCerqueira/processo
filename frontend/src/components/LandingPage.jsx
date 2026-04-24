import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      {/* Hero Section */}
      <header style={{
        background: 'linear-gradient(135deg, var(--gray-900) 0%, var(--primary-dark) 40%, var(--primary) 100%)',
        color: 'white',
        padding: '0 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 20px 100px', position: 'relative', zIndex: 2 }}>
          <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 80 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span style={{ fontSize: 18, fontWeight: 700 }}>Processo Eletrônico</span>
            </div>
            <Link to="/login" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
              Acessar Sistema
            </Link>
          </nav>

          <div style={{ maxWidth: 700 }}>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, lineHeight: 1.15, marginBottom: 24, letterSpacing: '-1px' }}>
              Gestão Moderna de<br />Processos Administrativos
            </h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 40, maxWidth: 560 }}>
              Sistema integrado de controle e tramitação de processos eletrônicos para órgãos públicos municipais. 
              Rastreabilidade total, gestão documental e integração entre setores.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/login" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>
                Entrar no Sistema
              </Link>
              <a href="#funcionalidades" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '14px 32px', fontSize: 16 }}>
                Conhecer Funcionalidades
              </a>
            </div>
          </div>
        </div>

        {/* Decorative shapes */}
        <div style={{
          position: 'absolute', bottom: -60, right: -60, width: 400, height: 400,
          borderRadius: '50%', background: 'rgba(255,255,255,0.03)', zIndex: 1
        }} />
        <div style={{
          position: 'absolute', top: 100, right: 100, width: 200, height: 200,
          borderRadius: '50%', background: 'rgba(255,255,255,0.02)', zIndex: 1
        }} />
      </header>

      {/* Stats Banner */}
      <section style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>16</div>
            <div style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 4 }}>Setores Integrados</div>
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>11</div>
            <div style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 4 }}>Tipos de Processos</div>
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>100%</div>
            <div style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 4 }}>Rastreabilidade</div>
          </div>
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>24h</div>
            <div style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 4 }}>Acesso Contínuo</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 12 }}>Funcionalidades Principais</h2>
          <p style={{ fontSize: 16, color: 'var(--gray-500)', maxWidth: 560, margin: '0 auto' }}>
            Tudo o que você precisa para gerenciar processos administrativos com eficiência e transparência.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
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
      <section style={{ background: 'var(--gray-50)', padding: '80px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 12 }}>Tipos de Processos Atendidos</h2>
            <p style={{ fontSize: 16, color: 'var(--gray-500)' }}>O sistema individualiza e gerencia 11 categorias distintas de processos.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
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
              <div key={i} style={{
                background: 'white', borderRadius: 10, padding: '16px 20px',
                border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 12,
                fontSize: 14, fontWeight: 500, color: 'var(--gray-700)'
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0
                }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 12 }}>Setores Integrados</h2>
          <p style={{ fontSize: 16, color: 'var(--gray-500)' }}>Tramitação entre todas as divisões e coordenações da Secretaria.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
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
            <div key={i} style={{
              background: 'var(--gray-50)', borderRadius: 8, padding: '14px 18px',
              fontSize: 14, color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 10
            }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary)', flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {setor}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 16 }}>Pronto para começar?</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 32, lineHeight: 1.7 }}>
            Acesse o sistema com suas credenciais e comece a gerenciar processos com eficiência e transparência.
          </p>
          <Link to="/login" className="btn" style={{ background: 'white', color: 'var(--primary)', padding: '16px 40px', fontSize: 16, fontWeight: 700 }}>
            Acessar o Sistema
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--gray-900)', color: 'var(--gray-400)', padding: '40px 20px', textAlign: 'center', fontSize: 14 }}>
        <p> Processo Eletrônico — Sistema de Gestão Administrativa Municipal</p>
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--gray-600)' }}>Versão 1.0 • Todos os direitos reservados</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, color, title, description }) {
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 16, padding: 28,
      border: '1px solid var(--gray-200)', transition: 'all 0.2s ease',
    }} onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
      <div style={{
        width: 52, height: 52, borderRadius: 12,
        background: color + '15', color: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20
      }}>
        {React.cloneElement(icon, { width: 26, height: 26 })}
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 10 }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.65 }}>{description}</p>
    </div>
  );
}

export default LandingPage;

