import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import { useModalConfirm } from './ModalConfirmProvider';


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

      const top =
        spaceBelow >= menuHeight || spaceBelow >= spaceAbove
          ? rect.bottom + 6
          : rect.top - menuHeight - 6;

      setMenuStyle({
        position: 'fixed',
        top,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
        minWidth: 190,
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                {a.icon && <span className="actions-dropdown-item-icon" aria-hidden="true">{a.icon}</span>}
                <span>{a.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

function AcoesDropdownLinha({ u, abrirModalEditar, resetarSenha, alterarAtivo }) {
  const btnRef = useRef(null);

  const acaoAtivo = u.ativo ?
    {
      label: 'Inativar',
      variant: 'danger',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18" />
          <path d="M7 7l10 10" />
          <path d="M17 7L7 17" />
        </svg>
      ),
      onClick: () => alterarAtivo(u, 0),
    } :
    {
      label: 'Reativar',
      variant: 'secondary',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-9-9" />
          <path d="M21 3v6h-6" />
        </svg>
      ),
      onClick: () => alterarAtivo(u, 1),
    };

  return (
    <AcoesDropdown
      btnRef={btnRef}
      actions={[
        {
          label: 'Editar',
          variant: 'secondary',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          ),
          onClick: () => abrirModalEditar(u),
        },
        {
          label: 'Resetar senha',
          variant: 'danger',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 3v6h-6" />
            </svg>
          ),
          onClick: () => resetarSenha(u.id),
        },
        acaoAtivo,
      ]}
    />
  );
}

