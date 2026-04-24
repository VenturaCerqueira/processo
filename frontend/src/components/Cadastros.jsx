import React, { useState, useEffect } from 'react';
import api from '../api';

const estados = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

function Cadastros() {
  const [aba, setAba] = useState('tipos');

  // Tipos de Processo
  const [tipos, setTipos] = useState([]);
  const [tipoForm, setTipoForm] = useState({ id: null, nome: '', codigo: '' });
  const [tipoEditando, setTipoEditando] = useState(false);

  // Setores
  const [setores, setSetores] = useState([]);
  const [setorForm, setSetorForm] = useState({ id: null, nome: '', sigla: '' });
  const [setorEditando, setSetorEditando] = useState(false);

  // Prioridades
  const [prioridades, setPrioridades] = useState([]);
  const [prioridadeForm, setPrioridadeForm] = useState({ id: null, nome: '', nivel: 0, cor: '#2563eb' });
  const [prioridadeEditando, setPrioridadeEditando] = useState(false);

  // Requerentes
  const [requerentes, setRequerentes] = useState([]);
  const [requerenteForm, setRequerenteForm] = useState({
    id: null, nome: '', cpfCnpj: '', tipoPessoa: 'fisica',
    endereco: '', numero: '', complemento: '', bairro: '',
    cidade: '', estado: '', cep: '', telefone: '', email: ''
  });
  const [requerenteEditando, setRequerenteEditando] = useState(false);
  const [buscaRequerente, setBuscaRequerente] = useState('');

  // Entidades
  const [entidades, setEntidades] = useState([]);
  const [entidadeForm, setEntidadeForm] = useState({ id: null, nome: '', slug: '', database_name: '', username: '', host: '', port: '' });
  const [entidadeEditando, setEntidadeEditando] = useState(false);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [tRes, sRes, pRes, cRes, eRes] = await Promise.all([
        api.get('/tipos-processo'),
        api.get('/setores'),
        api.get('/prioridades'),
        api.get('/requerentes'),
        api.get('/entidades')
      ]);
      setTipos(tRes.data);
      setSetores(sRes.data);
      setPrioridades(pRes.data);
      setRequerentes(cRes.data);
      setEntidades(eRes.data);
    } catch (error) {
      setErro('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  // --- TIPOS ---
  const salvarTipo = async (e) => {
    e.preventDefault();
    try {
      if (tipoEditando) await api.put(`/tipos-processo/${tipoForm.id}`, tipoForm);
      else await api.post('/tipos-processo', tipoForm);
      setTipoForm({ id: null, nome: '', codigo: '' });
      setTipoEditando(false);
      const res = await api.get('/tipos-processo');
      setTipos(res.data);
    } catch { setErro('Erro ao salvar tipo.'); }
  };
  const editarTipo = (t) => { setTipoForm(t); setTipoEditando(true); };
  const excluirTipo = async (id) => {
    if (!confirm('Deseja desativar este tipo?')) return;
    await api.delete(`/tipos-processo/${id}`);
    const res = await api.get('/tipos-processo');
    setTipos(res.data);
  };

  // --- SETORES ---
  const salvarSetor = async (e) => {
    e.preventDefault();
    try {
      if (setorEditando) await api.put(`/setores/${setorForm.id}`, setorForm);
      else await api.post('/setores', setorForm);
      setSetorForm({ id: null, nome: '', sigla: '' });
      setSetorEditando(false);
      const res = await api.get('/setores');
      setSetores(res.data);
    } catch { setErro('Erro ao salvar setor.'); }
  };
  const editarSetor = (s) => { setSetorForm(s); setSetorEditando(true); };
  const excluirSetor = async (id) => {
    if (!confirm('Deseja desativar este setor?')) return;
    await api.delete(`/setores/${id}`);
    const res = await api.get('/setores');
    setSetores(res.data);
  };

  // --- PRIORIDADES ---
  const salvarPrioridade = async (e) => {
    e.preventDefault();
    try {
      if (prioridadeEditando) await api.put(`/prioridades/${prioridadeForm.id}`, prioridadeForm);
      else await api.post('/prioridades', prioridadeForm);
      setPrioridadeForm({ id: null, nome: '', nivel: 0, cor: '#2563eb' });
      setPrioridadeEditando(false);
      const res = await api.get('/prioridades');
      setPrioridades(res.data);
    } catch { setErro('Erro ao salvar prioridade.'); }
  };
  const editarPrioridade = (p) => { setPrioridadeForm(p); setPrioridadeEditando(true); };
  const excluirPrioridade = async (id) => {
    if (!confirm('Deseja desativar esta prioridade?')) return;
    await api.delete(`/prioridades/${id}`);
    const res = await api.get('/prioridades');
    setPrioridades(res.data);
  };

  // --- REQUERENTES ---
  const salvarRequerente = async (e) => {
    e.preventDefault();
    try {
      if (requerenteEditando) await api.put(`/requerentes/${requerenteForm.id}`, requerenteForm);
      else await api.post('/requerentes', requerenteForm);
      setRequerenteForm({ id: null, nome: '', cpfCnpj: '', tipoPessoa: 'fisica', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '', telefone: '', email: '' });
      setRequerenteEditando(false);
      const res = await api.get('/requerentes');
      setRequerentes(res.data);
    } catch { setErro('Erro ao salvar requerente.'); }
  };
  const editarRequerente = (c) => { setRequerenteForm(c); setRequerenteEditando(true); };
  const excluirRequerente = async (id) => {
    if (!confirm('Deseja desativar este requerente?')) return;
    await api.delete(`/requerentes/${id}`);
    const res = await api.get('/requerentes');
    setRequerentes(res.data);
  };
  const buscarRequerentes = async () => {
    const res = await api.get(`/requerentes?busca=${encodeURIComponent(buscaRequerente)}`);
    setRequerentes(res.data);
  };

  const formatarCpfCnpj = (v) => {
    if (!v) return '';
    v = v.replace(/\D/g, '');
    if (v.length <= 11) return v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return v.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  // --- ENTIDADES ---
  const salvarEntidade = async (e) => {
    e.preventDefault();
    try {
      if (entidadeEditando) await api.put(`/entidades/${entidadeForm.id}`, entidadeForm);
      else await api.post('/entidades', entidadeForm);
      setEntidadeForm({ id: null, nome: '', slug: '', database_name: '', username: '', host: '', port: '' });
      setEntidadeEditando(false);
      const res = await api.get('/entidades');
      setEntidades(res.data);
    } catch { setErro('Erro ao salvar entidade.'); }
  };
  const editarEntidade = (e) => { setEntidadeForm(e); setEntidadeEditando(true); };
  const excluirEntidade = async (id) => {
    if (!confirm('Deseja desativar esta entidade?')) return;
    await api.delete(`/entidades/${id}`);
    const res = await api.get('/entidades');
    setEntidades(res.data);
  };

  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;

  return (
    <div className="page-content">
      <h2 className="section-title">Cadastros</h2>
      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="tabs" style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid var(--gray-200)', paddingBottom: 2 }}>
        {[
          { key: 'tipos', label: 'Tipos de Processo' },
          { key: 'setores', label: 'Setores' },
          { key: 'prioridades', label: 'Prioridades' },
          { key: 'requerentes', label: 'Requerentes' },
          { key: 'entidades', label: 'Entidades' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setAba(tab.key)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              fontSize: 14,
              fontWeight: 600,
              color: aba === tab.key ? 'var(--primary)' : 'var(--gray-500)',
              borderBottom: aba === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -2,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TIPOS DE PROCESSO */}
      {aba === 'tipos' && (
        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>{tipoEditando ? 'Editar Tipo' : 'Novo Tipo de Processo'}</h3>
            <form onSubmit={salvarTipo}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome *</label>
                  <input type="text" className="form-control" value={tipoForm.nome} onChange={e => setTipoForm({...tipoForm, nome: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Codigo</label>
                  <input type="text" className="form-control" value={tipoForm.codigo} onChange={e => setTipoForm({...tipoForm, codigo: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary">{tipoEditando ? 'Atualizar' : 'Salvar'}</button>
                {tipoEditando && <button type="button" className="btn btn-secondary" onClick={() => { setTipoEditando(false); setTipoForm({ id: null, nome: '', codigo: '' }); }}>Cancelar</button>}
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
                          <button className="btn btn-sm btn-secondary" onClick={() => editarTipo(t)} style={{ marginRight: 6 }}>Editar</button>
                          <button className="btn btn-sm btn-danger" onClick={() => excluirTipo(t.id)}>Desativar</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SETORES */}
      {aba === 'setores' && (
        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>{setorEditando ? 'Editar Setor' : 'Novo Setor'}</h3>
            <form onSubmit={salvarSetor}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome *</label>
                  <input type="text" className="form-control" value={setorForm.nome} onChange={e => setSetorForm({...setorForm, nome: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Sigla</label>
                  <input type="text" className="form-control" value={setorForm.sigla} onChange={e => setSetorForm({...setorForm, sigla: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary">{setorEditando ? 'Atualizar' : 'Salvar'}</button>
                {setorEditando && <button type="button" className="btn btn-secondary" onClick={() => { setSetorEditando(false); setSetorForm({ id: null, nome: '', sigla: '' }); }}>Cancelar</button>}
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
                          <button className="btn btn-sm btn-secondary" onClick={() => editarSetor(s)} style={{ marginRight: 6 }}>Editar</button>
                          <button className="btn btn-sm btn-danger" onClick={() => excluirSetor(s.id)}>Desativar</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRIORIDADES */}
      {aba === 'prioridades' && (
        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>{prioridadeEditando ? 'Editar Prioridade' : 'Nova Prioridade'}</h3>
            <form onSubmit={salvarPrioridade}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome *</label>
                  <input type="text" className="form-control" value={prioridadeForm.nome} onChange={e => setPrioridadeForm({...prioridadeForm, nome: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Nivel</label>
                  <input type="number" className="form-control" value={prioridadeForm.nivel} onChange={e => setPrioridadeForm({...prioridadeForm, nivel: parseInt(e.target.value) || 0})} />
                </div>
                <div className="form-group">
                  <label>Cor</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="color" value={prioridadeForm.cor} onChange={e => setPrioridadeForm({...prioridadeForm, cor: e.target.value})} style={{ width: 50, height: 40, border: 'none', cursor: 'pointer' }} />
                    <input type="text" className="form-control" value={prioridadeForm.cor} onChange={e => setPrioridadeForm({...prioridadeForm, cor: e.target.value})} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary">{prioridadeEditando ? 'Atualizar' : 'Salvar'}</button>
                {prioridadeEditando && <button type="button" className="btn btn-secondary" onClick={() => { setPrioridadeEditando(false); setPrioridadeForm({ id: null, nome: '', nivel: 0, cor: '#2563eb' }); }}>Cancelar</button>}
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
                          <button className="btn btn-sm btn-secondary" onClick={() => editarPrioridade(p)} style={{ marginRight: 6 }}>Editar</button>
                          <button className="btn btn-sm btn-danger" onClick={() => excluirPrioridade(p.id)}>Desativar</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REQUERENTES */}
      {aba === 'requerentes' && (
        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>{requerenteEditando ? 'Editar Requerente' : 'Novo Requerente'}</h3>
            <form onSubmit={salvarRequerente}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome *</label>
                  <input type="text" className="form-control" value={requerenteForm.nome} onChange={e => setRequerenteForm({...requerenteForm, nome: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Tipo de Pessoa</label>
                  <select className="form-control" value={requerenteForm.tipoPessoa} onChange={e => setRequerenteForm({...requerenteForm, tipoPessoa: e.target.value})}>
                    <option value="fisica">Fisica</option>
                    <option value="juridica">Juridica</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>CPF/CNPJ</label>
                  <input type="text" className="form-control" value={requerenteForm.cpfCnpj} onChange={e => setRequerenteForm({...requerenteForm, cpfCnpj: formatarCpfCnpj(e.target.value)})} placeholder="000.000.000-00 ou 00.000.000/0000-00" />
                </div>
                <div className="form-group">
                  <label>Telefone</label>
                  <input type="text" className="form-control" value={requerenteForm.telefone} onChange={e => setRequerenteForm({...requerenteForm, telefone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-control" value={requerenteForm.email} onChange={e => setRequerenteForm({...requerenteForm, email: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Endereco</label>
                  <input type="text" className="form-control" value={requerenteForm.endereco} onChange={e => setRequerenteForm({...requerenteForm, endereco: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Numero</label>
                  <input type="text" className="form-control" value={requerenteForm.numero} onChange={e => setRequerenteForm({...requerenteForm, numero: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Complemento</label>
                  <input type="text" className="form-control" value={requerenteForm.complemento} onChange={e => setRequerenteForm({...requerenteForm, complemento: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Bairro</label>
                  <input type="text" className="form-control" value={requerenteForm.bairro} onChange={e => setRequerenteForm({...requerenteForm, bairro: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Cidade</label>
                  <input type="text" className="form-control" value={requerenteForm.cidade} onChange={e => setRequerenteForm({...requerenteForm, cidade: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select className="form-control" value={requerenteForm.estado} onChange={e => setRequerenteForm({...requerenteForm, estado: e.target.value})}>
                    <option value="">Selecione</option>
                    {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>CEP</label>
                  <input type="text" className="form-control" value={requerenteForm.cep} onChange={e => setRequerenteForm({...requerenteForm, cep: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary">{requerenteEditando ? 'Atualizar' : 'Salvar'}</button>
                {requerenteEditando && <button type="button" className="btn btn-secondary" onClick={() => { setRequerenteEditando(false); setRequerenteForm({ id: null, nome: '', cpfCnpj: '', tipoPessoa: 'fisica', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '', telefone: '', email: '' }); }}>Cancelar</button>}
              </div>
            </form>
          </div>
          <div className="card">
            <div className="search-box" style={{ marginBottom: 16 }}>
              <input type="text" className="form-control" placeholder="Buscar por nome ou CPF/CNPJ..." value={buscaRequerente} onChange={e => setBuscaRequerente(e.target.value)} />
              <button className="btn btn-primary" onClick={buscarRequerentes}>Buscar</button>
              <button className="btn btn-secondary" onClick={() => { setBuscaRequerente(''); api.get('/requerentes').then(r => setRequerentes(r.data)); }}>Limpar</button>
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
                          <button className="btn btn-sm btn-secondary" onClick={() => editarRequerente(c)} style={{ marginRight: 6 }}>Editar</button>
                          <button className="btn btn-sm btn-danger" onClick={() => excluirRequerente(c.id)}>Desativar</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ENTIDADES */}
      {aba === 'entidades' && (
        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>{entidadeEditando ? 'Editar Entidade' : 'Nova Entidade'}</h3>
            <form onSubmit={salvarEntidade}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome *</label>
                  <input type="text" className="form-control" value={entidadeForm.nome} onChange={e => setEntidadeForm({...entidadeForm, nome: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Slug *</label>
                  <input type="text" className="form-control" value={entidadeForm.slug} onChange={e => setEntidadeForm({...entidadeForm, slug: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Database</label>
                  <input type="text" className="form-control" value={entidadeForm.database_name} onChange={e => setEntidadeForm({...entidadeForm, database_name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" className="form-control" value={entidadeForm.username} onChange={e => setEntidadeForm({...entidadeForm, username: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Host</label>
                  <input type="text" className="form-control" value={entidadeForm.host} onChange={e => setEntidadeForm({...entidadeForm, host: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Port</label>
                  <input type="text" className="form-control" value={entidadeForm.port} onChange={e => setEntidadeForm({...entidadeForm, port: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary">{entidadeEditando ? 'Atualizar' : 'Salvar'}</button>
                {entidadeEditando && <button type="button" className="btn btn-secondary" onClick={() => { setEntidadeEditando(false); setEntidadeForm({ id: null, nome: '', slug: '', database_name: '', username: '', host: '', port: '' }); }}>Cancelar</button>}
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
                          <button className="btn btn-sm btn-secondary" onClick={() => editarEntidade(s)} style={{ marginRight: 6 }}>Editar</button>
                          <button className="btn btn-sm btn-danger" onClick={() => excluirEntidade(s.id)}>Desativar</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cadastros;

