import React, { useState, useEffect } from 'react';
import api from '../api';

const estados = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

function CadastroRequerentes() {
  const [requerentes, setRequerentes] = useState([]);
  const [form, setForm] = useState({
    id: null, nome: '', cpfCnpj: '', tipoPessoa: 'fisica',
    endereco: '', numero: '', complemento: '', bairro: '',
    cidade: '', estado: '', cep: '', telefone: '', email: ''
  });
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => { carregarRequerentes(); }, []);

  const carregarRequerentes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requerentes');
      setRequerentes(res.data);
    } catch { setErro('Erro ao carregar requerentes.'); }
    finally { setLoading(false); }
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editando) await api.put(`/requerentes/${form.id}`, form);
      else await api.post('/requerentes', form);
      setForm({ id: null, nome: '', cpfCnpj: '', tipoPessoa: 'fisica', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '', telefone: '', email: '' });
      setEditando(false);
      carregarRequerentes();
    } catch { setErro('Erro ao salvar requerente.'); }
  };

  const editar = (c) => { setForm(c); setEditando(true); };
  const excluir = async (id) => {
    if (!confirm('Deseja desativar este requerente?')) return;
    await api.delete(`/requerentes/${id}`);
    carregarRequerentes();
  };

  const buscar = async () => {
    const res = await api.get(`/requerentes?busca=${encodeURIComponent(busca)}`);
    setRequerentes(res.data);
  };

  const formatarCpfCnpj = (v) => {
    if (!v) return '';
    v = v.replace(/\D/g, '');
    if (v.length <= 11) return v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return v.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;

  return (
    <div className="page-content">
      <h2 className="section-title">Cadastro de Requerentes</h2>
      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>{editando ? 'Editar Requerente' : 'Novo Requerente'}</h3>
        <form onSubmit={salvar}>
          <div className="form-row">
            <div className="form-group">
              <label>Nome *</label>
              <input type="text" className="form-control" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Tipo de Pessoa</label>
              <select className="form-control" value={form.tipoPessoa} onChange={e => setForm({...form, tipoPessoa: e.target.value})}>
                <option value="fisica">Fisica</option>
                <option value="juridica">Juridica</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>CPF/CNPJ</label>
              <input type="text" className="form-control" value={form.cpfCnpj} onChange={e => setForm({...form, cpfCnpj: formatarCpfCnpj(e.target.value)})} placeholder="000.000.000-00 ou 00.000.000/0000-00" />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input type="text" className="form-control" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Endereco</label>
              <input type="text" className="form-control" value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Numero</label>
              <input type="text" className="form-control" value={form.numero} onChange={e => setForm({...form, numero: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Complemento</label>
              <input type="text" className="form-control" value={form.complemento} onChange={e => setForm({...form, complemento: e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Bairro</label>
              <input type="text" className="form-control" value={form.bairro} onChange={e => setForm({...form, bairro: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Cidade</label>
              <input type="text" className="form-control" value={form.cidade} onChange={e => setForm({...form, cidade: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select className="form-control" value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                <option value="">Selecione</option>
                {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>CEP</label>
              <input type="text" className="form-control" value={form.cep} onChange={e => setForm({...form, cep: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary">{editando ? 'Atualizar' : 'Salvar'}</button>
            {editando && <button type="button" className="btn btn-secondary" onClick={() => { setEditando(false); setForm({ id: null, nome: '', cpfCnpj: '', tipoPessoa: 'fisica', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '', telefone: '', email: '' }); }}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="search-box" style={{ marginBottom: 16 }}>
          <input type="text" className="form-control" placeholder="Buscar por nome ou CPF/CNPJ..." value={busca} onChange={e => setBusca(e.target.value)} />
          <button className="btn btn-primary" onClick={buscar}>Buscar</button>
          <button className="btn btn-secondary" onClick={() => { setBusca(''); carregarRequerentes(); }}>Limpar</button>
        </div>
        <div className="table-container">
          <table>
            <thead><tr><th>Nome</th><th>CPF/CNPJ</th><th>Cidade/UF</th><th>Telefone</th><th style={{ width: 120 }}>Acoes</th></tr></thead>
            <tbody>
              {requerentes.length === 0 ? <tr><td colSpan="5" className="empty-state small">Nenhum requerente cadastrado</td></tr> :
                requerentes.map(c => (
                  <tr key={c.id}>
                    <td>{c.nome}</td>
                    <td>{c.cpfCnpj || '—'}</td>
                    <td>{c.cidade ? `${c.cidade}/${c.estado}` : '—'}</td>
                    <td>{c.telefone || '—'}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => editar(c)} style={{ marginRight: 6 }}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => excluir(c.id)}>Desativar</button>
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

export default CadastroRequerentes;

