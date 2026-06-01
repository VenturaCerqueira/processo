import React, { useEffect, useRef, useState } from 'react';
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
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuHeight = Math.min((actions?.length || 0) * 38 + 8, 320);
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const top = spaceBelow >= menuHeight || spaceBelow >= spaceAbove ? rect.bottom + 6 : rect.top - menuHeight - 6;

      setMenuStyle({
        position: 'fixed',
        top,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
        minWidth: 170,
        zIndex: 99999,
      });
    }
  }, [open, actions]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (btnRef.current && !btnRef.current.contains(e.target)) {
        const menu = document.querySelector('.actions-dropdown-fixed-menu');
        if (menu && menu.contains(e.target)) return;
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
        onClick={() => setOpen((v) => !v)}
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
          <div className="actions-dropdown-fixed-menu" style={menuStyle}>
            {actions.map((a, i) => (
              <button
                key={i}
                className={`actions-dropdown-item ${a.variant ? `item-${a.variant}` : ''}`}
                onClick={() => {
                  setOpen(false);
                  a.onClick();
                }}
              >
                {a.icon && <span className="actions-dropdown-item-icon">{a.icon}</span>}
                <span>{a.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

function CaixaEntrada() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Recebido do backend: duas caixas separadas
  const [caixaSetor, setCaixaSetor] = useState([]);
  const [caixaUsuario, setCaixaUsuario] = useState([]);
  const [contagemSetor, setContagemSetor] = useState({});
  const [contagemUsuario, setContagemUsuario] = useState({});

  const [loading, setLoading] = useState(true);

  // Filtros (aplicados em cada caixa)
  const [busca, setBusca] = useState('');
  // Padrão: ao abrir a Caixa de Entrada, deixar selecionado “Encaminhado”
  const [filtroPrioridade, setFiltroPrioridade] = useState('encaminhado');
  const [filtroFavorito, setFiltroFavorito] = useState(false);

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

  // Modal excluir
  const [mostrarExcluir, setMostrarExcluir] = useState(false);
  const [processoExcluir, setProcessoExcluir] = useState(null);
  const [numeroConfirmacao, setNumeroConfirmacao] = useState('');
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    carregarOpcoes();
    carregarProcessos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarOpcoes = async () => {
    try {
      const [sRes, uRes] = await Promise.all([api.get('/setores'), api.get('/auth/usuarios-ativos')]);
      setSetores(sRes.data);
      setUsuarios(uRes.data);
    } catch (error) {
      console.error('Erro ao carregar opcoes:', error);
    }
  };

  const carregarProcessos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/processos/caixa-entrada');
      setCaixaSetor(response.data?.caixaSetor?.processos || []);
      setCaixaUsuario(response.data?.caixaUsuario?.processos || []);
      setContagemSetor(response.data?.caixaSetor?.contagem || {});
      setContagemUsuario(response.data?.caixaUsuario?.contagem || {});
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorito = async (processoId) => {
    try {
      const response = await api.post(`/processos/${processoId}/favoritar`);
      const update = (list) => list.map((p) => (p.id === processoId ? { ...p, favorito: response.data.favorito } : p));
      setCaixaSetor((prev) => update(prev));
      setCaixaUsuario((prev) => update(prev));
    } catch (error) {
      console.error('Erro ao favoritar:', error);
    }
  };

  const executarAcao = async (acao, processoId) => {
    try {
      await api.post(`/processos/${processoId}/${acao}`);
      carregarProcessos();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao executar ação');
    }
  };

  const abrirEncaminhar = (processo) => {
    setProcessoEncaminhar(processo);
    setParaSetor('');
    setParaUsuario('');
    setParecer('');
    setMostrarEncaminhar(true);
  };

  const podeEncaminhar = !!processoEncaminhar?.numero;

  const handleEncaminhar = async (e) => {
    e.preventDefault();
    if (!paraSetor) return alert('Selecione um setor de destino');
    if (paraUsuario && parseInt(paraUsuario) === user?.id) return alert('Você não pode encaminhar para si mesmo');

    try {
      await api.post(`/processos/${processoEncaminhar.id}/encaminhar`, {
        para: paraSetor,
        parecer,
        paraUsuario: paraUsuario || null,
      });

      setMostrarEncaminhar(false);
      setProcessoEncaminhar(null);
      setParaSetor('');
      setParaUsuario('');
      setParecer('');
      carregarProcessos();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao encaminhar');
    }
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
      setMostrarObs(false);
      setProcessoObs(null);
      setTextoObs('');
      carregarProcessos();
    } catch {
      alert('Erro ao adicionar observação');
    }
  };

  const abrirExcluir = (processo) => {
    setProcessoExcluir(processo);
    setNumeroConfirmacao('');
    setMostrarExcluir(true);
  };

  const handleExcluir = async (e) => {
    e.preventDefault();
    if (!processoExcluir) return;

    if (numeroConfirmacao.trim() !== processoExcluir.numero) {
      alert('O número do processo não confere. Digite exatamente o número exibido.');
      return;
    }

    setExcluindo(true);
    try {
      await api.post(`/processos/${processoExcluir.id}/excluir`);
      setMostrarExcluir(false);
      setProcessoExcluir(null);
      setNumeroConfirmacao('');
      carregarProcessos();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao excluir processo');
    } finally {
      setExcluindo(false);
    }
  };

  const filtrarLista = (lista) => {
    const normalizedBusca = busca.trim().toLowerCase();

    return (lista || []).filter((p) => {
      const matchBusca =
        !normalizedBusca ||
        (p.numero && String(p.numero).toLowerCase().includes(normalizedBusca)) ||
        (p.requerente && String(p.requerente).toLowerCase().includes(normalizedBusca)) ||
        (p.assunto && String(p.assunto).toLowerCase().includes(normalizedBusca));

      const matchFavorito = !filtroFavorito || p.favorito;

      // Quando a aba selecionada não for "encaminhado", usamos:
      // - filtroPrioridade = status/situacao (recebido, arquivado, aprovado, etc)
      // - então devemos filtrar por p.situacao (não por p.prioridade)
      const matchSituacao =
        filtroPrioridade === 'encaminhado' || !filtroPrioridade ? true : p.situacao === filtroPrioridade;

      return matchBusca && matchFavorito && matchSituacao;
    });
  };

  // Filtra aplicado em cada lista (setor/usuário). A separação visual será feita no render.
  const listaSetor = filtrarLista(caixaSetor);
  const listaUsuario = filtrarLista(caixaUsuario);

  const acoesPorSituacao = (p) => {
    const iconReceber = (
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
    const iconEncaminhar = (
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 12h14" />
      </svg>
    );
    const iconAprovar = (
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    const iconIndeferir = (
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
    const iconPausar = (
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    const iconArquivar = (
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    );
    const iconObs = (
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    );
    const iconReabrir = (
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    );
    const iconExcluir = (
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    );

    switch (p.situacao) {
      case 'encaminhado':
        return [
          { label: 'Receber', variant: 'success', icon: iconReceber, onClick: () => executarAcao('receber', p.id) },
          { label: 'Voltar', variant: 'warning', icon: <span style={{ fontSize: 14 }}>↩</span>, onClick: () => executarAcao('voltar', p.id) },
          { label: 'Excluir', variant: 'danger', icon: iconExcluir, onClick: () => abrirExcluir(p) },
        ];
      case 'recebido':
      case 'retornado':
        return [
          { label: 'Encaminhar', variant: 'primary', icon: iconEncaminhar, onClick: () => abrirEncaminhar(p) },
          { label: 'Deferir', variant: 'success', icon: iconAprovar, onClick: () => executarAcao('aprovar', p.id) },
          { label: 'Indeferir', variant: 'danger', icon: iconIndeferir, onClick: () => executarAcao('indeferir', p.id) },
          { label: 'Suspender', variant: 'warning', icon: iconPausar, onClick: () => executarAcao('pausar', p.id) },
          { label: 'Arquivar', variant: 'secondary', icon: iconArquivar, onClick: () => executarAcao('arquivar', p.id) },
          { label: 'Observação', variant: 'secondary', icon: iconObs, onClick: () => abrirObservacao(p) },
          { label: 'Excluir', variant: 'danger', icon: iconExcluir, onClick: () => abrirExcluir(p) },
        ];
      case 'aprovado':
        return [
          { label: 'Arquivar', variant: 'secondary', icon: iconArquivar, onClick: () => executarAcao('arquivar', p.id) },
          { label: 'Reabrir', variant: 'primary', icon: iconReabrir, onClick: () => executarAcao('receber', p.id) },
        ];
      case 'pausado':
        return [
          { label: 'Retomar', variant: 'primary', icon: iconReabrir, onClick: () => executarAcao('receber', p.id) },
          { label: 'Arquivar', variant: 'secondary', icon: iconArquivar, onClick: () => executarAcao('arquivar', p.id) },
        ];
      case 'arquivado':
      case 'indeferido':
        return [
          { label: 'Reabrir', variant: 'primary', icon: iconReabrir, onClick: () => executarAcao('receber', p.id) },
        ];
      default:
        return [];
    }
  };

  const renderTable = (lista, title, contagem) => {
    const total = lista.length || (contagem?.encaminhado ?? 0);

    return (
      <div className=”inbox-table-card”>
        <div className=”inbox-table-header”>
          <div className=”inbox-table-title”>
            <h3>{title}</h3>
            <span className=”inbox-table-badge”>{total}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Aguardando recebimento</div>
        </div>

        <div className=”inbox-table-container”>
          <table className=”inbox-table”>
            <thead>
              <tr>
                <th style={{ width: 50, textAlign: 'center' }}></th>
                <th>Número</th>
                <th>Tipo</th>
                <th>Assunto</th>
                <th>Interessado</th>
                <th>Prioridade</th>
                <th>Situação</th>
                <th>Setor</th>
                <th>Data</th>
                <th style={{ width: 100 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 ? (
                <tr>
                  <td colSpan=”10”>
                    <div className=”inbox-empty”>
                      <div className=”inbox-empty-icon”>
                        <svg fill=”none” stroke=”currentColor” viewBox=”0 0 24 24”>
                          <path strokeLinecap=”round” strokeLinejoin=”round” strokeWidth={1.5} d=”M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4” />
                        </svg>
                      </div>
                      <h4>Nenhum processo</h4>
                      <p>Filtre ou aguarde novos encaminhamentos.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                lista.map((p) => (
                  <tr key={p.id}>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => toggleFavorito(p.id)}
                        title={p.favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        className={`inbox-favorite-btn ${p.favorito ? 'active' : ''}`}
                      >
                        <svg viewBox=”0 0 24 24” fill={p.favorito ? 'currentColor' : 'none'} stroke=”currentColor” strokeWidth=”2” strokeLinecap=”round” strokeLinejoin=”round”>
                          <polygon points=”12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2” />
                        </svg>
                      </button>
                    </td>
                    <td>
                      <Link to={`/processos/${p.id}`} className=”inbox-process-link”>
                        {p.numero}
                      </Link>
                    </td>
                    <td>{p.tipo}</td>
                    <td>{p.assunto}</td>
                    <td>{p.requerente}</td>
                    <td><span className={`inbox-priority ${p.prioridade}`}>{p.prioridade}</span></td>
                    <td><span className={`inbox-badge ${p.situacao}`}>{p.situacao}</span></td>
                    <td>{p.setorAtual}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <ActionsDropdown actions={acoesPorSituacao(p)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="page-content">
      {/* Modern Header */}
      <div className="inbox-header">
        <div className="inbox-header-left">
          <div className="inbox-header-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="inbox-header-title">Caixa de Entrada</h2>
            <p className="inbox-header-subtitle">Gerencie os processos encaminhados para você</p>
          </div>
        </div>
        {user?.nome && (
          <div className="inbox-user-badge">
            <div className="inbox-user-avatar">
              {user.nome.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            {user.nome}
          </div>
        )}
        <button className="btn btn-primary" onClick={() => navigate('/processos/novo')}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Processo
        </button>
      </div>

      {/* Modern Filters Bar */}
      <div className="inbox-filters-bar">
        <div className="inbox-search-wrapper">
          <svg className="inbox-search-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="inbox-search-input"
            placeholder="Buscar por número, interessado ou assunto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <select className="inbox-filter-select" value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)}>
          <option value="">Todas as situações</option>
          <option value="encaminhado">Encaminhado</option>
          <option value="recebido">Recebido</option>
          <option value="retornado">Retornado</option>
          <option value="pausado">Suspenso</option>
          <option value="aprovado">Deferido</option>
          <option value="arquivado">Arquivado</option>
        </select>

        <button
          className={`inbox-filter-btn ${filtroFavorito ? 'active' : ''}`}
          onClick={() => setFiltroFavorito((v) => !v)}
          title="Filtrar favoritos"
        >
          <svg viewBox="0 0 24 24" fill={filtroFavorito ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Favoritos
        </button>

        <button
          className="inbox-filter-btn"
          onClick={() => {
            setBusca('');
            setFiltroPrioridade('encaminhado');
            setFiltroFavorito(false);
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Limpar
        </button>

        <div className="inbox-stats">
          <div className="inbox-stats-total">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {listaSetor.length + listaUsuario.length} processos
          </div>
          <div className="inbox-stats-divider"></div>
          <span>Setor: <strong>{listaSetor.length}</strong></span>
          <span>Usuário: <strong>{listaUsuario.length}</strong></span>
        </div>
      </div>

      {/* ====== Opções antigas (recebido, deferido, arquivado etc.) ====== */}
      <div className="inbox-status-grid" style={{ marginBottom: 16 }}>
        {[
          {
            key: 'encaminhado',
            label: 'Encaminhado',
            color: 'blue',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 5l7 7-7 7M5 12h14" />
              </svg>
            ),
          },
          {
            key: 'recebido',
            label: 'Recebido',
            color: 'yellow',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7" />
                <path d="m22 13-3 3" />
                <path d="M2 13l3 3" />
                <path d="M16 13h-8" />
              </svg>
            ),
          },
          {
            key: 'retornado',
            label: 'Retornado',
            color: 'orange',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 10v10h10" />
                <path d="M3 20l7-7" />
                <path d="M14 4h6v6" />
                <path d="M20 4l-10 10" />
              </svg>
            ),
          },
          {
            key: 'pausado',
            label: 'Suspenso',
            color: 'purple',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 9v6" />
                <path d="M14 9v6" />
                <path d="M7 4h10" />
                <path d="M9 20h6" />
              </svg>
            ),
          },
          {
            key: 'arquivado',
            label: 'Arquivado',
            color: 'gray',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 8h14" />
                <path d="M5 8a2 2 0 110-4h14a2 2 0 110 4" />
                <path d="M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                <path d="m9 12h6" />
              </svg>
            ),
          },
          {
            key: 'aprovado',
            label: 'Deferido',
            color: 'green',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },

        ].map((s) => (
          <button
            key={s.key}
            className={`inbox-status-card ${filtroPrioridade === s.key ? 'active' : ''} ${s.color}`}
            onClick={() => setFiltroPrioridade(s.key)}
          >
            <div className="inbox-status-icon">{s.icon}</div>
            <div className="inbox-status-info">
              <span className="inbox-status-label">{s.label}</span>
            </div>
            {filtroPrioridade === s.key && <div className="inbox-status-indicator" />}
          </button>
        ))}
      </div>

      {/* ====== Renderização: encaminhado dividido; demais opções em lista única ====== */}
      {filtroPrioridade === 'encaminhado' ? (
        <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
          {renderTable(
            listaSetor.filter((p) => p.situacao === 'encaminhado'),
            'Caixa de entrada do setor',
            contagemSetor
          )}
          {renderTable(
            listaUsuario.filter((p) => p.situacao === 'encaminhado'),
            'Caixa encaminhadao do usuario',
            contagemUsuario
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
          {renderTable(
            // lista única = setor + usuário
            // se filtroPrioridade estiver vazio, não filtramos por situacao
            (filtroPrioridade
              ? [...(listaSetor || []), ...(listaUsuario || [])].filter((p) => p.situacao === filtroPrioridade)
              : [...(listaSetor || []), ...(listaUsuario || [])]),
            'Caixa de Entrada',
            {
              encaminhado: (filtroPrioridade
                ? [...(listaSetor || []), ...(listaUsuario || [])].filter((p) => p.situacao === filtroPrioridade).length
                : [...(listaSetor || []), ...(listaUsuario || [])].length),
            }
          )}
        </div>
      )}




      {loading && <div style={{ marginTop: 16, color: 'var(--gray-500)' }}>Carregando...</div>}

      {/* Modal Encaminhar */}
      {mostrarEncaminhar && processoEncaminhar && (
        <div className="modal-overlay" onClick={() => setMostrarEncaminhar(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Encaminhar Processo {processoEncaminhar.numero}</h3>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{processoEncaminhar.assunto}</p>
            </div>
            <div className="modal-body">
              <form id="form-encaminhar" onSubmit={handleEncaminhar}>
                <div className="form-group">
                  <label>
                    Setor de Destino {podeEncaminhar ? '*' : '(após gerar o processo)'}
                  </label>
                  <select
                    className="form-control"
                    value={paraSetor}
                    onChange={(e) => { setParaSetor(e.target.value); setParaUsuario(''); }}
                    required
                    disabled={!podeEncaminhar}
                    aria-disabled={!podeEncaminhar}
                  >
                    <option value="">{podeEncaminhar ? 'Selecione' : 'Aguardando geração'}</option>
                    {setores.map((s) => (
                      <option key={s.id} value={s.nome}>
                        {s.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Usuário Destino</label>
                  <select className="form-control" value={paraUsuario} onChange={(e) => setParaUsuario(e.target.value)}>
                    <option value="">Selecione o usuário (opcional)</option>
                    {usuarios
                      .filter((u) => u.id !== user?.id && (!paraSetor || u.setor === paraSetor))
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome} — {u.cargo}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Parecer / Observação</label>
                  <textarea className="form-control" rows="3" value={parecer} onChange={(e) => setParecer(e.target.value)} placeholder="Descreva o motivo do encaminhamento..." />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMostrarEncaminhar(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" form="form-encaminhar" disabled={!podeEncaminhar}>
                Encaminhar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Observação */}
      {mostrarObs && processoObs && (
        <div className="modal-overlay" onClick={() => setMostrarObs(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Observação — Processo {processoObs.numero}</h3>
            </div>
            <div className="modal-body">
              <form id="form-obs" onSubmit={handleObservacao}>
                <div className="form-group">
                  <label>Observação *</label>
                  <textarea className="form-control" rows="4" value={textoObs} onChange={(e) => setTextoObs(e.target.value)} required placeholder="Digite a observação..." />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMostrarObs(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" form="form-obs">
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Excluir */}
      {mostrarExcluir && processoExcluir && (
        <div className="modal-overlay" onClick={() => { if (!excluindo) setMostrarExcluir(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Excluir Processo</h3>
                  <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '4px 0 0' }}>{processoExcluir.numero}</p>
                </div>
              </div>
            </div>

            <div className="modal-body" style={{ paddingTop: 8 }}>
              {excluindo ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  Apagando o processo...
                </div>
              ) : (
                <form id="form-excluir" onSubmit={handleExcluir}>
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 14px', marginBottom: 18, color: '#991b1b', fontSize: 13, lineHeight: 1.5 }}>
                    <strong>Atenção:</strong> esta ação não pode ser desfeita.
                  </div>
                  <div className="form-group">
                    <label>Digite o número do processo para confirmar <strong>{processoExcluir.numero}</strong></label>
                    <input
                      type="text"
                      className="form-control"
                      value={numeroConfirmacao}
                      onChange={(e) => setNumeroConfirmacao(e.target.value)}
                      required
                      autoFocus
                      placeholder="Digite o número exatamente como mostrado acima"
                    />
                  </div>
                </form>
              )}
            </div>

            {!excluindo && (
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setMostrarExcluir(false)}>
                  Cancelar
                </button>
                <button className="btn btn-danger" form="form-excluir" disabled={numeroConfirmacao.trim() !== processoExcluir.numero}>
                  Sim, excluir processo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CaixaEntrada;

