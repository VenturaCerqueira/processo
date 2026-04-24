import React, { useState, useEffect } from 'react';
import api from '../api';

function CadastroUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [setores, setSetores] = useState([]);

  const [form, setForm] = useState({ nome: '', email: '', senha: '', cargo: '', setor: '', nivelAcesso: 'operador' });
  const [niveisAcesso, setNiveisAcesso] = useState([]);

  useEffect(() => {
    carregarUsuarios();
    async function carregarSetores() {
      try {
        const res = await api.get('/setores');
        setSetores(res.data);
      } catch (error) { console.error('Erro ao carregar setores:', error); }
    }
    async function carregarNiveis() {
      try {
        const res = await api.get('/niveis-acesso');
        setNiveisAcesso(res.data.filter(n => n.ativo));
      } catch (error) { console.error('Erro ao carregar niveis de acesso:', error); }
    }
    carregarSetores();
    carregarNiveis();
  }, []);

  const carregarUsuarios = async () => {
    try { const response = await api.get('/auth/usuarios'); setUsuarios(response.data); }
    catch { setErro('Erro ao carregar usuários'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setErro(''); setMensagem('');
    try { await api.post('/auth/registrar', form); setMensagem('Usuário cadastrado!'); setForm({ nome: '', email: '', senha: '', cargo: '', setor: '', nivelAcesso: 'operador' }); setMostrarForm(false); carregarUsuarios(); }
    catch (error) { setErro(error.response?.data?.message || 'Erro ao cadastrar'); }
  };

  const handleEditar = async (e) => {
    e.preventDefault(); setErro(''); setMensagem('');
    try { await api.put(`/auth/usuarios/${usuarioEditando.id}`, usuarioEditando); setMensagem('Usuário atualizado!'); setMostrarEditar(false); setUsuarioEditando(null); carregarUsuarios(); }
    catch (error) { setErro(error.response?.data?.message || 'Erro ao atualizar'); }
  };

  const handleResetarSenha = async (id) => {
    const novaSenha = prompt('Nova senha (mín. 6 caracteres):');
    if (!novaSenha || novaSenha.length < 6) { alert('Senha inválida'); return; }
    try { await api.post(`/auth/usuarios/${id}/resetar-senha`, { novaSenha }); alert('Senha resetada!'); }
    catch { alert('Erro ao resetar senha'); }
  };

  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;

  return (
    <div className="page-content">
      <div className="top-bar">
        <h2>Cadastro de Usuários</h2>
        <button className="btn btn-primary" onClick={() => setMostrarForm(true)}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Novo Usuário
        </button>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}
      {mensagem && <div className="alert alert-success">{mensagem}</div>}

      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Nome</th><th>Email</th><th>Cargo</th><th>Setor</th><th>Nível</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.nome}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.cargo}</td>
                  <td>{u.setor}</td>
                  <td><span className="badge" style={{ background: u.nivelAcesso === 'admin' ? '#dbeafe' : '#f3f4f6', color: u.nivelAcesso === 'admin' ? '#1e40af' : '#374151' }}>{u.nivelAcesso}</span></td>
                  <td><span className={`badge badge-${u.ativo ? 'concluido' : 'arquivado'}`}>{u.ativo ? 'Ativo' : 'Inativo'}</span></td>
                  <td>
                    <button className="btn btn-warning btn-sm" style={{ marginRight: 6 }} onClick={() => { setUsuarioEditando(u); setMostrarEditar(true); }}>Editar</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleResetarSenha(u.id)}>Resetar Senha</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarForm && (
        <div className="modal-overlay" onClick={() => setMostrarForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Cadastrar Novo Usuário</h3></div>
            <div className="modal-body">
              <form id="form-usuario" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group"><label>Nome *</label><input type="text" className="form-control" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required /></div>
                  <div className="form-group"><label>Email *</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Senha *</label><input type="password" className="form-control" value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} required placeholder="Mínimo 6 caracteres" autoComplete="new-password" /></div>
                  <div className="form-group"><label>Cargo *</label><input type="text" className="form-control" value={form.cargo} onChange={e => setForm({...form, cargo: e.target.value})} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Setor *</label>
                    <select className="form-control" value={form.setor} onChange={e => setForm({...form, setor: e.target.value})} required>
                      <option value="">Selecione</option>
                      {setores.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nível de Acesso</label>
                    <select className="form-control" value={form.nivelAcesso} onChange={e => setForm({...form, nivelAcesso: e.target.value})}>
                      {niveisAcesso.length === 0 && <option value="operador">Operador</option>}
                      {niveisAcesso.map(n => <option key={n.id} value={n.nome}>{n.nome}</option>)}
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMostrarForm(false)}>Cancelar</button>
              <button className="btn btn-primary" form="form-usuario">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {mostrarEditar && usuarioEditando && (
        <div className="modal-overlay" onClick={() => setMostrarEditar(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Editar Usuário</h3></div>
            <div className="modal-body">
              <form id="form-editar" onSubmit={handleEditar}>
                <div className="form-row">
                  <div className="form-group"><label>Nome *</label><input type="text" className="form-control" value={usuarioEditando.nome} onChange={e => setUsuarioEditando({...usuarioEditando, nome: e.target.value})} required /></div>
                  <div className="form-group"><label>Email *</label><input type="email" className="form-control" value={usuarioEditando.email} onChange={e => setUsuarioEditando({...usuarioEditando, email: e.target.value})} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Cargo *</label><input type="text" className="form-control" value={usuarioEditando.cargo} onChange={e => setUsuarioEditando({...usuarioEditando, cargo: e.target.value})} required /></div>
                  <div className="form-group">
                    <label>Setor *</label>
                    <select className="form-control" value={usuarioEditando.setor} onChange={e => setUsuarioEditando({...usuarioEditando, setor: e.target.value})} required>
                      {setores.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nível de Acesso</label>
                    <select className="form-control" value={usuarioEditando.nivelAcesso} onChange={e => setUsuarioEditando({...usuarioEditando, nivelAcesso: e.target.value})}>
                      {niveisAcesso.length === 0 && <option value={usuarioEditando.nivelAcesso}>{usuarioEditando.nivelAcesso}</option>}
                      {niveisAcesso.map(n => <option key={n.id} value={n.nome}>{n.nome}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" value={usuarioEditando.ativo} onChange={e => setUsuarioEditando({...usuarioEditando, ativo: parseInt(e.target.value)})}>
                      <option value={1}>Ativo</option>
                      <option value={0}>Inativo</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMostrarEditar(false)}>Cancelar</button>
              <button className="btn btn-primary" form="form-editar">Atualizar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CadastroUsuarios;

