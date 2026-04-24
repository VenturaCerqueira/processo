import React, { useState, useEffect } from 'react';
import api from '../api';

function CadastroTiposProcesso() {
  const [tipos, setTipos] = useState([]);
  const [form, setForm] = useState({ id: null, nome: '', codigo: '' });
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => { carregarTipos(); }, []);

  const carregarTipos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tipos-processo');
      setTipos(res.data);
    } catch { setErro('Erro ao carregar tipos.'); }
    finally { setLoading(false); }
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editando) await api.put(`/tipos-processo/${form.id}`, form);
      else await api.post('/tipos-processo', form);
      setForm({ id: null, nome: '', codigo: '' });
      setEditando(false);
      carregarTipos();
    } catch { setErro('Erro ao salvar tipo.'); }
  };

  const editar = (t) => { setForm(t); setEditando(true); };
  const excluir = async (id) => {
    if (!confirm('Deseja desativar este tipo?')) return;
    await api.delete(`/tipos-processo/${id}`);
    carregarTipos();
  };

  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;

  return (
    <div className="page-content">
      <h2 className="section-title">Cadastro de Tipos de Processo</h2>
      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>{editando ? 'Editar Tipo' : 'Novo Tipo de Processo'}</h3>
        <form onSubmit={salvar}>
          <div className="form-row">
            <div className="form-group">
              <label>Nome *</label>
              <input type="text" className="form-control" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Codigo</label>
              <input type="text" className="form-control" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary">{editando ? 'Atualizar' : 'Salvar'}</button>
            {editando && <button type="button" className="btn btn-secondary" onClick={() => { setEditando(false); setForm({ id: null, nome: '', codigo: '' }); }}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Nome</th><th>Codigo</th><th style={{ width: 120 }}>Acoes</th></tr></thead>
            <tbody>
              {tipos.length === 0 ? <tr><td colSpan="3" className="empty-state small">Nenhum tipo cadastrado</td></tr> :
                tipos.map(t => (
                  <tr key={t.id}>
                    <td>{t.nome}</td>
                    <td>{t.codigo || '—'}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => editar(t)} style={{ marginRight: 6 }}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => excluir(t.id)}>Desativar</button>
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

export default CadastroTiposProcesso;

