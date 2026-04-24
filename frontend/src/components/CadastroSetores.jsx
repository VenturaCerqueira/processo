import React, { useState, useEffect } from 'react';
import api from '../api';

function CadastroSetores() {
  const [setores, setSetores] = useState([]);
  const [form, setForm] = useState({ id: null, nome: '', sigla: '' });
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => { carregarSetores(); }, []);

  const carregarSetores = async () => {
    setLoading(true);
    try {
      const res = await api.get('/setores');
      setSetores(res.data);
    } catch { setErro('Erro ao carregar setores.'); }
    finally { setLoading(false); }
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editando) await api.put(`/setores/${form.id}`, form);
      else await api.post('/setores', form);
      setForm({ id: null, nome: '', sigla: '' });
      setEditando(false);
      carregarSetores();
    } catch { setErro('Erro ao salvar setor.'); }
  };

  const editar = (s) => { setForm(s); setEditando(true); };
  const excluir = async (id) => {
    if (!confirm('Deseja desativar este setor?')) return;
    await api.delete(`/setores/${id}`);
    carregarSetores();
  };

  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;

  return (
    <div className="page-content">
      <h2 className="section-title">Cadastro de Setores</h2>
      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>{editando ? 'Editar Setor' : 'Novo Setor'}</h3>
        <form onSubmit={salvar}>
          <div className="form-row">
            <div className="form-group">
              <label>Nome *</label>
              <input type="text" className="form-control" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Sigla</label>
              <input type="text" className="form-control" value={form.sigla} onChange={e => setForm({...form, sigla: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary">{editando ? 'Atualizar' : 'Salvar'}</button>
            {editando && <button type="button" className="btn btn-secondary" onClick={() => { setEditando(false); setForm({ id: null, nome: '', sigla: '' }); }}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Nome</th><th>Sigla</th><th style={{ width: 120 }}>Acoes</th></tr></thead>
            <tbody>
              {setores.length === 0 ? <tr><td colSpan="3" className="empty-state small">Nenhum setor cadastrado</td></tr> :
                setores.map(s => (
                  <tr key={s.id}>
                    <td>{s.nome}</td>
                    <td>{s.sigla || '—'}</td>
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

export default CadastroSetores;

