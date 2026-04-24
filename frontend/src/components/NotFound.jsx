import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <div className="notfound-container">
        {/* Documento flutuante */}
        <div className="notfound-document">
          <div className="notfound-doc-paper">
            <svg width="80" height="80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="notfound-doc-lines">
              <div className="notfound-line" />
              <div className="notfound-line short" />
              <div className="notfound-line" />
              <div className="notfound-line short" />
            </div>
          </div>
          {/* Selo */}
          <div className="notfound-stamp">
            <span>404</span>
          </div>
        </div>

        <h1 className="notfound-title">Processo não encontrado</h1>
        <p className="notfound-subtitle">
          O protocolo <strong>nº 404</strong> não consta em nosso sistema de tramitação.
          <br />
          Verifique o número ou retorne ao painel principal.
        </p>

        <div className="notfound-actions">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </button>
          <Link to="/" className="btn btn-primary">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Painel Principal
          </Link>
        </div>

        <div className="notfound-meta">
          <span>Protocolo: <strong>404-SEM-REGISTRO</strong></span>
          <span className="notfound-dot" />
          <span>Setor: <em>Arquivo Morto</em></span>
          <span className="notfound-dot" />
          <span>Status: <span className="notfound-status">Não localizado</span></span>
        </div>
      </div>

      {/* Partículas decorativas de fundo */}
      <div className="notfound-bg-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`notfound-particle p${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

export default NotFound;

