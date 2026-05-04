import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import PrimeiroAcesso from './components/PrimeiroAcesso';
import EsqueciSenha from './components/EsqueciSenha';
import RedefinirSenha from './components/RedefinirSenha';
import Dashboard from './components/Dashboard';
import CaixaEntrada from './components/CaixaEntrada';
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
import CadastroEspeciesProcesso from './components/CadastroEspeciesProcesso';
import RequerenteLogin from './components/RequerenteLogin';
import RequerenteCadastro from './components/RequerenteCadastro';
import RequerenteCaixaEntrada from './components/RequerenteCaixaEntrada';
import RequerenteDashboard from './components/RequerenteDashboard';
import RequerenteEsqueciSenha from './components/RequerenteEsqueciSenha';
import Sidebar from './components/Sidebar';
import MeuPerfil from './components/MeuPerfil';
import NotFound from './components/NotFound';
import ToastContainer from './components/ToastContainer';

function AppContent() {
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  useEffect(() => {
    setSidebarMobileOpen(false);
  }, [location.pathname]);

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

  const isRequerenteRoute = location.pathname.startsWith('/requerente');
  const isPublicRoute = ['/login', '/primeiro-acesso', '/esqueci-senha', '/redefinir-senha'].includes(location.pathname);
  const appLayoutClass = isPublicRoute || !user
    ? ''
    : `app-layout${sidebarCollapsed ? ' app-layout-collapsed' : ''}${isMobile ? ' app-layout-mobile' : ''}`;
  const mainContentClass = isPublicRoute || !user
    ? ''
    : `main-content${sidebarCollapsed ? ' main-content-collapsed' : ''}${isMobile ? ' main-content-mobile' : ''}`;

  return (
    <div className={appLayoutClass}>
{!isPublicRoute && user && (
        <Sidebar
          user={user}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          mobileOpen={sidebarMobileOpen}
          onMobileToggle={() => setSidebarMobileOpen(v => !v)}
          isMobile={isMobile}
        />
      )}
      {sidebarMobileOpen && isMobile && (
        <div className="sidebar-mobile-overlay" onClick={() => setSidebarMobileOpen(false)} />
      )}
      {user && <ToastContainer />}
      <div className={mainContentClass}>
        {isMobile && user && !isPublicRoute && (
          <button
            className="mobile-menu-toggle"
            onClick={() => setSidebarMobileOpen(v => !v)}
            aria-label="Abrir menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <LandingPage />} />
          {/* Staff routes */}
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/primeiro-acesso" element={!user ? <PrimeiroAcesso onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/esqueci-senha" element={!user ? <EsqueciSenha /> : <Navigate to="/" />} />
          <Route path="/redefinir-senha" element={!user ? <RedefinirSenha /> : <Navigate to="/" />} />
          
{/* Requerente public routes */}
<Route path="/requerente/login" element={!user ? <RequerenteLogin onLogin={handleLogin} /> : <Navigate to="/requerente/dashboard" />} />
<Route path="/requerente/cadastro" element={!user ? <RequerenteCadastro /> : <Navigate to="/requerente/dashboard" />} />
          <Route path="/requerente/esqueci-senha" element={!user ? <RequerenteEsqueciSenha /> : <Navigate to="/requerente/dashboard" />} />
          
          {/* Requerente protected */}
          <Route path="/requerente/inbox" element={user && user.tipo === 'requerente' ? <RequerenteCaixaEntrada /> : <Navigate to="/requerente/login" />} />
          <Route path="/requerente/dashboard" element={user && user.tipo === 'requerente' ? <RequerenteDashboard /> : <Navigate to="/requerente/login" />} />
          
          {/* Staff protected */}
          <Route path="/caixa-entrada" element={user && user.tipo !== 'requerente' ? <CaixaEntrada /> : <Navigate to={user ? '/requerente/inbox' : '/login'} />} />
          <Route path="/processos" element={user && user.tipo !== 'requerente' ? <Navigate to="/caixa-entrada" /> : <Navigate to="/requerente/inbox" />} />
          <Route path="/processos/novo" element={user && user.tipo !== 'requerente' ? <NovoProcesso /> : <Navigate to={user ? '/requerente/inbox' : '/login'} />} />
          <Route path="/processos/:id" element={user ? <DetalheProcesso /> : <Navigate to="/login" />} />
          <Route path="/relatorios" element={user && user.tipo !== 'requerente' ? <Relatorios /> : <Navigate to={user ? '/requerente/inbox' : '/login'} />} />
          <Route path="/perfil" element={user ? <MeuPerfil onUpdateUser={handleUpdateUser} /> : <Navigate to="/login" />} />
          <Route path="/usuarios" element={user?.nivelAcesso === 'admin' && user.tipo !== 'requerente' ? <CadastroUsuarios /> : <Navigate to={user ? '/requerente/inbox' : '/'} />} />
          <Route path="/cadastros/tipos-processo" element={user && user.tipo !== 'requerente' ? <CadastroTiposProcesso /> : <Navigate to={user ? (user.tipo === 'requerente' ? '/requerente/inbox' : '/') : '/login'} />} />
          <Route path="/cadastros/setores" element={user && user.tipo !== 'requerente' ? <CadastroSetores /> : <Navigate to={user ? (user.tipo === 'requerente' ? '/requerente/inbox' : '/') : '/login'} />} />
          <Route path="/cadastros/prioridades" element={user && user.tipo !== 'requerente' ? <CadastroPrioridades /> : <Navigate to={user ? (user.tipo === 'requerente' ? '/requerente/inbox' : '/') : '/login'} />} />
          <Route path="/cadastros/requerentes" element={user && user.tipo !== 'requerente' ? <CadastroRequerentes /> : <Navigate to={user ? (user.tipo === 'requerente' ? '/requerente/inbox' : '/') : '/login'} />} />
          <Route path="/cadastros/entidades" element={user && user.tipo !== 'requerente' ? <CadastroEntidades /> : <Navigate to={user ? (user.tipo === 'requerente' ? '/requerente/inbox' : '/') : '/login'} />} />
          <Route path="/cadastros/niveis-acesso" element={user?.nivelAcesso === 'admin' && user.tipo !== 'requerente' ? <CadastroNiveisAcesso /> : <Navigate to={user ? (user.tipo === 'requerente' ? '/requerente/inbox' : '/') : '/login'} />} />
          <Route path="/cadastros/especies-processo" element={user && user.tipo !== 'requerente' ? <CadastroEspeciesProcesso /> : <Navigate to={user ? (user.tipo === 'requerente' ? '/requerente/inbox' : '/') : '/login'} />} />
          <Route path="*" element={<NotFound />} />
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

