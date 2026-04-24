import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function NovoProcesso() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ tipo: '', assunto: '', requerente: '', cpfCnpj: '', endereco: '', telefone: '', email: '', descricao: '', prioridade: 'normal', prazo: '', setorAtual: '', especie_id: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [tipos, setTipos] = useState([]);
  const [setores, setSetores] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [requerentes, setRequerentes] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [especieSelecionada, setEspecieSelecionada] = useState(null);

  useEffect(() => {
    async function carregarOpcoes() {
      try {
        const [tRes, sRes, pRes, cRes] = await Promise.all([
          api.get('/tipos-processo'),
          api.get('/setores'),
          api.get('/prioridades'),
          api.get('/requerentes')
        ]);
        setTipos(tRes.data);
        setSetores(sRes.data);
        setPrioridades(pRes.data);
        setRequerentes(cRes.data);
      } catch (error) { console.error('Erro ao carregar opcoes:', error); }
    }
    carregarOpcoes();
  }, []);

  useEffect(() => {
    async function carregarEspecies() {
      setEspecieSelecionada(null);
      setForm(prev => ({ ...prev, especie_id: '' }));
      if (!form.tipo || !form.setorAtual) {
        setEspecies([]);
        return;
      }
      try {
        const tipoObj = tipos.find(t => t.nome === form.tipo);
        const setorObj = setores.find(s => s.nome === form.setorAtual);
        if (!tipoObj || !setorObj) return;
        const res = await api.get(`/especies-processo?tipo=${tipoObj.id}&setor=${setorObj.id}`);
        setEspecies(res.data);
      } catch (error) { console.error('Erro ao carregar especies:', error); }
    }
    carregarEspecies();
  }, [form.tipo, form.setorAtual, tipos, setores]);

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
    setForm(prev => ({ ...prev, especie_id: especieId }));
    if (esp?.prazo_maximo) {
      const novoPrazo = calcularPrazo(esp.prazo_maximo, !!esp.dias_uteis);
      setForm(prev => ({ ...prev, prazo: novoPrazo }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      const response = await api.post('/processos', form);
      navigate(`/processos/${response.data.id}`);
    } catch (error) { setErro(error.response?.data?.message || 'Erro ao criar processo'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-content">
      <div className="breadcrumb">
        <Link to="/processos">Processos</Link>
        <span>/</span>
        <span>Novo Processo</span>
      </div>
      <h2 className="section-title">Novo Processo</h2>
      {erro && <div className="alert alert-danger">{erro}</div>}
      <div className="card">
        <form onSubmit={handleSubmit}>
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
          {especies.length > 0 && (
            <div className="form-row">
              <div className="form-group">
                <label>Especie de Processo</label>
                <select className="form-control" value={form.especie_id} onChange={handleEspecieChange}>
                  <option value="">Selecione a especie</option>
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
          <div className="form-group">
            <label>Descrição</label>
            <textarea className="form-control" rows="4" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} placeholder="Descreva detalhes adicionais do processo..." />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} />Salvando...</> : 'Criar Processo'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/processos')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NovoProcesso;