function CadastroUsuarios() {
  const modalConfirm = useModalConfirm();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [setores, setSetores] = useState([]);
  const [niveisAcesso, setNiveisAcesso] = useState([]);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [somenteLeitura, setSomenteLeitura] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    id: null,
    nome: '',
    email: '',
    cargo: '',
    setor: '',
    nivelAcesso: 'operador',
    ativo: 1,
  });

  useEffect(() => {
    (async function init() {
      try {
        const [resUsuarios, resSetores, resNiveis] = await Promise.all([
          api.get('/auth/usuarios'),
          api.get('/setores'),
          api.get('/niveis-acesso'),
        ]);

        setUsuarios(resUsuarios.data || []);
        setSetores(resSetores.data || []);
        setNiveisAcesso((resNiveis.data || []).filter((n) => n.ativo));
      } catch (e) {
        setErro('Erro ao carregar usuários.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const response = await api.get('/auth/usuarios');
      setUsuarios(response.data || []);
    } catch {
      setErro('Erro ao carregar usuários');
    }
  };

  const abrirModalNovo = () => {
    setErro('');
    setMensagem('');
    setEditando(false);
    setSomenteLeitura(false);
    setForm({ id: null, nome: '', email: '', cargo: '', setor: '', nivelAcesso: 'operador', ativo: 1 });
    setMostrarModal(true);
  };

  const abrirModalEditar = (u) => {
    setErro('');
    setMensagem('');
    setEditando(true);
    setSomenteLeitura(false);
    setForm({
      id: u.id,
      nome: u.nome || '',
      email: u.email || '',
      cargo: u.cargo || '',
      setor: u.setor || '',
      nivelAcesso: u.nivelAcesso || 'operador',
      ativo: u.ativo ? 1 : 0,
    });
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setSalvando(false);
    setErro('');
    setMensagem('');
    setSomenteLeitura(false);
  };

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');

    if (!form.nome.trim()) {
      setErro('Nome é obrigatório.');
      return;
    }
    if (!form.email.trim()) {
      setErro('Email é obrigatório.');
      return;
    }
    if (!form.cargo.trim()) {
      setErro('Cargo é obrigatório.');
      return;
    }
    if (!form.setor.trim()) {
      setErro('Setor é obrigatório.');
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        nome: form.nome,
        email: form.email,
        cargo: form.cargo,
        setor: form.setor,
        nivelAcesso: form.nivelAcesso,
        ativo: editando ? form.ativo : 1,
      };

      if (editando) {
        await api.put(`/auth/usuarios/${form.id}`, payload);
        setMensagem('Usuário atualizado!');
      } else {
        const response = await api.post('/auth/registrar', payload);
        setMensagem(`Usuário cadastrado! Senha temporária: ${response.data?.senhaTemporaria || ''}`);
        setForm({ id: null, nome: '', email: '', cargo: '', setor: '', nivelAcesso: 'operador', ativo: 1 });
      }

      fecharModal();
      carregarUsuarios();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar usuário');
    } finally {
      setSalvando(false);
    }
  };

  const resetarSenha = async (id) => {
    const novaSenha = await modalConfirm.prompt({
      title: 'Resetar senha',
      message: 'Informe a nova senha (mínimo 6 caracteres).',
      inputLabel: 'Nova senha',
      inputPlaceholder: 'Digite a nova senha',
      inputType: 'password',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      validate: (value) => {
        if (!value || String(value).length < 6) return false;
        return true;
      },
    });

    if (!novaSenha) return;

    try {
      await api.post(`/auth/usuarios/${id}/resetar-senha`, { novaSenha });
      await modalConfirm.alert({
        title: 'Senha resetada',
        message: 'Senha resetada com sucesso.',
      });
    } catch {
      await modalConfirm.alert({
        title: 'Erro',
        message: 'Erro ao resetar senha.',
      });
    }
  };


  const alterarAtivo = async (u, novoAtivo) => {
    setErro('');
    setMensagem('');

    const ok = await modalConfirm.confirm({
      title: 'Confirmar ação',
      message: novoAtivo === 1 ? 'Deseja reativar este usuário?' : 'Deseja inativar este usuário?',
      variant: 'danger',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
    });
    if (!ok) return;

    try {
      // enviar campos obrigatórios para evitar dependência do backend em validações
      await api.put(`/auth/usuarios/${u.id}`, {
        nome: u.nome || '',
        email: u.email || '',
        cargo: u.cargo || '',
        setor: u.setor || '',
        nivelAcesso: u.nivelAcesso || 'operador',
        ativo: novoAtivo,
      });

      setMensagem(novoAtivo === 1 ? 'Usuário reativado!' : 'Usuário inativado!');
      carregarUsuarios();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao alterar status do usuário');
    }
  };


  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;

  return (
    <div className="page-content">
      <div className="form-hero">
        <div className="form-hero-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
            <path d="M4 4h16v16H4z" opacity="0.25" />
            <path d="M9 9h6M9 13h6M7 4v16" />
          </svg>
        </div>
        <div className="form-hero-content">
          <h1>Cadastro de Usuários</h1>
          <p>Gerencie os usuários do sistema (criação, edição e reset de senha).</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="button" className="btn btn-primary" onClick={abrirModalNovo}>
            Novo Usuário
          </button>
        </div>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}
      {mensagem && <div className="alert alert-success">{mensagem}</div>}

      <div className="card" style={{ overflow: 'visible' }}>
        <div className="card-header" style={{ marginBottom: 12 }}>
          <div className="card-title">Lista de Usuários</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 700 }}>
            {usuarios.length} {usuarios.length === 1 ? 'registro' : 'registros'}
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 280 }}>Nome</th>
                <th>Email</th>
                <th style={{ width: 160 }}>Cargo</th>
                <th style={{ width: 200 }}>Setor</th>
                <th style={{ width: 140 }}>Nível</th>
                <th style={{ width: 130 }}>Status</th>
                <th style={{ width: 170 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state small">Nenhum usuário cadastrado</td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong style={{ color: 'var(--gray-900)' }}>{u.nome}</strong>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.cargo}</td>
                    <td>{u.setor}</td>
                    <td>
                      <span className="badge" style={{ background: u.nivelAcesso === 'admin' ? '#dbeafe' : '#f3f4f6', color: u.nivelAcesso === 'admin' ? '#1e40af' : '#374151' }}>
                        {u.nivelAcesso || 'operador'}
                      </span>
                    </td>
                    <td>
                      {u.primeiroAcesso === 1 ? (
                        <span className="badge" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>Pendente</span>
                      ) : (
                        <span className={`badge badge-${u.ativo ? 'concluido' : 'arquivado'}`}>{u.ativo ? 'Ativo' : 'Inativo'}</span>
                      )}
                    </td>
                    <td>
                      <div className="actions-dropdown" style={{ position: 'relative' }}>
                        <AcoesDropdownLinha
                          u={u}
                          abrirModalEditar={abrirModalEditar}
                          resetarSenha={resetarSenha}
                          alterarAtivo={alterarAtivo}
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

      {mostrarModal && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 780 }}>
            <div className="modal-header">
              <div className="form-hero" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                <div className="form-hero-icon" style={{ width: 52, height: 52 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" opacity="0.25" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </div>
                <div className="form-hero-content" style={{ marginTop: 2 }}>
                  <h1 style={{ fontSize: 24 }}>{editando ? 'Editar Usuário' : 'Novo Usuário'}</h1>
                  <p style={{ marginTop: 2 }}>
                    {editando ? 'Atualize os dados do usuário e seu status.' : 'Cadastre um novo usuário (senha temporária será exibida ao salvar).'}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <form onSubmit={salvar}>
                <div className="form-row-modern">
                  <div className="form-group">
                    <label>Nome *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.nome}
                      onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
                      required
                      placeholder="Ex: Maria Silva"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      required
                      placeholder="exemplo@dominio.com"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group">
                    <label>Cargo *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.cargo}
                      onChange={(e) => setForm((prev) => ({ ...prev, cargo: e.target.value }))}
                      required
                      placeholder="Ex: Analista"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group">
                    <label>Setor *</label>
                    <select
                      className="form-control"
                      value={form.setor}
                      onChange={(e) => setForm((prev) => ({ ...prev, setor: e.target.value }))}
                      required
                      disabled={somenteLeitura}
                    >
                      <option value="">Selecione</option>
                      {setores.map((s) => (
                        <option key={s.id} value={s.nome}>{s.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Nível de Acesso</label>
                    <select
                      className="form-control"
                      value={form.nivelAcesso}
                      onChange={(e) => setForm((prev) => ({ ...prev, nivelAcesso: e.target.value }))}
                      disabled={somenteLeitura}
                    >
                      {niveisAcesso.length === 0 ? (
                        <option value="operador">Operador</option>
                      ) : (
                        niveisAcesso.map((n) => (
                          <option key={n.id} value={n.nome}>{n.nome}</option>
                        ))
                      )}
                    </select>
                  </div>

                  {editando && (
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        className="form-control"
                        value={form.ativo}
                        onChange={(e) => setForm((prev) => ({ ...prev, ativo: parseInt(e.target.value, 10) }))}
                        disabled={somenteLeitura}
                      >
                        <option value={1}>Ativo</option>
                        <option value={0}>Inativo</option>
                      </select>
                    </div>
                  )}
                </div>

                {erro && <div className="alert alert-danger" style={{ marginTop: 14 }}>{erro}</div>}

                <div className="modal-footer" style={{ marginTop: 14 }}>
                  <button type="button" className="btn btn-secondary" onClick={fecharModal} disabled={salvando}>
                    {editando ? 'Cancelar' : 'Cancelar'}
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={salvando}>
                    {salvando ? 'Salvando...' : editando ? 'Atualizar' : 'Salvar'}
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

export default CadastroUsuarios;


