import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

const tipoConfig = {
  criacao:        { label: 'Criação',        cor: '#10b981', icone: 'M12 4v16m8-8H4' },
  edicao:         { label: 'Edição',         cor: '#f59e0b', icone: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  encaminhamento: { label: 'Encaminhamento', cor: '#3b82f6', icone: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  recebimento:    { label: 'Recebimento',    cor: '#22c55e', icone: 'M5 13l4 4L19 7' },
  retorno:        { label: 'Retorno',        cor: '#f97316', icone: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6' },
  aprovacao:      { label: 'Aprovação',      cor: '#10b981', icone: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  pausa:          { label: 'Pausa',          cor: '#eab308', icone: 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  arquivamento:   { label: 'Arquivamento',   cor: '#6b7280', icone: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
  indeferimento:  { label: 'Indeferimento',  cor: '#ef4444', icone: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
  observacao:     { label: 'Observação',     cor: '#8b5cf6', icone: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  documento:      { label: 'Documento',      cor: '#06b6d4', icone: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  filho:          { label: 'Processo Filho', cor: '#ec4899', icone: 'M12 4v16m8-8H4' },
};

function IconeTipo({ tipo }) {
  const cfg = tipoConfig[tipo] || { cor: '#9ca3af', icone: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' };
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%', background: cfg.cor + '15',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      <svg width="18" height="18" fill="none" stroke={cfg.cor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d={cfg.icone} />
      </svg>
    </div>
  );
}

function Timeline({ historico }) {
  if (!historico || historico.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 32 }}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 48, height: 48, color: 'var(--gray-300)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h4>Nenhum evento no histórico</h4>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingLeft: 18 }}>
      <div style={{
        position: 'absolute', left: 17, top: 8, bottom: 8, width: 2, background: 'var(--gray-100)'
      }} />
      {historico.map((h, i) => {
        const cfg = tipoConfig[h.tipo] || { label: h.tipo, cor: '#9ca3af' };
        return (
          <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 20, position: 'relative' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <IconeTipo tipo={h.tipo} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: cfg.cor, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {cfg.label}
                </span>
                <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                  {new Date(h.data).toLocaleDateString('pt-BR')} às {new Date(h.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.5, margin: 0, wordBreak: 'break-word' }}>
                {h.descricao}
              </p>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
                Por {h.usuarioNome || 'Sistema'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DetalheProcesso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [processo, setProcesso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarEncaminhar, setMostrarEncaminhar] = useState(false);
  const [mostrarObservacao, setMostrarObservacao] = useState(false);
  const [paraSetor, setParaSetor] = useState('');
  const [parecer, setParecer] = useState('');
  const [observacao, setObservacao] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [setores, setSetores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [paraUsuario, setParaUsuario] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    carregarProcesso();
    async function carregarOpcoes() {
      try {
        const [sRes, uRes] = await Promise.all([api.get('/setores'), api.get('/auth/usuarios-ativos')]);
        setSetores(sRes.data);
        setUsuarios(uRes.data);
      } catch (error) { console.error('Erro ao carregar opcoes:', error); }
    }
    carregarOpcoes();
  }, [id]);

  const carregarProcesso = async () => {
    try { const response = await api.get(`/processos/${id}`); setProcesso(response.data); }
    catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleEncaminhar = async (e) => {
    e.preventDefault();
    if (paraUsuario && parseInt(paraUsuario) === currentUser.id) {
      alert('Você não pode encaminhar um processo para si mesmo.');
      return;
    }
    try {
      await api.post(`/processos/${id}/encaminhar`, { para: paraSetor, parecer, paraUsuario });
      setMostrarEncaminhar(false); setParaSetor(''); setParaUsuario(''); setParecer(''); carregarProcesso();
    } catch (error) { alert(error.response?.data?.message || 'Erro ao encaminhar'); }
  };

  const handleSituacaoAcao = async (acao) => {
    try { await api.post(`/processos/${id}/${acao}`); carregarProcesso(); }
    catch (error) { alert(error.response?.data?.message || 'Erro ao executar ação'); }
  };

  const handleObservacao = async (e) => {
    e.preventDefault();
    try { await api.post(`/processos/${id}/observacao`, { texto: observacao }); setMostrarObservacao(false); setObservacao(''); carregarProcesso(); }
    catch { alert('Erro ao adicionar observação'); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!arquivo) return;
    const formData = new FormData();
    formData.append('documento', arquivo);
    try {
      await api.post(`/uploads/${id}/documento`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setArquivo(null); carregarProcesso();
    } catch (error) { alert(error.response?.data?.message || 'Erro ao fazer upload'); }
  };

  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;
  if (!processo) return <div className="page-content"><div className="alert alert-danger">Processo não encontrado</div></div>;

  return (
    <div className="page-content">
      <div className="breadcrumb">
        <Link to="/processos">Processos</Link><span>/</span><span>{processo.numero}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 className="section-title" style={{ marginBottom: 4 }}>Processo {processo.numero}</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>{processo.tipo}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/processos')}>Voltar</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="detail-grid">
          <div className="detail-item"><span className="label">Assunto</span><span className="value">{processo.assunto}</span></div>
          <div className="detail-item"><span className="label">Requerente</span><span className="value">{processo.requerente}</span></div>
          <div className="detail-item"><span className="label">CPF/CNPJ</span><span className="value">{processo.cpfCnpj || '—'}</span></div>
          <div className="detail-item"><span className="label">Status</span><span className="value"><span className={`badge badge-${processo.status}`}>{processo.status}</span></span></div>
          <div className="detail-item"><span className="label">Situação</span><span className="value"><span className={`badge badge-${processo.situacao}`}>{processo.situacao}</span></span></div>
          <div className="detail-item"><span className="label">Prioridade</span><span className={`value priority-${processo.prioridade}`}>{processo.prioridade}</span></div>
          <div className="detail-item"><span className="label">Setor Atual</span><span className="value">{processo.setorAtual}</span></div>
          <div className="detail-item"><span className="label">Usuário Responsável</span><span className="value">{processo.usuarioResponsavelNome || '—'}</span></div>
          <div className="detail-item"><span className="label">Data de Recebimento</span><span className="value">{new Date(processo.dataRecebimento).toLocaleDateString('pt-BR')}</span></div>
          <div className="detail-item"><span className="label">Prazo</span><span className="value">{processo.prazo ? new Date(processo.prazo).toLocaleDateString('pt-BR') : '—'}</span></div>
          {processo.especie_nome && <div className="detail-item"><span className="label">Especie</span><span className="value">{processo.especie_nome}</span></div>}
        </div>
        {processo.descricao && <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--gray-100)' }}>
          <span className="label">Descrição</span>
          <p style={{ marginTop: 6, color: 'var(--gray-600)', fontSize: 14, lineHeight: 1.6 }}>{processo.descricao}</p>
        </div>}
        {processo.especie_mensagem && <div className="alert alert-info" style={{ marginTop: 16 }}>
          <strong>Mensagem da Especie ({processo.especie_nome}):</strong><br />
          {processo.especie_mensagem}
          {processo.especie_prazo_minimo && processo.especie_prazo_maximo && (
            <div style={{ marginTop: 6, fontSize: 12 }}>
              Prazo estabelecido: {processo.especie_prazo_minimo} a {processo.especie_prazo_maximo} dias{processo.especie_dias_uteis ? ' uteis' : ' corridos'}
            </div>
          )}
        </div>}
        <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {processo.situacao !== 'encaminhado' && (
            <button className="btn btn-primary" onClick={() => setMostrarEncaminhar(true)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              Encaminhar
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => setMostrarObservacao(true)}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Observação
          </button>
          <button className="btn btn-info" onClick={() => navigate(`/processos/novo?processoPaiId=${processo.id}`)}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Criar Processo Filho
          </button>
          {processo.situacao === 'encaminhado' && (
            <>
              <button className="btn btn-success" onClick={() => handleSituacaoAcao('receber')}>Receber</button>
              <button className="btn btn-warning" onClick={() => handleSituacaoAcao('voltar')}>Voltar Processo</button>
            </>
          )}
          {(processo.situacao === 'recebido' || processo.situacao === 'retornado') && (
            <>
              <button className="btn btn-success" onClick={() => handleSituacaoAcao('aprovar')}>Aprovar</button>
              <button className="btn btn-danger" onClick={() => handleSituacaoAcao('indeferir')}>Indeferir</button>
              <button className="btn btn-warning" onClick={() => handleSituacaoAcao('pausar')}>Pausar</button>
              <button className="btn btn-secondary" onClick={() => handleSituacaoAcao('arquivar')}>Arquivar</button>
            </>
          )}
          {processo.situacao === 'aprovado' && (
            <>
              <button className="btn btn-secondary" onClick={() => handleSituacaoAcao('arquivar')}>Arquivar</button>
              <button className="btn btn-primary" onClick={() => handleSituacaoAcao('receber')}>Reabrir</button>
            </>
          )}
          {processo.situacao === 'pausado' && (
            <>
              <button className="btn btn-primary" onClick={() => handleSituacaoAcao('receber')}>Retomar</button>
              <button className="btn btn-secondary" onClick={() => handleSituacaoAcao('arquivar')}>Arquivar</button>
            </>
          )}
          {(processo.situacao === 'arquivado' || processo.situacao === 'indeferido') && (
            <button className="btn btn-primary" onClick={() => handleSituacaoAcao('receber')}>Reabrir</button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Histórico Completo ({processo.historico?.length || 0})</span>
        </div>
        <Timeline historico={processo.historico} />
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><span className="card-title">Anexar Documento</span></div>
        <form onSubmit={handleUpload}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="file" className="form-control" style={{ flex: 1, minWidth: 200 }} onChange={e => setArquivo(e.target.files[0])} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" />
            <button type="submit" className="btn btn-success" disabled={!arquivo}>Upload</button>
          </div>
          <p style={{ marginTop: 8, fontSize: 12, color: 'var(--gray-400)' }}>Formatos: PDF, DOC, DOCX, JPG, PNG, TXT • Máximo: 10MB</p>
        </form>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><span className="card-title">Documentos ({processo.documentos?.length || 0})</span></div>
        {(!processo.documentos || processo.documentos.length === 0) ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <h4>Nenhum documento anexado</h4>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Nome</th><th>Tipo</th><th>Versão</th><th>Usuário</th><th>Data</th></tr></thead>
              <tbody>{processo.documentos.map((doc, i) => (
                <tr key={i}><td>{doc.nome}</td><td>{doc.tipo}</td><td>v{doc.versao}</td><td>{doc.usuarioNome || 'N/A'}</td><td>{new Date(doc.dataUpload).toLocaleDateString('pt-BR')}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><span className="card-title">Movimentações ({processo.movimentacoes?.length || 0})</span></div>
        {(!processo.movimentacoes || processo.movimentacoes.length === 0) ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            <h4>Nenhuma movimentação registrada</h4>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>De</th><th>Para</th><th>Parecer</th><th>Usuário</th><th>Data</th></tr></thead>
              <tbody>{processo.movimentacoes.map((mov, i) => (
                <tr key={i}><td>{mov.de}</td><td>{mov.para}</td><td>{mov.parecer || '—'}</td><td>{mov.usuarioNome || 'N/A'}</td><td>{new Date(mov.data).toLocaleDateString('pt-BR')}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><span className="card-title">Observações ({processo.observacoes?.length || 0})</span></div>
        {(!processo.observacoes || processo.observacoes.length === 0) ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            <h4>Nenhuma observação</h4>
          </div>
        ) : (
          <div>{processo.observacoes.map((obs, i) => (
            <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid var(--gray-100)' }}>
              <p style={{ color: 'var(--gray-700)', fontSize: 14, lineHeight: 1.6 }}>{obs.texto}</p>
              <p style={{ color: 'var(--gray-400)', fontSize: 12, marginTop: 6 }}>Por {obs.usuarioNome || 'N/A'} em {new Date(obs.data).toLocaleDateString('pt-BR')}</p>
            </div>
          ))}</div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><span className="card-title">Processos Filhos ({processo.filhos?.length || 0})</span></div>
        {(!processo.filhos || processo.filhos.length === 0) ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
            <h4>Nenhum processo filho</h4>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Número</th><th>Tipo</th><th>Assunto</th><th>Status</th><th>Situação</th><th>Data</th></tr></thead>
              <tbody>{processo.filhos.map((f, i) => (
                <tr key={i}>
                  <td><Link to={`/processos/${f.id}`} className="table-link">{f.numero}</Link></td>
                  <td>{f.tipo}</td>
                  <td>{f.assunto}</td>
                  <td><span className={`badge badge-${f.status}`}>{f.status}</span></td>
                  <td><span className={`badge badge-${f.situacao}`}>{f.situacao}</span></td>
                  <td>{new Date(f.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {mostrarEncaminhar && (
        <div className="modal-overlay" onClick={() => setMostrarEncaminhar(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Encaminhar Processo</h3></div>
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
                    {usuarios.filter(u => u.id !== currentUser.id && (!paraSetor || u.setor === paraSetor)).map(u => (
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

      {mostrarObservacao && (
        <div className="modal-overlay" onClick={() => setMostrarObservacao(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Adicionar Observação</h3></div>
            <div className="modal-body">
              <form id="form-obs" onSubmit={handleObservacao}>
                <div className="form-group">
                  <label>Observação *</label>
                  <textarea className="form-control" rows="4" value={observacao} onChange={e => setObservacao(e.target.value)} required placeholder="Digite a observação..." />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMostrarObservacao(false)}>Cancelar</button>
              <button className="btn btn-primary" form="form-obs">Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalheProcesso;
