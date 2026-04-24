import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

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

  useEffect(() => {
    carregarProcesso();
    async function carregarSetores() {
      try {
        const res = await api.get('/setores');
        setSetores(res.data);
      } catch (error) { console.error('Erro ao carregar setores:', error); }
    }
    carregarSetores();
  }, [id]);

  const carregarProcesso = async () => {
    try { const response = await api.get(`/processos/${id}`); setProcesso(response.data); }
    catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleEncaminhar = async (e) => {
    e.preventDefault();
    try { await api.post(`/processos/${id}/encaminhar`, { para: paraSetor, parecer }); setMostrarEncaminhar(false); setParaSetor(''); setParecer(''); carregarProcesso(); }
    catch (error) { alert(error.response?.data?.message || 'Erro ao encaminhar'); }
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

  const handleStatusChange = async (novoStatus) => {
    try { await api.put(`/processos/${id}`, { status: novoStatus }); carregarProcesso(); }
    catch { alert('Erro ao atualizar status'); }
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
          <select className="form-control" style={{ width: 'auto', minWidth: 140 }} value={processo.status} onChange={e => handleStatusChange(e.target.value)}>
            <option value="tramitando">Tramitando</option>
            <option value="aguardando">Aguardando</option>
            <option value="concluido">Concluído</option>
            <option value="arquivado">Arquivado</option>
          </select>
          <button className="btn btn-secondary" onClick={() => navigate('/processos')}>Voltar</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="detail-grid">
          <div className="detail-item"><span className="label">Assunto</span><span className="value">{processo.assunto}</span></div>
          <div className="detail-item"><span className="label">Requerente</span><span className="value">{processo.requerente}</span></div>
          <div className="detail-item"><span className="label">CPF/CNPJ</span><span className="value">{processo.cpfCnpj || '—'}</span></div>
          <div className="detail-item"><span className="label">Status</span><span className="value"><span className={`badge badge-${processo.status}`}>{processo.status}</span></span></div>
          <div className="detail-item"><span className="label">Prioridade</span><span className={`value priority-${processo.prioridade}`}>{processo.prioridade}</span></div>
          <div className="detail-item"><span className="label">Setor Atual</span><span className="value">{processo.setorAtual}</span></div>
          <div className="detail-item"><span className="label">Data de Recebimento</span><span className="value">{new Date(processo.dataRecebimento).toLocaleDateString('pt-BR')}</span></div>
          <div className="detail-item"><span className="label">Prazo</span><span className="value">{processo.prazo ? new Date(processo.prazo).toLocaleDateString('pt-BR') : '—'}</span></div>
        </div>
        {processo.descricao && <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--gray-100)' }}>
          <span className="label">Descrição</span>
          <p style={{ marginTop: 6, color: 'var(--gray-600)', fontSize: 14, lineHeight: 1.6 }}>{processo.descricao}</p>
        </div>}
        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => setMostrarEncaminhar(true)}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            Encaminhar
          </button>
          <button className="btn btn-secondary" onClick={() => setMostrarObservacao(true)}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Observação
          </button>
        </div>
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

      <div className="card">
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

      {mostrarEncaminhar && (
        <div className="modal-overlay" onClick={() => setMostrarEncaminhar(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Encaminhar Processo</h3></div>
            <div className="modal-body">
              <form id="form-encaminhar" onSubmit={handleEncaminhar}>
                <div className="form-group">
                  <label>Setor de Destino *</label>
                  <select className="form-control" value={paraSetor} onChange={e => setParaSetor(e.target.value)} required>
                    <option value="">Selecione</option>
                    {setores.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
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

