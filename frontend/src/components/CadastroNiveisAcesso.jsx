import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../api';
import { createPortal } from 'react-dom';

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
  configuracoes_ver: false,
};

const GRUPOS_PERMISSOES = [
  {
    titulo: 'Dashboard',
    permissoes: [{ key: 'dashboard', label: 'Acessar Dashboard' }],
  },
  {
    titulo: 'Processos',
    permissoes: [
      { key: 'processos_ver', label: 'Visualizar' },
      { key: 'processos_criar', label: 'Criar' },
      { key: 'processos_editar', label: 'Editar' },
      { key: 'processos_excluir', label: 'Excluir' },
    ],
  },
  {
    titulo: 'Relatórios',
    permissoes: [
      { key: 'relatorios_ver', label: 'Visualizar' },
      { key: 'relatorios_gerar', label: 'Gerar' },
    ],
  },
  {
    titulo: 'Cadastros',
    permissoes: [
      { key: 'cadastros_ver', label: 'Visualizar' },
      { key: 'cadastros_editar', label: 'Editar' },
    ],
  },
  {
    titulo: 'Usuários',
    permissoes: [
      { key: 'usuarios_ver', label: 'Visualizar' },
      { key: 'usuarios_editar', label: 'Editar' },
    ],
  },
  {
    titulo: 'Configurações',
    permissoes: [{ key: 'configuracoes_ver', label: 'Visualizar' }],
  },
];

