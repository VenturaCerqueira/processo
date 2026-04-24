import React, { useState, useEffect } from 'react';
import api from '../api';

function CadastroEntidades() {
  const [entidades, setEntidades] = useState([]);
  const [form, setForm] = useState({ id: null, nome: '', slug: '', database_name: '', username: '', host: '', port: '' });
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => { carregarEntidades(); }, []);

  const carregarEntidades = async () => {
    setLoading(true);
    try {
      const res = await api.get('/entidades');
      setEntidades(res.data);
    } catch { setErro('Erro ao carregar entidades.'); }
    finally { setLoading(false); }
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editando) await api.put(`/entidades/${form.id}`, form);
      else await api.post('/entidades', form);
      setForm({ id: null, nome: '', slug: '', database_name: '', username: '', host: '', port: '' });
      setEditando(false);
      carregarEntidades();
    } catch { setErro('Erro ao salvar entidade.'); }
  };

  const editar = (s) => { setForm(s); setEditando(true); };
  const excluir = async (id) => {
    if (!confirm('Deseja desativar esta entidade?')) return;
    await api.delete(`/entidades/${id}`);
    carregarEntidades();
  };

  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;

  return (
    <div className="page-content">
      <h2 className="section-title">Cadastro de Entidades</h2>
      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>{editando ? 'Editar Entidade' : 'Nova Entidade'}</h3>
        <form onSubmit={salvar}>
          <div className="form-row">
            <div className="form-group">
              <label>Nome *</label>
              <input type="text" className="form-control" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Slug *</label>
              <input type="text" className="form-control" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Database</label>
              <input type="text" className="form-control" value={form.database_name} onChange={e => setForm({...form, database_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input type="text" className="form-control" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Host</label>
              <input type="text" className="form-control" value={form.host} onChange={e => setForm({...form, host: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Port</label>
              <input type="text" className="form-control" value={form.port} onChange={e => setForm({...form, port: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary">{editando ? 'Atualizar' : 'Salvar'}</button>
            {editando && <button type="button" className="btn btn-secondary" onClick={() => { setEditando(false); setForm({ id: null, nome: '', slug: '', database_name: '', username: '', host: '', port: '' }); }}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Nome</th><th>Slug</th><th>Database</th><th>Host</th><th>Port</th><th style={{ width: 120 }}>Acoes</th></tr></thead>
            <tbody>
              {entidades.length === 0 ? <tr><td colSpan="6" className="empty-state small">Nenhuma entidade cadastrada</td></tr> :
                entidades.map(s => (
                  <tr key={s.id}>
                    <td>{s.nome}</td>
                    <td>{s.slug || '—'}</td>
                    <td>{s.database_name || '—'}</td>
                    <td>{s.host || '—'}</td>
                    <td>{s.port || '—'}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => editar(s)} style={{ marginRight: 6 }}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => excluir(s.id)}>Desativar</button>
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

export default CadastroEntidades;

