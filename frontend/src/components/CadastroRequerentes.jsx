import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../api';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

const estados = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
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

      const top = spaceBelow >= menuHeight || spaceBelow >= spaceAbove
        ? rect.bottom + 6
        : rect.top - menuHeight - 6;

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
        onClick={() => setOpen(v => !v)}
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

      {open && createPortal(
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
                <span className="actions-dropdown-item-icon" aria-hidden="true">{a.icon}</span>
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

function AcoesDropdownLinha({ abrirModalEditar, excluir, visualizar }) {
  const btnRef = useRef(null);

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
          onClick: () => abrirModalEditar(),
        },
        {
          label: 'Visualizar',
          variant: 'primary',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ),
          onClick: () => visualizar(),
        },
        {
          label: 'Desativar',
          variant: 'danger',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function CadastroRequerentes() {
  const navigate = useNavigate();
  const [requerentes, setRequerentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [somenteLeitura, setSomenteLeitura] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    id: null,
    nome: '',
    cpfCnpj: '',
    tipoPessoa: 'fisica',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
  });

  useEffect(() => {
    carregarRequerentes();
  }, []);

  const carregarRequerentes = async () => {
    setLoading(true);
    setErro('');
    try {
      const res = await api.get('/requerentes');
      setRequerentes(res.data);
    } catch {
      setErro('Erro ao carregar requerentes.');
    } finally {
      setLoading(false);
    }
  };

  const formatarCpfCnpj = (v) => {
    if (!v) return '';
    v = v.replace(/\D/g, '');
    if (v.length <= 11) {
      return v
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return v
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const abrirModalNovo = () => {
    setErro('');
    setEditando(false);
    setSomenteLeitura(false);
    setForm({
      id: null,
      nome: '',
      cpfCnpj: '',
      tipoPessoa: 'fisica',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      telefone: '',
      email: '',
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (c) => {
    setErro('');
    setEditando(true);
    setSomenteLeitura(false);
    setForm({
      id: c.id,
      nome: c.nome || '',
      cpfCnpj: c.cpfCnpj || '',
      tipoPessoa: c.tipoPessoa || 'fisica',
      endereco: c.endereco || '',
      numero: c.numero || '',
      complemento: c.complemento || '',
      bairro: c.bairro || '',
      cidade: c.cidade || '',
      estado: c.estado || '',
      cep: c.cep || '',
      telefone: c.telefone || '',
      email: c.email || '',
    });
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setSalvando(false);
    setErro('');
    setSomenteLeitura(false);
  };

  const salvar = async (e) => {
    e.preventDefault();
    setErro('');
    if (!form.nome.trim()) return;

    setSalvando(true);
    try {
      const payload = {
        nome: form.nome,
        cpfCnpj: form.cpfCnpj,
        tipoPessoa: form.tipoPessoa,
        endereco: form.endereco,
        numero: form.numero,
        complemento: form.complemento,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
        cep: form.cep,
        telefone: form.telefone,
        email: form.email,
      };

      if (editando) {
        await api.put(`/requerentes/${form.id}`, payload);
      } else {
        await api.post('/requerentes', payload);
      }

      fecharModal();
      carregarRequerentes();
    } catch {
      setErro('Erro ao salvar requerente.');
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id) => {
    setErro('');
    const ok = confirm('Deseja desativar este requerente?');
    if (!ok) return;

    try {
      await api.delete(`/requerentes/${id}`);
      carregarRequerentes();
    } catch {
      setErro('Erro ao desativar requerente.');
    }
  };

  const buscar = async () => {
    setErro('');
    try {
      const res = await api.get(`/requerentes?busca=${encodeURIComponent(busca)}`);
      setRequerentes(res.data);
    } catch {
      setErro('Erro ao buscar requerentes.');
    }
  };

  const filteredRequerentes = useMemo(() => {
    if (!busca.trim()) return requerentes;
    const q = busca.toLowerCase();
    return requerentes.filter(r =>
      r.nome?.toLowerCase().includes(q) ||
      r.cpfCnpj?.includes(busca)
    );
  }, [requerentes, busca]);

  if (loading) return (
    <div className="loading-modern">
      <span className="spinner"></span>
      <span>Carregando...</span>
    </div>
  );

  return (
    <div className="page-content">
      {/* Header */}
      <div className="requerente-header">
        <div className="requerente-header-content">
          <div className="requerente-icon-wrapper">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="requerente-title-area">
            <h2>Cadastro de Interessados</h2>
            <p>Gerencie interessados e mantenha os dados organizados</p>
          </div>
        </div>
        <button className="btn btn-primary btn-new-requerente" onClick={abrirModalNovo}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo Interessado
        </button>
        <div className="requerente-header-decoration"></div>
      </div>

      {/* Search and Filter */}
      <div className="requerente-controls">
        <div className="search-input-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nome ou CPF/CNPJ..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {busca && (
            <button className="search-clear" onClick={() => setBusca('')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <button className="btn btn-search" onClick={buscar}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Buscar
        </button>
      </div>

      {/* Table */}
      <div className="requerente-table-card">
        <div className="requerente-table-header">
          <div className="requerente-table-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
            </svg>
            <span>Lista de Interessados</span>
          </div>
          <div className="requerente-table-count">
            <span className="count-badge">{filteredRequerentes.length}</span>
            <span>{filteredRequerentes.length === 1 ? 'registro' : 'registros'}</span>
          </div>
        </div>

        <div className="table-container modern-table">
          <table>
            <thead>
              <tr>
                <th>Interessado</th>
                <th>CPF/CNPJ</th>
                <th>Cidade/UF</th>
                <th>Telefone</th>
                <th style={{ width: 120 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequerentes.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="table-empty-state">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <h4>Nenhum interessado encontrado</h4>
                      <p>{busca ? 'Tente ajustar sua busca' : 'Cadastre o primeiro interessado'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequerentes.map((c, index) => (
                  <tr key={c.id} className="requerente-row" style={{ animationDelay: `${index * 30}ms` }}>
                    <td>
                      <div className="requerente-cell">
                        <div className="requerente-avatar">
                          {c.nome ? c.nome.trim().slice(0, 1).toUpperCase() : '—'}
                        </div>
                        <span className="requerente-cell-name">{c.nome}</span>
                      </div>
                    </td>
                    <td>
                      <span className="cpf-cnpj-badge">{c.cpfCnpj || '—'}</span>
                    </td>
                    <td>
                      <span className="cidade-uf">{c.cidade ? `${c.cidade}/${c.estado}` : '—'}</span>
                    </td>
                    <td>
                      <span className="telefone">{c.telefone || '—'}</span>
                    </td>
                    <td>
                      <AcoesDropdownLinha
                        abrirModalEditar={() => abrirModalEditar(c)}
                        excluir={() => excluir(c.id)}
                        visualizar={() => navigate(`/cadastros/requerentes/${c.id}`)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content modal-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <div className="modal-header-icon teal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="modal-header-text">
                <h2>{editando ? 'Editar Interessado' : 'Novo Interessado'}</h2>
                <p>Preencha os dados do interessado</p>
              </div>
              <button className="modal-close" onClick={fecharModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body-modern">
              <form onSubmit={salvar}>
                <div className="form-group-modern full-width">
                  <label>Nome Completo <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control-modern"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    required
                    placeholder="Ex: João da Silva"
                    disabled={somenteLeitura}
                  />
                </div>

                <div className="form-row-grid">
                  <div className="form-group-modern">
                    <label>Tipo de Pessoa</label>
                    <select
                      className="form-control-modern"
                      value={form.tipoPessoa}
                      onChange={(e) => setForm({ ...form, tipoPessoa: e.target.value })}
                      disabled={somenteLeitura}
                    >
                      <option value="fisica">Física</option>
                      <option value="juridica">Jurídica</option>
                    </select>
                  </div>

                  <div className="form-group-modern">
                    <label>CPF/CNPJ</label>
                    <input
                      type="text"
                      className="form-control-modern"
                      value={form.cpfCnpj}
                      onChange={(e) => setForm({ ...form, cpfCnpj: formatarCpfCnpj(e.target.value) })}
                      placeholder="000.000.000-00"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>Telefone</label>
                    <input
                      type="text"
                      className="form-control-modern"
                      value={form.telefone}
                      onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>E-mail</label>
                    <input
                      type="email"
                      className="form-control-modern"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="exemplo@email.com"
                      disabled={somenteLeitura}
                    />
                  </div>
                </div>

                <div className="form-section-divider">
                  <span>Endereço</span>
                </div>

                <div className="form-group-modern full-width">
                  <label>Endereço</label>
                  <input
                    type="text"
                    className="form-control-modern"
                    value={form.endereco}
                    onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                    placeholder="Rua, Avenida..."
                    disabled={somenteLeitura}
                  />
                </div>

                <div className="form-row-grid">
                  <div className="form-group-modern">
                    <label>Número</label>
                    <input
                      type="text"
                      className="form-control-modern"
                      value={form.numero}
                      onChange={(e) => setForm({ ...form, numero: e.target.value })}
                      placeholder="123"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>Complemento</label>
                    <input
                      type="text"
                      className="form-control-modern"
                      value={form.complemento}
                      onChange={(e) => setForm({ ...form, complemento: e.target.value })}
                      placeholder="Sala, Andar..."
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>Bairro</label>
                    <input
                      type="text"
                      className="form-control-modern"
                      value={form.bairro}
                      onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                      placeholder="Bairro"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>CEP</label>
                    <input
                      type="text"
                      className="form-control-modern"
                      value={form.cep}
                      onChange={(e) => setForm({ ...form, cep: e.target.value })}
                      placeholder="00000-000"
                      disabled={somenteLeitura}
                    />
                  </div>
                </div>

                <div className="form-row-grid">
                  <div className="form-group-modern">
                    <label>Cidade</label>
                    <input
                      type="text"
                      className="form-control-modern"
                      value={form.cidade}
                      onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                      placeholder="Cidade"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group-modern">
                    <label>Estado</label>
                    <select
                      className="form-control-modern"
                      value={form.estado}
                      onChange={(e) => setForm({ ...form, estado: e.target.value })}
                      disabled={somenteLeitura}
                    >
                      <option value="">Selecione</option>
                      {estados.map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {erro && <div className="alert-modern alert-danger-modern" style={{ marginTop: 16 }}>{erro}</div>}

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary-modern" onClick={fecharModal} disabled={salvando}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    Cancelar
                  </button>

                  {!somenteLeitura && (
                    <button type="submit" className="btn btn-primary-modern teal" disabled={salvando}>
                      {salvando ? (
                        <>
                          <span className="spinner"></span>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                          </svg>
                          {editando ? 'Atualizar' : 'Salvar'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CadastroRequerentes;