function AcoesDropdown({ btnRef, actions }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && btnRef?.current) {
      const btn = btnRef.current;
      const rect = btn.getBoundingClientRect();
      const menuHeight = Math.min(actions.length * 38 + 8, 320);
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      const top = spaceBelow >= menuHeight || spaceBelow >= spaceAbove ? rect.bottom + 6 : rect.top - menuHeight - 6;

      setMenuStyle({
        position: 'fixed',
        top,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
        minWidth: 180,
        zIndex: 99999,
      });
    }
  }, [open, actions.length, btnRef]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (btnRef?.current && !btnRef.current.contains(e.target)) {
        const menu = document.querySelector('.actions-dropdown-fixed-menu');
        if (menu && menu.contains(e.target)) return;
        setOpen(false);
      }
    }
    if (!open) return;
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, btnRef]);

  if (!actions || actions.length === 0) return null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="actions-dropdown-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        style={{ position: 'relative', zIndex: open ? 99998 : undefined }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5h.01" />
            <path d="M12 12h.01" />
            <path d="M12 19h.01" />
          </svg>
          Ações
        </span>
      </button>

      {open &&
        createPortal(
          <div className="actions-dropdown-fixed-menu" style={menuStyle}>
            {actions.map((a, i) => (
              <button
                key={i}
                type="button"
                className={`actions-dropdown-item ${a.variant ? `item-${a.variant}` : ''}`}
                onClick={() => {
                  setOpen(false);
                  a.onClick();
                }}
              >
                {a.icon && (
                  <span className="actions-dropdown-item-icon" aria-hidden="true">
                    {a.icon}
                  </span>
                )}
                <span>{a.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

function AcoesDropdownLinha({ abrirModalEditar, excluir }) {
  const btnRef = useRef(null);

  return (
    <AcoesDropdown
      btnRef={btnRef}
      actions={[
        {
          label: 'Editar',
          variant: 'secondary',
          icon: (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          ),
          onClick: () => abrirModalEditar(),
        },
        {
          label: 'Excluir',
          variant: 'danger',
          icon: (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              <path d="M8 12h8" />
            </svg>
          ),
          onClick: () => excluir(),
        },
      ]}
    />
  );
}

function CadastroNiveisAcesso() {
  const [niveis, setNiveis] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [nivelEditando, setNivelEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [form, setForm] = useState({ nome: '', descricao: '', permissoes: { ...PERMISSOES_PADRAO } });
  const [salvando, setSalvando] = useState(false);

  const carregarNiveis = async () => {
    setErro('');
    setLoading(true);
    try {
      const response = await api.get('/niveis-acesso');
      setNiveis(response.data);
    } catch {
      setErro('Erro ao carregar niveis de acesso');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarNiveis();
  }, []);

  const contadorLabel = useMemo(() => {
    const n = niveis.length;
    return `${n} ${n === 1 ? 'registro' : 'registros'}`;
  }, [niveis.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
    setSalvando(true);
    try {
      await api.post('/niveis-acesso', form);
      setMensagem('Nivel de acesso cadastrado!');
      setForm({ nome: '', descricao: '', permissoes: { ...PERMISSOES_PADRAO } });
      setMostrarForm(false);
      await carregarNiveis();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao cadastrar');
    } finally {
      setSalvando(false);
    }
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
    setSalvando(true);
    try {
      await api.put(`/niveis-acesso/${nivelEditando.id}`, nivelEditando);
      setMensagem('Nivel de acesso atualizado!');
      setMostrarEditar(false);
      setNivelEditando(null);
      await carregarNiveis();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao atualizar');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este nivel de acesso?')) return;
    setErro('');
    setMensagem('');
    setSalvando(true);
    try {
      await api.delete(`/niveis-acesso/${id}`);
      setMensagem('Nivel de acesso excluido!');
      await carregarNiveis();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao excluir');
    } finally {
      setSalvando(false);
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

  const renderPermissoesEditor = (target) => (
    <div className="permissoes-editor">
      {GRUPOS_PERMISSOES.map((grupo) => (
        <div key={grupo.titulo} className="permissao-grupo">
          <h4>{grupo.titulo}</h4>
          <div className="permissao-itens">
            {grupo.permissoes.map((p) => (
              <label key={p.key} className="permissao-item">
                <input type="checkbox" checked={!!target.permissoes[p.key]} onChange={() => togglePermissao(target, p.key)} />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const abrirModalNovo = () => {
    setErro('');
    setMensagem('');
    setNivelEditando(null);
    setMostrarEditar(false);
    setForm({ nome: '', descricao: '', permissoes: { ...PERMISSOES_PADRAO } });
    setMostrarForm(true);
  };

  const abrirModalEditar = (n) => {
    setErro('');
    setMensagem('');
    setNivelEditando({ ...n, permissoes: n.permissoes || {} });
    setMostrarForm(false);
    setMostrarEditar(true);
  };

  const fecharModal = () => {
    setMostrarForm(false);
    setMostrarEditar(false);
    setSalvando(false);
    setErro('');
  };

  if (loading) {
    return <div className="loading"><span className="spinner" />Carregando...</div>;
  }

  return (
    <div className="page-content">
      <div className="form-hero">
        <div className="form-hero-icon">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'white' }}
          >
            <path d="M4 4h16v16H4z" opacity="0.25" />
            <path d="M9 9h6M9 13h6" />
            <path d="M7 4v16" />
          </svg>
        </div>

        <div className="form-hero-content">
          <h1>Níveis de Acesso e Permissões</h1>
          <p>Defina quais ações cada nível pode executar.</p>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="button" className="btn btn-primary" onClick={abrirModalNovo}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              Novo Nível
            </span>
          </button>
        </div>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}
      {mensagem && <div className="alert alert-success">{mensagem}</div>}

      <div className="card" style={{ overflow: 'visible' }}>
        <div className="card-header" style={{ marginBottom: 12 }}>
          <div className="card-title">Lista de Níveis</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 700 }}>{contadorLabel}</div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 320 }}>Nome</th>
                <th>Descricao</th>
                <th style={{ width: 190 }}>Permissões Ativas</th>
                <th style={{ width: 160 }}>Status</th>
                <th style={{ width: 160 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {niveis.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state small">
                    Nenhum nível cadastrado
                  </td>
                </tr>
              ) : (
                niveis.map((n) => (
                  <tr key={n.id}>
                    <td>
                      <strong>{n.nome}</strong>
                    </td>
                    <td>{n.descricao}</td>
                    <td>{Object.entries(n.permissoes || {}).filter(([, v]) => v).length} permissões</td>
                    <td>
                      <span className={`badge badge-${n.ativo ? 'concluido' : 'arquivado'}`}>{n.ativo ? 'Ativo' : 'Inativo'}</span>
                    </td>
                    <td>
                      <div className="actions-dropdown" style={{ position: 'relative' }}>
                        <AcoesDropdownLinha
                          abrirModalEditar={() => abrirModalEditar(n)}
                          excluir={() => handleExcluir(n.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarForm && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 900 }}>
            <div className="modal-header">
              <div className="form-hero" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                <div className="form-hero-icon" style={{ width: 52, height: 52 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" opacity="0.25" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </div>
                <div className="form-hero-content" style={{ marginTop: 2 }}>
                  <h1 style={{ fontSize: 24 }}>Cadastrar Novo Nível de Acesso</h1>
                  <p style={{ marginTop: 2 }}>Preencha os dados e selecione as permissões.</p>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <form id="form-nivel" onSubmit={handleSubmit}>
                <div className="form-row-modern">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Nome *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      required
                      placeholder="Ex: Admin" 
                      disabled={salvando}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Descrição</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.descricao}
                      onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                      placeholder="Breve descrição do nível"
                      disabled={salvando}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Permissões</label>
                    {renderPermissoesEditor(form)}
                  </div>
                </div>

                {erro && <div className="alert alert-danger" style={{ marginTop: 14 }}>{erro}</div>}

                <div className="modal-footer" style={{ marginTop: 14 }}>
                  <button type="button" className="btn btn-secondary" onClick={fecharModal} disabled={salvando}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={salvando} form="form-nivel">
                    {salvando ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {mostrarEditar && nivelEditando && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 900 }}>
            <div className="modal-header">
              <div className="form-hero" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                <div className="form-hero-icon" style={{ width: 52, height: 52 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" opacity="0.25" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </div>
                <div className="form-hero-content" style={{ marginTop: 2 }}>
                  <h1 style={{ fontSize: 24 }}>Editar Nível de Acesso</h1>
                  <p style={{ marginTop: 2 }}>Atualize informações e permissões.</p>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <form id="form-editar" onSubmit={handleEditar}>
                <div className="form-row-modern">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Nome *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nivelEditando.nome}
                      onChange={(e) => setNivelEditando({ ...nivelEditando, nome: e.target.value })}
                      required
                      disabled={salvando}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Descrição</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nivelEditando.descricao || ''}
                      onChange={(e) => setNivelEditando({ ...nivelEditando, descricao: e.target.value })}
                      disabled={salvando}
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="form-control"
                      value={nivelEditando.ativo}
                      onChange={(e) => setNivelEditando({ ...nivelEditando, ativo: parseInt(e.target.value, 10) })}
                      disabled={salvando}
                    >
                      <option value={1}>Ativo</option>
                      <option value={0}>Inativo</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Permissões</label>
                    {renderPermissoesEditor(nivelEditando)}
                  </div>
                </div>

                {erro && <div className="alert alert-danger" style={{ marginTop: 14 }}>{erro}</div>}

                <div className="modal-footer" style={{ marginTop: 14 }}>
                  <button type="button" className="btn btn-secondary" onClick={fecharModal} disabled={salvando}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={salvando} form="form-editar">
                    {salvando ? 'Salvando...' : 'Atualizar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CadastroNiveisAcesso;


