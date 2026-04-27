import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

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
    return matchTab && matchBusca && matchPrioridade;
  });

  const totalAba = processos.filter(p => p.situacao === tabAtiva).length;

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
    const baseBtn = 'btn btn-xs';
    switch (p.situacao) {
      case 'encaminhado':
        return (
          <div className="inbox-actions">
            <button className={`${baseBtn} btn-success`} onClick={() => executarAcao('receber', p.id)}>Receber</button>
          </div>
        );
      case 'recebido':
        return (
          <div className="inbox-actions">
            <button className={`${baseBtn} btn-primary`} onClick={() => abrirEncaminhar(p)}>Encaminhar</button>
            <button className={`${baseBtn} btn-success`} onClick={() => executarAcao('aprovar', p.id)}>Aprovar</button>
            <button className={`${baseBtn} btn-danger`} onClick={() => executarAcao('indeferir', p.id)}>Indeferir</button>
            <button className={`${baseBtn} btn-warning`} onClick={() => executarAcao('pausar', p.id)}>Pausar</button>
            <button className={`${baseBtn} btn-secondary`} onClick={() => executarAcao('arquivar', p.id)}>Arquivar</button>
            <button className={`${baseBtn} btn-secondary`} onClick={() => abrirObservacao(p)}>Observação</button>
          </div>
        );
      case 'aprovado':
        return (
          <div className="inbox-actions">
            <button className={`${baseBtn} btn-secondary`} onClick={() => executarAcao('arquivar', p.id)}>Arquivar</button>
            <button className={`${baseBtn} btn-primary`} onClick={() => executarAcao('receber', p.id)}>Reabrir</button>
          </div>
        );
      case 'pausado':
        return (
          <div className="inbox-actions">
            <button className={`${baseBtn} btn-primary`} onClick={() => executarAcao('receber', p.id)}>Retomar</button>
            <button className={`${baseBtn} btn-secondary`} onClick={() => executarAcao('arquivar', p.id)}>Arquivar</button>
          </div>
        );
      case 'arquivado':
      case 'indeferido':
        return (
          <div className="inbox-actions">
            <button className={`${baseBtn} btn-primary`} onClick={() => executarAcao('receber', p.id)}>Reabrir</button>
          </div>
        );
      default:
        return null;
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
          <button className="btn btn-secondary" onClick={() => { setBusca(''); setFiltroPrioridade(''); }}>Limpar</button>
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
                  <td colSpan="9">
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
                    <td><Link to={`/processos/${p.id}`} className="table-link">{p.numero}</Link></td>
                    <td>{p.tipo}</td>
                    <td>{p.assunto}</td>
                    <td>{p.requerente}</td>
                    <td className={`priority-${p.prioridade}`}>{p.prioridade}</td>
                    <td><span className={`badge badge-${p.situacao}`}>{p.situacao}</span></td>
                    <td>{p.setorAtual}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>{acoesPorSituacao(p)}</td>
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

