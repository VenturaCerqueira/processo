import React, { useState, useEffect } from 'react';
import api from '../api';

function CadastroPrioridades() {
  const [prioridades, setPrioridades] = useState([]);
  const [form, setForm] = useState({ id: null, nome: '', nivel: 0, cor: '#2563eb' });
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => { carregarPrioridades(); }, []);

  const carregarPrioridades = async () => {
    setLoading(true);
    try {
      const res = await api.get('/prioridades');
      setPrioridades(res.data);
    } catch { setErro('Erro ao carregar prioridades.'); }
    finally { setLoading(false); }
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editando) await api.put(`/prioridades/${form.id}`, form);
      else await api.post('/prioridades', form);
      setForm({ id: null, nome: '', nivel: 0, cor: '#2563eb' });
      setEditando(false);
      carregarPrioridades();
    } catch { setErro('Erro ao salvar prioridade.'); }
  };

  const editar = (p) => { setForm(p); setEditando(true); };
  const excluir = async (id) => {
    if (!confirm('Deseja desativar esta prioridade?')) return;
    await api.delete(`/prioridades/${id}`);
    carregarPrioridades();
  };

  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;

  return (
    <div className="page-content">
      <h2 className="section-title">Cadastro de Prioridades</h2>
      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>{editando ? 'Editar Prioridade' : 'Nova Prioridade'}</h3>
        <form onSubmit={salvar}>
          <div className="form-row">
            <div className="form-group">
              <label>Nome *</label>
              <input type="text" className="form-control" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Nivel</label>
              <input type="number" className="form-control" value={form.nivel} onChange={e => setForm({...form, nivel: parseInt(e.target.value) || 0})} />
            </div>
            <div className="form-group">
              <label>Cor</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" value={form.cor} onChange={e => setForm({...form, cor: e.target.value})} style={{ width: 50, height: 40, border: 'none', cursor: 'pointer' }} />
                <input type="text" className="form-control" value={form.cor} onChange={e => setForm({...form, cor: e.target.value})} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary">{editando ? 'Atualizar' : 'Salvar'}</button>
            {editando && <button type="button" className="btn btn-secondary" onClick={() => { setEditando(false); setForm({ id: null, nome: '', nivel: 0, cor: '#2563eb' }); }}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Nome</th><th>Nivel</th><th>Cor</th><th style={{ width: 120 }}>Acoes</th></tr></thead>
            <tbody>
              {prioridades.length === 0 ? <tr><td colSpan="4" className="empty-state small">Nenhuma prioridade cadastrada</td></tr> :
                prioridades.map(p => (
                  <tr key={p.id}>
                    <td>{p.nome}</td>
                    <td>{p.nivel}</td>
                    <td><span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: 4, background: p.cor, border: '1px solid var(--gray-200)' }} /></td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => editar(p)} style={{ marginRight: 6 }}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => excluir(p.id)}>Desativar</button>
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

export default CadastroPrioridades;

