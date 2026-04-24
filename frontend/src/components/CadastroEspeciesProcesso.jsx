import React, { useState, useEffect } from 'react';
import api from '../api';

function CadastroEspeciesProcesso() {
  const [especies, setEspecies] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [setores, setSetores] = useState([]);
  const [form, setForm] = useState({
    id: null,
    nome: '',
    tipo_processo_id: '',
    setor_id: '',
    prazo_minimo: '',
    prazo_maximo: '',
    dias_uteis: false,
    mensagem_customizada: ''
  });
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [eRes, tRes, sRes] = await Promise.all([
        api.get('/especies-processo'),
        api.get('/tipos-processo'),
        api.get('/setores')
      ]);
      setEspecies(eRes.data);
      setTipos(tRes.data);
      setSetores(sRes.data);
    } catch {
      setErro('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        prazo_minimo: form.prazo_minimo ? parseInt(form.prazo_minimo) : null,
        prazo_maximo: form.prazo_maximo ? parseInt(form.prazo_maximo) : null
      };
      if (editando) await api.put(`/especies-processo/${form.id}`, payload);
      else await api.post('/especies-processo', payload);
      setForm({
        id: null, nome: '', tipo_processo_id: '', setor_id: '',
        prazo_minimo: '', prazo_maximo: '', dias_uteis: false, mensagem_customizada: ''
      });
      setEditando(false);
      carregarDados();
    } catch {
      setErro('Erro ao salvar especie.');
    }
  };

  const editar = (item) => {
    setForm({
      ...item,
      dias_uteis: !!item.dias_uteis,
      prazo_minimo: item.prazo_minimo || '',
      prazo_maximo: item.prazo_maximo || '',
      mensagem_customizada: item.mensagem_customizada || ''
    });
    setEditando(true);
  };

  const excluir = async (id) => {
    if (!confirm('Deseja desativar esta especie?')) return;
    await api.delete(`/especies-processo/${id}`);
    carregarDados();
  };

  const getTipoNome = (id) => tipos.find(t => t.id === id)?.nome || '—';
  const getSetorNome = (id) => setores.find(s => s.id === id)?.nome || '—';

  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;

  return (
    <div className="page-content">
      <h2 className="section-title">Cadastro de Especies de Processo</h2>
      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>{editando ? 'Editar Especie' : 'Nova Especie de Processo'}</h3>
        <form onSubmit={salvar}>
          <div className="form-row">
            <div className="form-group">
              <label>Nome *</label>
              <input type="text" className="form-control" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Tipo de Processo</label>
              <select className="form-control" value={form.tipo_processo_id} onChange={e => setForm({...form, tipo_processo_id: e.target.value})}>
                <option value="">Selecione</option>
                {tipos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Setor Responsavel</label>
              <select className="form-control" value={form.setor_id} onChange={e => setForm({...form, setor_id: e.target.value})}>
                <option value="">Selecione</option>
                {setores.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Prazo Minimo (dias)</label>
              <input type="number" className="form-control" value={form.prazo_minimo} onChange={e => setForm({...form, prazo_minimo: e.target.value})} min="0" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Prazo Maximo (dias)</label>
              <input type="number" className="form-control" value={form.prazo_maximo} onChange={e => setForm({...form, prazo_maximo: e.target.value})} min="0" />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 28 }}>
              <input type="checkbox" id="dias_uteis" checked={form.dias_uteis} onChange={e => setForm({...form, dias_uteis: e.target.checked})} />
              <label htmlFor="dias_uteis" style={{ margin: 0 }}>Contar dias uteis</label>
            </div>
          </div>
          <div className="form-group">
            <label>Mensagem Customizada</label>
            <textarea className="form-control" rows="3" value={form.mensagem_customizada} onChange={e => setForm({...form, mensagem_customizada: e.target.value})} placeholder="Mensagem que sera exibida nos processos desta especie..." />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary">{editando ? 'Atualizar' : 'Salvar'}</button>
            {editando && <button type="button" className="btn btn-secondary" onClick={() => { setEditando(false); setForm({ id: null, nome: '', tipo_processo_id: '', setor_id: '', prazo_minimo: '', prazo_maximo: '', dias_uteis: false, mensagem_customizada: '' }); }}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo de Processo</th>
                <th>Setor</th>
                <th>Prazo Min</th>
                <th>Prazo Max</th>
                <th>Dias Uteis</th>
                <th style={{ width: 120 }}>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {especies.length === 0 ? <tr><td colSpan="7" className="empty-state small">Nenhuma especie cadastrada</td></tr> :
                especies.map(item => (
                  <tr key={item.id}>
                    <td>{item.nome}</td>
                    <td>{item.tipo_processo_nome || getTipoNome(item.tipo_processo_id)}</td>
                    <td>{item.setor_nome || getSetorNome(item.setor_id)}</td>
                    <td>{item.prazo_minimo ?? '—'}</td>
                    <td>{item.prazo_maximo ?? '—'}</td>
                    <td>{item.dias_uteis ? 'Sim' : 'Nao'}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => editar(item)} style={{ marginRight: 6 }}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => excluir(item.id)}>Desativar</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CadastroEspeciesProcesso;

