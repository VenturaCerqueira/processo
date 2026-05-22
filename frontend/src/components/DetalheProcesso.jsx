import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

const tipoConfig = {
  criacao:        { label: 'Criação',        cor: '#10b981', icone: 'M12 4v16m8-8H4' },
  edicao:         { label: 'Edição',         cor: '#f59e0b', icone: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  encaminhamento: { label: 'Encaminhamento', cor: '#3b82f6', icone: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  recebimento:    { label: 'Recebimento',    cor: '#22c55e', icone: 'M5 13l4 4L19 7' },
  retorno:        { label: 'Retorno',        cor: '#f97316', icone: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6' },
  aprovacao:      { label: 'Deferimento',  cor: '#10b981', icone: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  pausa:          { label: 'Suspensão',    cor: '#eab308', icone: 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z' },
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

function IconeSvgTipo({ tipo_icone_svg }) {
  if (!tipo_icone_svg) return null;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 10, verticalAlign: 'middle' }}>
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ color: 'var(--gray-600)' }}>
        <path d={tipo_icone_svg} />
      </svg>
    </span>
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
          <p style={{ color: 'var(--gray-500)', fontSize: 14, display: 'flex', alignItems: 'center' }}>
            <IconeSvgTipo tipo_icone_svg={processo.tipo_icone_svg} />
            <span>{processo.tipo}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/processos')}>Voltar</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        {(processo.processoPai || processo.processoPaiId) && (
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            <strong>Processo Pai:</strong>{' '}
            {processo.processoPai ? (
              <>
                <Link to={`/processos/${processo.processoPai.id}`}>{processo.processoPai.numero}</Link>
                <span style={{ color: 'var(--gray-600)' }}> — {processo.processoPai.assunto}</span>
                <div style={{ marginTop: 8, fontSize: 13, color: 'var(--gray-700)' }}>
                  <div><strong>Quem:</strong> {processo.processoPai.requerente}</div>
                  {processo.processoPai.cpfCnpj && <div><strong>CPF/CNPJ:</strong> {processo.processoPai.cpfCnpj}</div>}
                </div>
              </>
            ) : (
              <span style={{ color: 'var(--gray-600)' }}>Processo Pai</span>
            )}
          </div>
        )}
        <div className="detail-hero">
          <div className="detail-hero-left">
            <div className="detail-hero-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z" />
              </svg>
            </div>
          </div>

          <div className="detail-hero-center">
            <div className="detail-hero-title-row">
              <span className="detail-hero-id">Em processo</span>
              <span className="detail-main-name">{processo.assunto}</span>
            </div>
            <div className="detail-hero-subtitle">
              {processo.requerente} · {processo.cpfCnpj || '—'}
            </div>

            <div className="detail-chip-row">
              <span className={`detail-chip info`}>Status: {processo.status}</span>
              <span className={`detail-chip gray`}>Situação: {processo.situacao}</span>
              <span className={`detail-chip primary`}>Prioridade: {processo.prioridade}</span>
              {processo.especie_nome && <span className="detail-chip">Espécie: {processo.especie_nome}</span>}
            </div>
          </div>

          <div className="detail-hero-right">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <span className={`badge badge-${processo.status}`}>{processo.status}</span>
              <span className={`badge badge-${processo.situacao}`}>{processo.situacao}</span>
            </div>
          </div>
        </div>

        <div className="detail-fields-grid">
          <div className="detail-field">
            <span className="detail-field-label">Setor Atual</span>
            <span className="detail-field-value">{processo.setorAtual}</span>
          </div>

          <div className="detail-field">
            <span className="detail-field-label">Usuário Responsável</span>
            <span className="detail-field-value">{processo.usuarioResponsavelNome || '—'}</span>
          </div>

          <div className="detail-field">
            <span className="detail-field-label">Data de Recebimento</span>
            <span className="detail-field-value">{new Date(processo.dataRecebimento).toLocaleDateString('pt-BR')}</span>
          </div>

          <div className="detail-field">
            <span className="detail-field-label">Prazo</span>
            <span className="detail-field-value">{processo.prazo ? new Date(processo.prazo).toLocaleDateString('pt-BR') : '—'}</span>
          </div>
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
              <button className="btn btn-success" onClick={() => handleSituacaoAcao('aprovar')}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Deferir
              </button>
              <button className="btn btn-danger" onClick={() => handleSituacaoAcao('indeferir')}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Indeferir
              </button>
              <button className="btn btn-warning" onClick={() => handleSituacaoAcao('pausar')}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10a3 3 0 013 3v4a3 3 0 01-3 3H7a3 3 0 01-3-3v-4a3 3 0 013-3z" opacity="0.25" />
                </svg>
                Suspender
              </button>
              <button className="btn btn-secondary" onClick={() => handleSituacaoAcao('arquivar')}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M8 3h8m-6 8h4m-9 2v9a2 2 0 002 2h10a2 2 0 002-2v-9" />
                </svg>
                Arquivar
              </button>
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
        <div className="card-header">
          <span className="card-title">Anexar Documento</span>
        </div>

        <div className="upload-card">
          <div className="upload-card-header">
            <div className="upload-card-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M7 10l5-5 5 5" />
                <path d="M12 15V5" />
              </svg>
            </div>

            <div className="upload-card-title-block">
              <div className="upload-card-title">Enviar novo anexo</div>
              <div className="upload-card-subtitle">Selecione um arquivo para anexar ao processo.</div>
            </div>
          </div>

          <form onSubmit={handleUpload} className="upload-form">
            <div className="upload-actions">
              <label className="upload-file" aria-label="Selecionar arquivo">
                <input
                  type="file"
                  onChange={e => setArquivo(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />

                <span className="upload-file-label">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="M7 10l5-5 5 5" />
                    <path d="M12 15V5" />
                  </svg>
                  {arquivo ? arquivo.name : 'Escolher arquivo'}
                </span>
              </label>

              <button type="submit" className="btn btn-success upload-btn" disabled={!arquivo} aria-disabled={!arquivo}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M7 10l5-5 5 5" />
                  <path d="M12 15V5" />
                </svg>
                Upload
              </button>
            </div>

            <p className="upload-hint">Formatos: PDF, DOC, DOCX, JPG, PNG, TXT • Máximo: 10MB</p>
          </form>
        </div>
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
                <tr key={i}>
                  <td>
                    <div className="document-name-cell">
                      {(() => {
                        const tipo = (doc.tipo || '').toLowerCase();
                        const nome = (doc.nome || '').toLowerCase();
                        let kind = 'generic';
                        if (tipo.includes('pdf') || nome.endsWith('.pdf')) kind = 'pdf';
                        else if (tipo.includes('word') || tipo.includes('msword') || nome.endsWith('.doc') || nome.endsWith('.docx')) kind = 'doc';
                        else if (tipo.startsWith('image/') || nome.match(/\.(png|jpe?g|gif|webp)$/)) kind = 'image';
                        else if (tipo.includes('text') || nome.endsWith('.txt') || nome.endsWith('.md')) kind = 'txt';

                        const Icon = () => {
                          if (kind === 'pdf') {
                            return (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <path d="M14 2v6h6" />
                                <path d="M8 13h2a2 2 0 0 1 0 4H8z" />
                                <path d="M14 13h2v4h-2z" />
                              </svg>
                            );
                          }
                          if (kind === 'doc') {
                            return (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <path d="M14 2v6h6" />
                                <path d="M8 13h8" />
                                <path d="M8 17h8" />
                                <path d="M8 9h3" />
                              </svg>
                            );
                          }
                          if (kind === 'image') {
                            return (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <path d="M8.5 10.5l-1 1" />
                                <path d="M21 15l-5-5L5 21" />
                                <path d="M16 8a1 1 0 0 1 0 2" />
                              </svg>
                            );
                          }
                          if (kind === 'txt') {
                            return (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <path d="M14 2v6h6" />
                                <path d="M8 13h8" />
                                <path d="M8 17h5" />
                                <path d="M8 9h3" />
                              </svg>
                            );
                          }
                          return (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <path d="M14 2v6h6" />
                              <path d="M8 13h8" />
                              <path d="M8 17h6" />
                            </svg>
                          );
                        };

                        return (
                          <span className={`document-icon ${kind}`} aria-hidden="true">
                            <Icon />
                          </span>
                        );
                      })()}
                      <span className="document-name" onClick={() => { api.get(`/uploads/download/${doc.id}`, { responseType: 'blob' }).then(res => { const url = window.URL.createObjectURL(res.data); const a = document.createElement('a'); a.href = url; a.download = doc.nome; a.click(); window.URL.revokeObjectURL(url); }).catch(() => alert('Erro ao baixar documento')); }} style={{ cursor: 'pointer' }}>{doc.nome}</span>
                    </div>
                  </td>
                  <td>{doc.tipo}</td>
                  <td>v{doc.versao}</td>
                  <td>{doc.usuarioNome || 'N/A'}</td>
                  <td>{new Date(doc.dataUpload).toLocaleDateString('pt-BR')}</td>
                </tr>
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
              <thead><tr><th>Número</th><th>Tipo</th><th>Assunto</th><th>Status</th><th>Situação</th><th>Data</th><th>Documentos</th></tr></thead>
              <tbody>{processo.filhos.map((f, i) => (
                <tr key={i}>
                  <td><Link to={`/processos/${f.id}`} className="table-link">{f.numero}</Link></td>
                  <td>{f.tipo}</td>
                  <td>{f.assunto}</td>
                  <td><span className={`badge badge-${f.status}`}>{f.status}</span></td>
                  <td><span className={`badge badge-${f.situacao}`}>{f.situacao}</span></td>
                  <td>{new Date(f.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>
                    {f.documentos && f.documentos.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {f.documentos.slice(0, 3).map((doc, idx) => (
                          <div key={idx} style={{ fontSize: 12, color: 'var(--gray-700)' }}>
                            {doc.nome}
                            <span style={{ color: 'var(--gray-400)' }}>
                              {' '}(v{doc.versao})
                            </span>
                          </div>
                        ))}
                        {f.documentos.length > 3 && (
                          <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                            +{f.documentos.length - 3} documento(s)
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--gray-400)' }}>—</span>
                    )}
                  </td>
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
                  <label>Setor de Destino</label>
                  <input
                    type="text"
                    className="form-control"
                    value={processo?.setorDestino || processo?.setorAtual || ''}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Usuário Destino</label>
                  <select className="form-control" value={paraUsuario} onChange={e => setParaUsuario(e.target.value)}>
                    <option value="">Selecione o usuário (opcional)</option>
                    {usuarios.filter(u => u.id !== currentUser.id).map(u => (
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
              <button className="btn btn-secondary" onClick={() => setMostrarObservacao(false)}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </button>
              <button className="btn btn-primary" form="form-obs">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                </svg>
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalheProcesso;



