import React, { useEffect, useState } from 'react';
import api from '../api';

function CadastroRequerenteUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [busca, setBusca] = useState('');

  const [dropdownId, setDropdownId] = useState(null);

  const carregarUsuarios = async () => {
    try {
      const response = await api.get('/requerentes');
      // manter compatível com tabela atual: filtra apenas ativos
      setUsuarios((response.data || []).filter((u) => u.ativo === 1));
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao carregar requerentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!e.target?.closest?.('[data-dropdown]')) {
        setDropdownId(null);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const filtered = busca
    ? usuarios.filter((u) => {
        const s = busca.toLowerCase();
        return (
          (u.nome || '').toLowerCase().includes(s) ||
          (u.email || '').toLowerCase().includes(s) ||
          String(u.cpfCnpj || '').includes(s)
        );
      })
    : usuarios;

  const toggleDropdown = (id) => {
    setDropdownId((prev) => (prev === id ? null : id));
  };

  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;

  return (
    <div className="page-content">
      <div className="top-bar">
        <h2>Requerentes</h2>
        <div className="top-bar-actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            className="form-control"
            style={{ width: 320 }}
            placeholder="Buscar por nome, email ou CPF/CNPJ"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}
      {mensagem && <div className="alert alert-success">{mensagem}</div>}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>CPF/CNPJ</th>
                <th>Nível</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.nome}</strong></td>
                  <td>{u.email || '-'}</td>
                  <td>{u.cpfCnpj || '-'}</td>
                  <td>
                    <span className="badge" style={{ background: '#f3f4f6', color: '#374151' }}>
                      {u.nivelAcesso || 'requerente'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${u.ativo ? 'concluido' : 'arquivado'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ position: 'relative' }} data-dropdown>
                      <button className="btn btn-secondary btn-sm" onClick={() => toggleDropdown(u.id)}>
                        Ações
                      </button>
                      {dropdownId === u.id && (
                        <div
                          className="dropdown"
                          style={{ position: 'absolute', right: 0, top: '100%', zIndex: 20, minWidth: 220 }}
                        >
                          <div className="dropdown-item" style={{ padding: '8px 12px', cursor: 'not-allowed', opacity: 0.7 }}>
                            Editar (somente leitura)
                          </div>
                          <div
                            className="dropdown-item"
                            style={{ padding: '8px 12px', cursor: 'pointer' }}
                            onClick={() => {
                              setMensagem('Ação indisponível para requerentes neste modo.');
                              setDropdownId(null);
                              setTimeout(() => setMensagem(''), 2500);
                            }}
                          >
                            Resetar senha
                          </div>
                        </div>
                      )}
                    </div>
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

export default CadastroRequerenteUsuarios;

