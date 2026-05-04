import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api';

// Icons as components
const IconEspecie = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconTipo = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const IconSetor = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const IconAssunto = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const IconPrioridade = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const IconRequerente = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconDocumento = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconTelefone = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 006.516 6.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const IconEmail = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconEndereco = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconPrazo = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconDescricao = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
  </svg>
);

function NovoProcesso() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const processoPaiId = searchParams.get('processoPaiId');

  const [form, setForm] = useState({ tipo: '', assunto: '', requerente: '', cpfCnpj: '', endereco: '', telefone: '', email: '', descricao: '', prioridade: 'normal', prazo: '', setorAtual: '', especie_id: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [tipos, setTipos] = useState([]);
  const [setores, setSetores] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [requerentes, setRequerentes] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [processoPai, setProcessoPai] = useState(null);
  const [especieSelecionada, setEspecieSelecionada] = useState(null);

  useEffect(() => {
    async function carregarOpcoes() {
      try {
        const [tRes, sRes, pRes, cRes, eRes] = await Promise.all([
          api.get('/tipos-processo'),
          api.get('/setores'),
          api.get('/prioridades'),
          api.get('/requerentes'),
          api.get('/especies-processo')
        ]);
        setTipos(tRes.data);
        setSetores(sRes.data);
        setPrioridades(pRes.data);
        setRequerentes(cRes.data);
        setEspecies(eRes.data);
      } catch (error) { console.error('Erro ao carregar opcoes:', error); }
    }
    carregarOpcoes();

    async function carregarProcessoPai() {
      if (!processoPaiId) return;
      try {
        const { data } = await api.get(`/processos/${processoPaiId}`);
        setProcessoPai(data);
        setForm(prev => ({
          ...prev,
          requerente: data.requerente || '',
          cpfCnpj: data.cpfCnpj || '',
          endereco: data.endereco || '',
          telefone: data.telefone || '',
          email: data.email || ''
        }));
      } catch (error) { console.error('Erro ao carregar processo pai:', error); }
    }
    carregarProcessoPai();
  }, [processoPaiId]);

  const calcularPrazo = (dias, diasUteis) => {
    if (!dias) return '';
    const data = new Date();
    let diasAdicionados = 0;
    while (diasAdicionados < dias) {
      data.setDate(data.getDate() + 1);
      if (diasUteis) {
        const diaSemana = data.getDay();
        if (diaSemana !== 0 && diaSemana !== 6) diasAdicionados++;
      } else {
        diasAdicionados++;
      }
    }
    return data.toISOString().split('T')[0];
  };

  const handleEspecieChange = (e) => {
    const especieId = e.target.value;
    const esp = especies.find(ep => ep.id === parseInt(especieId));
    setEspecieSelecionada(esp || null);

    if (esp) {
      setForm(prev => ({
        ...prev,
        especie_id: especieId,
        tipo: esp.tipo_processo_nome || prev.tipo,
        setorAtual: esp.setor_nome || prev.setorAtual,
        prazo: esp.prazo_maximo ? calcularPrazo(esp.prazo_maximo, !!esp.dias_uteis) : prev.prazo
      }));
    } else {
      setForm(prev => ({ ...prev, especie_id: '', prazo: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      const response = processoPaiId
        ? await api.post(`/processos/${processoPaiId}/filho`, form)
        : await api.post('/processos', form);
      navigate(`/processos/${response.data.id}`);
    } catch (error) { setErro(error.response?.data?.message || 'Erro ao criar processo'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-content">
      <div className="breadcrumb">
        <Link to="/caixa-entrada">Caixa de Entrada</Link>
        <span>/</span>
        <span>Novo Processo</span>
      </div>
      <h2 className="section-title">{processoPaiId ? `Novo Processo Filho (Pai: ${processoPai?.numero || processoPaiId})` : 'Novo Processo'}</h2>
      {processoPai && (
        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          <strong>Processo Pai:</strong>{' '}
          <Link to={`/processos/${processoPai.id}`}>{processoPai.numero}</Link> — {processoPai.assunto}
          <br />
          <span style={{ fontSize: 12 }}>Os dados do requerente serão copiados automaticamente.</span>
        </div>
      )}
      {erro && <div className="alert alert-danger">{erro}</div>}
      <div className="card">
        <form onSubmit={handleSubmit}>
          {especies.length > 0 && (
            <div className="form-row">
              <div className="form-group">
                <label>Especie de Processo</label>
                <select className="form-control" value={form.especie_id} onChange={handleEspecieChange}>
                  <option value="">Selecione a especie (opcional)</option>
                  {especies.map(ep => <option key={ep.id} value={ep.id}>{ep.nome}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Prazo</label><input type="date" className="form-control" value={form.prazo} onChange={e => setForm({...form, prazo: e.target.value})} /></div>
            </div>
          )}
          {especieSelecionada?.mensagem_customizada && (
            <div className="alert alert-info" style={{ marginBottom: 16 }}>
              <strong>Mensagem da Especie:</strong><br />
              {especieSelecionada.mensagem_customizada}
              {especieSelecionada.prazo_minimo && especieSelecionada.prazo_maximo && (
                <div style={{ marginTop: 6, fontSize: 12 }}>
                  Prazo: {especieSelecionada.prazo_minimo} a {especieSelecionada.prazo_maximo} dias{especieSelecionada.dias_uteis ? ' uteis' : ' corridos'}
                </div>
              )}
            </div>
          )}
          {especies.length === 0 && (
            <div className="form-row">
              <div className="form-group"><label>Prazo</label><input type="date" className="form-control" value={form.prazo} onChange={e => setForm({...form, prazo: e.target.value})} /></div>
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Processo *</label>
              <select className="form-control" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} required>
                <option value="">Selecione o tipo</option>
              {tipos.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Setor de Entrada *</label>
<select className="form-control" value={form.setorAtual} onChange={e => setForm({...form, setorAtual: e.target.value})} required>
                <option value="">Selecione o setor</option>
              {setores.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Assunto *</label>
              <input type="text" className="form-control" value={form.assunto} onChange={e => setForm({...form, assunto: e.target.value})} required placeholder="Descreva o assunto do processo" />
            </div>
            <div className="form-group">
              <label>Prioridade</label>
              <select className="form-control" value={form.prioridade} onChange={e => setForm({...form, prioridade: e.target.value})}>
                {prioridades.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Requerente *</label><input type="text" className="form-control" value={form.requerente} onChange={e => setForm({...form, requerente: e.target.value})} required /></div>
            <div className="form-group"><label>CPF/CNPJ</label><input type="text" className="form-control" value={form.cpfCnpj} onChange={e => setForm({...form, cpfCnpj: e.target.value})} placeholder="000.000.000-00" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Telefone</label><input type="text" className="form-control" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} /></div>
            <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          </div>
          <div className="form-group">
            <label>Endereço</label>
            <input type="text" className="form-control" value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Descrição</label>
            <textarea className="form-control" rows="4" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} placeholder="Descreva detalhes adicionais do processo..." />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} />Salvando...</> : 'Criar Processo'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/caixa-entrada')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NovoProcesso;

