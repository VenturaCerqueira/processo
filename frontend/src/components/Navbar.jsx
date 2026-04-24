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
        <Link to="/perfil" className="btn btn-secondary" style={{ padding: '5px 15px' }}>
          {user.nome}
        </Link>
        <button 
          className="btn btn-danger" 
          onClick={onLogout}
          style={{ padding: '5px 15px' }}
        >
          Sair
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

