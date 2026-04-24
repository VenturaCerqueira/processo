import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import EsqueciSenha from './components/EsqueciSenha';
import RedefinirSenha from './components/RedefinirSenha';
import Dashboard from './components/Dashboard';
import Processos from './components/Processos';
import NovoProcesso from './components/NovoProcesso';
import DetalheProcesso from './components/DetalheProcesso';
import Relatorios from './components/Relatorios';
import CadastroUsuarios from './components/CadastroUsuarios';
import CadastroTiposProcesso from './components/CadastroTiposProcesso';
import CadastroSetores from './components/CadastroSetores';
import CadastroPrioridades from './components/CadastroPrioridades';
import CadastroRequerentes from './components/CadastroRequerentes';
import CadastroEntidades from './components/CadastroEntidades';
import CadastroNiveisAcesso from './components/CadastroNiveisAcesso';
import Sidebar from './components/Sidebar';
import MeuPerfil from './components/MeuPerfil';

function AppContent() {
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn('Erro ao carregar usuário do localStorage:', e.message);
      localStorage.removeItem('user');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleUpdateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isPublicRoute = ['/login', '/esqueci-senha', '/redefinir-senha'].includes(location.pathname);
  const appLayoutClass = isPublicRoute || !user
    ? ''
    : `app-layout${sidebarCollapsed ? ' app-layout-collapsed' : ''}`;
  const mainContentClass = isPublicRoute || !user
    ? ''
    : `main-content${sidebarCollapsed ? ' main-content-collapsed' : ''}`;

  return (
    <div className={appLayoutClass}>
      {!isPublicRoute && user && (
        <Sidebar
          user={user}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        />
      )}
      <div className={mainContentClass}>
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <LandingPage />} />
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/esqueci-senha" element={!user ? <EsqueciSenha /> : <Navigate to="/" />} />
          <Route path="/redefinir-senha" element={!user ? <RedefinirSenha /> : <Navigate to="/" />} />
          <Route path="/processos" element={user ? <Processos /> : <Navigate to="/login" />} />
          <Route path="/processos/novo" element={user ? <NovoProcesso /> : <Navigate to="/login" />} />
          <Route path="/processos/:id" element={user ? <DetalheProcesso /> : <Navigate to="/login" />} />
          <Route path="/relatorios" element={user ? <Relatorios /> : <Navigate to="/login" />} />
          <Route path="/perfil" element={user ? <MeuPerfil onUpdateUser={handleUpdateUser} /> : <Navigate to="/login" />} />
          <Route path="/usuarios" element={user?.nivelAcesso === 'admin' ? <CadastroUsuarios /> : <Navigate to="/" />} />
          <Route path="/cadastros/tipos-processo" element={user ? <CadastroTiposProcesso /> : <Navigate to="/login" />} />
          <Route path="/cadastros/setores" element={user ? <CadastroSetores /> : <Navigate to="/login" />} />
          <Route path="/cadastros/prioridades" element={user ? <CadastroPrioridades /> : <Navigate to="/login" />} />
          <Route path="/cadastros/requerentes" element={user ? <CadastroRequerentes /> : <Navigate to="/login" />} />
          <Route path="/cadastros/entidades" element={user ? <CadastroEntidades /> : <Navigate to="/login" />} />
          <Route path="/cadastros/niveis-acesso" element={user?.nivelAcesso === 'admin' ? <CadastroNiveisAcesso /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

