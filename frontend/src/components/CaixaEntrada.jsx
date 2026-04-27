import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

/* =========================================================
   Dropdown de Ações — reutilizável por linha da tabela
   Usa position:fixed para nunca ser cortado pela tabela.
   ========================================================= */
function ActionsDropdown({ actions }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuStyle = useRef({ top: 0, left: 0 });

  useEffect(() => {
    if (open && btnRef.current) {
      const btn = btnRef.current;
      const rect = btn.getBoundingClientRect();
      const menuHeight = Math.min(actions.length * 38 + 8, 320); // estimativa
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      let top;
      if (spaceBelow >= menuHeight || spaceBelow >= spaceAbove) {
        // abre para baixo
        top = rect.bottom + 6;
      } else {
        // abre para cima
        top = rect.top - menuHeight - 6;
      }

      menuStyle.current = {
        position: 'fixed',
        top,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
        minWidth: 170,
        zIndex: 99999,
      };
    }
  }, [open, actions.length]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (btnRef.current && !btnRef.current.contains(e.target)) {
        const menu = document.querySelector('.actions-dropdown-fixed-menu');
        if (menu && menu.contains(e.target)) return; // clique dentro do menu
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  if (!actions || actions.length === 0) return null;

  return (
    <>
      <button
        ref={btnRef}
        className="actions-dropdown-toggle"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        style={{ position: 'relative', zIndex: open ? 99998 : undefined }}
      >
        <span>Ações</span>
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open &&
        createPortal(
          <div className="actions-dropdown-fixed-menu" style={menuStyle.current}>
            {actions.map((a, i) => (
              <button
                key={i}
                className={`actions-dropdown-item ${a.variant ? `item-${a.variant}` : ''}`}
                onClick={() => { setOpen(false); a.onClick(); }}
              >
                {a.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

const situacoes = [
  { key: 'encaminhado', label: 'Encaminhado', color: 'blue',
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 12h14"/></svg>,
    desc: 'Aguardando recebimento' },
  { key: 'recebido', label: 'Recebido', color: 'yellow',
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>,
    desc: 'Em tramitação' },
  { key: 'aprovado', label: 'Aprovado', color: 'green',
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    desc: 'Aprovado e ativo' },
  { key: 'pausado', label: 'Pausado', color: 'purple',
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    desc: 'Aguardando retomada' },
  { key: 'arquivado', label: 'Arquivado', color: 'gray',
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>,
    desc: 'Arquivado' },
  { key: 'indeferido', label: 'Indeferido', color: 'red',
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    desc: 'Indeferido' },
];

function CaixaEntrada() {
  const navigate = useNavigate();
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabAtiva, setTabAtiva] = useState('encaminhado');
  const [user, setUser] = useState(null);
  const [busca, setBusca] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');
  const [filtroFavorito, setFiltroFavorito] = useState(false);
  const [contagem, setContagem] = useState({});
  const [animarLista, setAnimarLista] = useState(false);

  // Modal encaminhar
  const [mostrarEncaminhar, setMostrarEncaminhar] = useState(false);
  const [processoEncaminhar, setProcessoEncaminhar] = useState(null);
  const [paraSetor, setParaSetor] = useState('');
  const [paraUsuario, setParaUsuario] = useState('');
  const [parecer, setParecer] = useState('');
  const [setores, setSetores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Modal observação
  const [mostrarObs, setMostrarObs] = useState(false);
  const [processoObs, setProcessoObs] = useState(null);
  const [textoObs, setTextoObs] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) { try { setUser(JSON.parse(storedUser)); } catch { setUser(null); } }
    carregarProcessos();
    carregarOpcoes();
  }, []);

  const carregarOpcoes = async () => {
    try {
      const [sRes, uRes] = await Promise.all([api.get('/setores'), api.get('/auth/usuarios-ativos')]);
      setSetores(sRes.data);
      setUsuarios(uRes.data);
    } catch (error) { console.error('Erro ao carregar opcoes:', error); }
  };

  const carregarProcessos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/processos/caixa-entrada');
      setProcessos(response.data.processos || []);
      setContagem(response.data.contagem || {});
    } catch (error) { console.error('Erro ao carregar processos:', error); }
    finally { setLoading(false); }
  };

  const handleTabChange = (key) => {
    setAnimarLista(false);
    setTabAtiva(key);
    setTimeout(() => setAnimarLista(true), 30);
  };

  const processosFiltrados = processos.filter(p => {
    const matchTab = p.situacao === tabAtiva;
    const matchBusca = !busca ||
      (p.numero && p.numero.toLowerCase().includes(busca.toLowerCase())) ||
      (p.requerente && p.requerente.toLowerCase().includes(busca.toLowerCase())) ||
      (p.assunto && p.assunto.toLowerCase().includes(busca.toLowerCase()));
    const matchPrioridade = !filtroPrioridade || p.prioridade === filtroPrioridade;
    const matchFavorito = !filtroFavorito || p.favorito;
    return matchTab && matchBusca && matchPrioridade && matchFavorito;
  });

  const totalAba = processos.filter(p => p.situacao === tabAtiva).length;

  const toggleFavorito = async (processoId) => {
    try {
      const response = await api.post(`/processos/${processoId}/favoritar`);
      setProcessos(prev => prev.map(p => p.id === processoId ? { ...p, favorito: response.data.favorito } : p));
    } catch (error) { console.error('Erro ao favoritar:', error); }
  };

  const executarAcao = async (acao, processoId) => {
    try {
      await api.post(`/processos/${processoId}/${acao}`);
      carregarProcessos();
    } catch (error) { alert(error.response?.data?.message || 'Erro ao executar ação'); }
  };

  const abrirEncaminhar = (processo) => {
    setProcessoEncaminhar(processo);
    setParaSetor(''); setParaUsuario(''); setParecer('');
    setMostrarEncaminhar(true);
  };

  const handleEncaminhar = async (e) => {
    e.preventDefault();
    if (!paraSetor) return alert('Selecione um setor de destino');
    if (paraUsuario && parseInt(paraUsuario) === user?.id) return alert('Você não pode encaminhar para si mesmo');
    try {
      await api.post(`/processos/${processoEncaminhar.id}/encaminhar`, { para: paraSetor, parecer, paraUsuario: paraUsuario || null });
      setMostrarEncaminhar(false); setProcessoEncaminhar(null); setParaSetor(''); setParaUsuario(''); setParecer('');
      carregarProcessos();
    } catch (error) { alert(error.response?.data?.message || 'Erro ao encaminhar'); }
  };

  const abrirObservacao = (processo) => {
    setProcessoObs(processo);
    setTextoObs('');
    setMostrarObs(true);
  };

  const handleObservacao = async (e) => {
    e.preventDefault();
    if (!textoObs.trim()) return;
    try {
      await api.post(`/processos/${processoObs.id}/observacao`, { texto: textoObs });
      setMostrarObs(false); setProcessoObs(null); setTextoObs('');
      carregarProcessos();
    } catch { alert('Erro ao adicionar observação'); }
  };

  const acoesPorSituacao = (p) => {
    switch (p.situacao) {
      case 'encaminhado':
        return [
          { label: 'Receber', variant: 'success', onClick: () => executarAcao('receber', p.id) },
        ];
      case 'recebido':
        return [
          { label: 'Encaminhar', variant: 'primary', onClick: () => abrirEncaminhar(p) },
          { label: 'Aprovar', variant: 'success', onClick: () => executarAcao('aprovar', p.id) },
          { label: 'Indeferir', variant: 'danger', onClick: () => executarAcao('indeferir', p.id) },
          { label: 'Pausar', variant: 'warning', onClick: () => executarAcao('pausar', p.id) },
          { label: 'Arquivar', variant: 'secondary', onClick: () => executarAcao('arquivar', p.id) },
          { label: 'Observação', variant: 'secondary', onClick: () => abrirObservacao(p) },
        ];
      case 'aprovado':
        return [
          { label: 'Arquivar', variant: 'secondary', onClick: () => executarAcao('arquivar', p.id) },
          { label: 'Reabrir', variant: 'primary', onClick: () => executarAcao('receber', p.id) },
        ];
      case 'pausado':
        return [
          { label: 'Retomar', variant: 'primary', onClick: () => executarAcao('receber', p.id) },
          { label: 'Arquivar', variant: 'secondary', onClick: () => executarAcao('arquivar', p.id) },
        ];
      case 'arquivado':
      case 'indeferido':
        return [
          { label: 'Reabrir', variant: 'primary', onClick: () => executarAcao('receber', p.id) },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="page-content">
      <div className="top-bar" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            Caixa de Entrada
            {user?.nome && (
              <span style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13, 
                fontWeight: 600, 
                color: '#1e40af', 
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
                padding: '6px 14px 6px 10px', 
                borderRadius: 24,
                border: '1px solid #93c5fd',
                boxShadow: '0 1px 3px rgba(59, 130, 246, 0.12)',
                letterSpacing: 0.2
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: '#3b82f6',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  {user.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
                {user.nome}
              </span>
            )}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>Gerencie seus processos por status e execute ações rapidamente</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/processos/novo')}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Processo
        </button>
      </div>

      {/* Cards de Status */}
      <div className="inbox-status-grid" style={{ marginBottom: 24 }}>
        {situacoes.map(s => (
          <button
            key={s.key}
            className={`inbox-status-card ${tabAtiva === s.key ? 'active' : ''} ${s.color}`}
            onClick={() => handleTabChange(s.key)}
          >
            <div className="inbox-status-icon">{s.icon}</div>
            <div className="inbox-status-info">
              <span className="inbox-status-count">{contagem[s.key] || 0}</span>
              <span className="inbox-status-label">{s.label}</span>
              <span className="inbox-status-desc">{s.desc}</span>
            </div>
            {tabAtiva === s.key && <div className="inbox-status-indicator" />}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 24, padding: '16px 24px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por número, requerente ou assunto..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>
          <select className="form-control" style={{ width: 180 }} value={filtroPrioridade} onChange={e => setFiltroPrioridade(e.target.value)}>
            <option value="">Todas as prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="normal">Normal</option>
            <option value="baixa">Baixa</option>
          </select>
          <button
            className={`btn ${filtroFavorito ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltroFavorito(v => !v)}
            title="Filtrar favoritos"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={filtroFavorito ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {filtroFavorito ? 'Favoritos' : 'Favoritos'}
          </button>
          <button className="btn btn-secondary" onClick={() => { setBusca(''); setFiltroPrioridade(''); setFiltroFavorito(false); }}>Limpar</button>
          <span style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600, marginLeft: 'auto' }}>
            {processosFiltrados.length} de {totalAba} processos
          </span>
        </div>
      </div>

      {/* Lista */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 1, textAlign: 'center' }}></th>
                <th>Número</th>
                <th>Tipo</th>
                <th>Assunto</th>
                <th>Requerente</th>
                <th>Prioridade</th>
                <th>Situação</th>
                <th>Setor</th>
                <th>Data</th>
                <th style={{ width: 1, whiteSpace: 'nowrap' }}>Ações</th>
              </tr>
            </thead>
            <tbody className={animarLista ? 'fade-in-list' : ''}>
              {processosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="10">
                    <div className="empty-state small">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <h4>Nenhum processo {situacoes.find(s => s.key === tabAtiva)?.label.toLowerCase()}</h4>
                      <p>Os processos atribuídos a você aparecerão aqui</p>
                    </div>
                  </td>
                </tr>
              ) : (
                processosFiltrados.map(p => (
                  <tr key={p.id}>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => toggleFavorito(p.id)}
                        title={p.favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 4,
                          color: p.favorito ? '#f59e0b' : '#94a3b8',
                          transition: 'color 0.2s ease, transform 0.15s ease',
                          transform: p.favorito ? 'scale(1.1)' : 'scale(1)'
                        }}
                        onMouseEnter={e => { if (!p.favorito) e.currentTarget.style.color = '#f59e0b'; }}
                        onMouseLeave={e => { if (!p.favorito) e.currentTarget.style.color = '#94a3b8'; }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={p.favorito ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    </td>
                    <td><Link to={`/processos/${p.id}`} className="table-link">{p.numero}</Link></td>
                    <td>{p.tipo}</td>
                    <td>{p.assunto}</td>
                    <td>{p.requerente}</td>
                    <td className={`priority-${p.prioridade}`}>{p.prioridade}</td>
                    <td><span className={`badge badge-${p.situacao}`}>{p.situacao}</span></td>
                    <td>{p.setorAtual}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td><ActionsDropdown actions={acoesPorSituacao(p)} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Encaminhar */}
      {mostrarEncaminhar && processoEncaminhar && (
        <div className="modal-overlay" onClick={() => setMostrarEncaminhar(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Encaminhar Processo {processoEncaminhar.numero}</h3>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{processoEncaminhar.assunto}</p>
            </div>
            <div className="modal-body">
              <form id="form-encaminhar" onSubmit={handleEncaminhar}>
                <div className="form-group">
                  <label>Setor de Destino *</label>
                  <select className="form-control" value={paraSetor} onChange={e => { setParaSetor(e.target.value); setParaUsuario(''); }} required>
                    <option value="">Selecione</option>
                    {setores.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Usuário Destino</label>
                  <select className="form-control" value={paraUsuario} onChange={e => setParaUsuario(e.target.value)}>
                    <option value="">Selecione o usuário (opcional)</option>
                    {usuarios.filter(u => u.id !== user?.id && (!paraSetor || u.setor === paraSetor)).map(u => (
                      <option key={u.id} value={u.id}>{u.nome} — {u.cargo}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Parecer / Observação</label>
                  <textarea className="form-control" rows="3" value={parecer} onChange={e => setParecer(e.target.value)} placeholder="Descreva o motivo do encaminhamento..." />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMostrarEncaminhar(false)}>Cancelar</button>
              <button className="btn btn-primary" form="form-encaminhar">Encaminhar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Observação */}
      {mostrarObs && processoObs && (
        <div className="modal-overlay" onClick={() => setMostrarObs(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Observação — Processo {processoObs.numero}</h3>
            </div>
            <div className="modal-body">
              <form id="form-obs" onSubmit={handleObservacao}>
                <div className="form-group">
                  <label>Observação *</label>
                  <textarea className="form-control" rows="4" value={textoObs} onChange={e => setTextoObs(e.target.value)} required placeholder="Digite a observação..." />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMostrarObs(false)}>Cancelar</button>
              <button className="btn btn-primary" form="form-obs">Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CaixaEntrada;

