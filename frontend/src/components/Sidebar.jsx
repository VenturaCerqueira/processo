import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const mainItems = [
  { path: '/', label: 'Dashboard', icon: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
  )},
  { path: '/processos', label: 'Processos', icon: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  )},
  { path: '/relatorios', label: 'Relatórios', icon: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  )},
];

const cadastroItems = [
  { path: '/cadastros/tipos-processo', label: 'Tipos de Processo', icon: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  )},
  { path: '/cadastros/setores', label: 'Setores', icon: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
  )},
  { path: '/cadastros/prioridades', label: 'Prioridades', icon: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  )},
  { path: '/cadastros/requerentes', label: 'Requerentes', icon: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
  )},
  { path: '/cadastros/entidades', label: 'Entidades', icon: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
  )},
  { path: '/cadastros/niveis-acesso', label: 'Niveis de Acesso', icon: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
  )},
];

const userItemsBase = [
  { path: '/perfil', label: 'Meu Perfil', icon: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  )},
];

function Sidebar({ user, onLogout, collapsed, onToggleCollapse }) {
  const location = useLocation();
  const isCadastroRoute = location.pathname.startsWith('/cadastros');
  const [openGroups, setOpenGroups] = useState({ cadastros: isCadastroRoute, usuario: false });
  const userInitials = user.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const toggleGroup = (group) => {
    setOpenGroups(prev => {
      const isOpening = !prev[group];
      const next = { cadastros: false, usuario: false };
      if (isOpening) {
        next[group] = true;
      }
      return next;
    });
  };

  const userItems = [
    ...userItemsBase,
    ...(user.nivelAcesso === 'admin' ? [{ path: '/usuarios', label: 'Usuários', icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    )}] : []),
  ];

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <button
        className="sidebar-toggle"
        onClick={onToggleCollapse}
        title={collapsed ? 'Expandir menu' : 'Recolher menu'}
      >
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>

      <div className="sidebar-header">
        <h1>Processo Eletrônico</h1>
        <p>Sistema de Gestão</p>
      </div>

      <nav className="sidebar-nav">
        {mainItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={location.pathname === item.path ? 'active' : ''}
            title={collapsed ? item.label : ''}
          >
            {item.icon}
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}

        {/* Grupo Cadastros */}
        {!collapsed && (
          <div className={`sidebar-group${openGroups.cadastros ? ' open' : ''}`}>
            <button
              className="sidebar-group-toggle"
              onClick={() => toggleGroup('cadastros')}
              title="Cadastros"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              <span className="nav-label">Cadastros</span>
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ marginLeft: 'auto', transform: openGroups.cadastros ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openGroups.cadastros && (
              <div className="sidebar-group-items">
                {cadastroItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={location.pathname === item.path ? 'active' : ''}
                  >
                    {item.icon}
                    <span className="nav-label">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {collapsed && cadastroItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={location.pathname === item.path ? 'active' : ''}
            title={item.label}
          >
            {item.icon}
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}

        {/* Grupo Usuário */}
        {!collapsed && (
          <div className={`sidebar-group${openGroups.usuario ? ' open' : ''}`}>
            <button
              className="sidebar-group-toggle"
              onClick={() => toggleGroup('usuario')}
              title="Usuário"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span className="nav-label">Usuário</span>
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ marginLeft: 'auto', transform: openGroups.usuario ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openGroups.usuario && (
              <div className="sidebar-group-items">
                {userItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={location.pathname === item.path ? 'active' : ''}
                  >
                    {item.icon}
                    <span className="nav-label">{item.label}</span>
                  </Link>
                ))}

              </div>
            )}
          </div>
        )}

        {collapsed && userItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={location.pathname === item.path ? 'active' : ''}
            title={item.label}
          >
            {item.icon}
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{userInitials}</div>
          <div className="user-details">
            <div className="name">{user.nome}</div>
            <div className="role">{user.setor}</div>
          </div>
          <button
            className="logout-btn"
            onClick={onLogout}
            title="Sair"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

