import React, { useState, useEffect } from 'react';
import api from '../api';

const PERMISSOES_PADRAO = {
  dashboard: false,
  processos_ver: false,
  processos_criar: false,
  processos_editar: false,
  processos_excluir: false,
  relatorios_ver: false,
  relatorios_gerar: false,
  cadastros_ver: false,
  cadastros_editar: false,
  usuarios_ver: false,
  usuarios_editar: false,
  configuracoes_ver: false
};

const GRUPOS_PERMISSOES = [
  {
    titulo: 'Dashboard',
    permissoes: [{ key: 'dashboard', label: 'Acessar Dashboard' }]
  },
  {
    titulo: 'Processos',
    permissoes: [
      { key: 'processos_ver', label: 'Visualizar' },
      { key: 'processos_criar', label: 'Criar' },
      { key: 'processos_editar', label: 'Editar' },
      { key: 'processos_excluir', label: 'Excluir' }
    ]
  },
  {
    titulo: 'Relatórios',
    permissoes: [
      { key: 'relatorios_ver', label: 'Visualizar' },
      { key: 'relatorios_gerar', label: 'Gerar' }
    ]
  },
  {
    titulo: 'Cadastros',
    permissoes: [
      { key: 'cadastros_ver', label: 'Visualizar' },
      { key: 'cadastros_editar', label: 'Editar' }
    ]
  },
  {
    titulo: 'Usuários',
    permissoes: [
      { key: 'usuarios_ver', label: 'Visualizar' },
      { key: 'usuarios_editar', label: 'Editar' }
    ]
  },
  {
    titulo: 'Configurações',
    permissoes: [{ key: 'configuracoes_ver', label: 'Visualizar' }]
  }
];

function CadastroNiveisAcesso() {
  const [niveis, setNiveis] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [nivelEditando, setNivelEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [form, setForm] = useState({ nome: '', descricao: '', permissoes: { ...PERMISSOES_PADRAO } });

  useEffect(() => {
    carregarNiveis();
  }, []);

  const carregarNiveis = async () => {
    try {
      const response = await api.get('/niveis-acesso');
      setNiveis(response.data);
    } catch {
      setErro('Erro ao carregar niveis de acesso');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
    try {
      await api.post('/niveis-acesso', form);
      setMensagem('Nivel de acesso cadastrado!');
      setForm({ nome: '', descricao: '', permissoes: { ...PERMISSOES_PADRAO } });
      setMostrarForm(false);
      carregarNiveis();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao cadastrar');
    }
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
    try {
      await api.put(`/niveis-acesso/${nivelEditando.id}`, nivelEditando);
      setMensagem('Nivel de acesso atualizado!');
      setMostrarEditar(false);
      setNivelEditando(null);
      carregarNiveis();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao atualizar');
    }
  };

  const handleExcluir = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este nivel de acesso?')) return;
    try {
      await api.delete(`/niveis-acesso/${id}`);
      setMensagem('Nivel de acesso excluido!');
      carregarNiveis();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao excluir');
    }
  };

  const togglePermissao = (target, key) => {
    const next = { ...target.permissoes, [key]: !target.permissoes[key] };
    if (target.id) {
      setNivelEditando({ ...target, permissoes: next });
    } else {
      setForm({ ...target, permissoes: next });
    }
  };

  const renderPermissoesEditor = (target, onChangeTarget) => (
    <div className="permissoes-editor">
      {GRUPOS_PERMISSOES.map(grupo => (
        <div key={grupo.titulo} className="permissao-grupo">
          <h4>{grupo.titulo}</h4>
          <div className="permissao-itens">
            {grupo.permissoes.map(p => (
              <label key={p.key} className="permissao-item">
                <input
                  type="checkbox"
                  checked={!!target.permissoes[p.key]}
                  onChange={() => togglePermissao(target, p.key)}
                />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;

  return (
    <div className="page-content">
      <div className="top-bar">
        <h2>Niveis de Acesso e Permissoes</h2>
        <button className="btn btn-primary" onClick={() => setMostrarForm(true)}>
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Novo Nivel
        </button>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}
      {mensagem && <div className="alert alert-success">{mensagem}</div>}

      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Nome</th><th>Descricao</th><th>Permissoes Ativas</th><th>Status</th><th>Acoes</th></tr></thead>
            <tbody>
              {niveis.map(n => (
                <tr key={n.id}>
                  <td><strong>{n.nome}</strong></td>
                  <td>{n.descricao}</td>
                  <td>{Object.entries(n.permissoes || {}).filter(([,v]) => v).length} permissoes</td>
                  <td><span className={`badge badge-${n.ativo ? 'concluido' : 'arquivado'}`}>{n.ativo ? 'Ativo' : 'Inativo'}</span></td>
                  <td>
                    <button className="btn btn-warning btn-sm" style={{ marginRight: 6 }} onClick={() => { setNivelEditando(n); setMostrarEditar(true); }}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleExcluir(n.id)}>Excluir</button>
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
            <div className="modal-header"><h3>Cadastrar Novo Nivel de Acesso</h3></div>
            <div className="modal-body">
              <form id="form-nivel" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group"><label>Nome *</label><input type="text" className="form-control" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required /></div>
                  <div className="form-group"><label>Descricao</label><input type="text" className="form-control" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} /></div>
                </div>
                <div className="form-group"><label>Permissoes</label></div>
                {renderPermissoesEditor(form, setForm)}
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMostrarForm(false)}>Cancelar</button>
              <button className="btn btn-primary" form="form-nivel">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {mostrarEditar && nivelEditando && (
        <div className="modal-overlay" onClick={() => setMostrarEditar(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Editar Nivel de Acesso</h3></div>
            <div className="modal-body">
              <form id="form-editar" onSubmit={handleEditar}>
                <div className="form-row">
                  <div className="form-group"><label>Nome *</label><input type="text" className="form-control" value={nivelEditando.nome} onChange={e => setNivelEditando({...nivelEditando, nome: e.target.value})} required /></div>
                  <div className="form-group"><label>Descricao</label><input type="text" className="form-control" value={nivelEditando.descricao || ''} onChange={e => setNivelEditando({...nivelEditando, descricao: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" value={nivelEditando.ativo} onChange={e => setNivelEditando({...nivelEditando, ativo: parseInt(e.target.value)})}>
                      <option value={1}>Ativo</option>
                      <option value={0}>Inativo</option>
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Permissoes</label></div>
                {renderPermissoesEditor(nivelEditando, setNivelEditando)}
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

export default CadastroNiveisAcesso;

