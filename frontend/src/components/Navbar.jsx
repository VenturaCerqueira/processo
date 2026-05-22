import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div>
        <strong>Processo Eletrônico</strong>
        <Link to="/">Dashboard</Link>
        <Link to="/caixa-entrada">Caixa de Entrada</Link>
        <Link to="/relatorios">Relatórios</Link>
        {user.nivelAcesso === 'admin' && (
          <Link to="/usuarios">Usuários</Link>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Link
          to="/perfil"
          className="btn btn-secondary"
          style={{ padding: '5px 15px' }}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          {user.nome}
        </Link>

        <button
          className="btn btn-danger"
          onClick={onLogout}
          style={{ padding: '5px 15px' }}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sair
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

