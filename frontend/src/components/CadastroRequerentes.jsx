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

  useEffect(() => {
    function onDocDown(e) {
      const target = e.target;
      if (!target) return;
      if (target.closest && target.closest('.actions-dropdown')) return;
    }
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
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

  const contadorLabel = useMemo(() => {
    const n = requerentes.length;
    return `${n} ${n === 1 ? 'registro' : 'registros'}`;
  }, [requerentes.length]);

  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;

  return (
    <div className="page-content">
      <div className="form-hero">
        <div className="form-hero-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
            <path d="M4 4h16v16H4z" opacity="0.25" />
            <path d="M9 9h6M9 13h6" />
            <path d="M7 4v16" />
          </svg>
        </div>
        <div className="form-hero-content">
          <h1>Cadastro de Interessados</h1>
          <p>Gerencie interessados e mantenha os dados organizados.</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="button" className="btn btn-primary" onClick={abrirModalNovo}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              Novo Interessado
            </span>
          </button>
        </div>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="card" style={{ overflow: 'visible' }}>
        <div className="card-header" style={{ marginBottom: 12 }}>
          <div className="card-title">Lista de Interessados</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 700 }}>{contadorLabel}</div>
        </div>

        <div className="search-box" style={{ marginBottom: 16 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nome ou CPF/CNPJ..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <button className="btn btn-primary" onClick={buscar}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              Buscar
            </span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setBusca('');
              carregarRequerentes();
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 16H6L5 6" />
              </svg>
              Limpar
            </span>
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 320 }}>Nome</th>
                <th>CPF/CNPJ</th>
                <th style={{ width: 180 }}>Cidade/UF</th>
                <th style={{ width: 180 }}>Telefone</th>
                <th style={{ width: 160 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {requerentes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state small">Nenhum interessado cadastrado</td>
                </tr>
              ) : (
                requerentes.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 12,
                            background: 'var(--primary)15',
                            border: '1px solid var(--primary)30',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            color: 'var(--primary)',
                            fontWeight: 900,
                          }}
                          aria-hidden="true"
                        >
                          <span style={{ fontSize: 12 }}>
                            {c.nome ? c.nome.trim().slice(0, 1).toUpperCase() : '—'}
                          </span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.nome}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{c.cpfCnpj || '—'}</td>
                    <td>{c.cidade ? `${c.cidade}/${c.estado}` : '—'}</td>
                    <td>{c.telefone || '—'}</td>
                    <td>
                      <div className="actions-dropdown" style={{ position: 'relative' }}>
                        <AcoesDropdownLinha
                          abrirModalEditar={() => abrirModalEditar(c)}
                          excluir={() => excluir(c.id)}
                          visualizar={() => navigate(`/cadastros/requerentes/${c.id}`)}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 820 }}>
            <div className="modal-header">
              <div className="form-hero" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                <div className="form-hero-icon" style={{ width: 52, height: 52 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" opacity="0.25" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </div>
                <div className="form-hero-content" style={{ marginTop: 2 }}>
                  <h1 style={{ fontSize: 24 }}>{editando ? 'Editar Interessado' : 'Novo Interessado'}</h1>
                  <p style={{ marginTop: 2 }}>Preencha os dados do interessado.</p>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <form onSubmit={salvar}>
                <div className="form-row-modern">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Nome *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      required
                      placeholder="Ex: João da Silva"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tipo de Pessoa</label>
                    <select
                      className="form-control"
                      value={form.tipoPessoa}
                      onChange={(e) => setForm({ ...form, tipoPessoa: e.target.value })}
                      disabled={somenteLeitura}
                    >
                      <option value="fisica">Física</option>
                      <option value="juridica">Jurídica</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>CPF/CNPJ</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.cpfCnpj}
                      onChange={(e) => setForm({ ...form, cpfCnpj: formatarCpfCnpj(e.target.value) })}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group">
                    <label>Telefone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.telefone}
                      onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Endereco</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.endereco}
                      onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group">
                    <label>Numero</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.numero}
                      onChange={(e) => setForm({ ...form, numero: e.target.value })}
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group">
                    <label>Complemento</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.complemento}
                      onChange={(e) => setForm({ ...form, complemento: e.target.value })}
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group">
                    <label>Bairro</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.bairro}
                      onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group">
                    <label>Cidade</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.cidade}
                      onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                      disabled={somenteLeitura}
                    />
                  </div>

                  <div className="form-group">
                    <label>Estado</label>
                    <select
                      className="form-control"
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

                  <div className="form-group">
                    <label>CEP</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.cep}
                      onChange={(e) => setForm({ ...form, cep: e.target.value })}
                      disabled={somenteLeitura}
                    />
                  </div>
                </div>

                {erro && <div className="alert alert-danger" style={{ marginTop: 14 }}>{erro}</div>}

                <div className="modal-footer" style={{ marginTop: 14 }}>
                  <button type="button" className="btn btn-secondary" onClick={fecharModal} disabled={salvando}>
                    {somenteLeitura ? 'Fechar' : 'Cancelar'}
                  </button>

                  {!somenteLeitura && (
                    <button type="submit" className="btn btn-primary" disabled={salvando}>
                      {salvando ? 'Salvando...' : (editando ? 'Atualizar' : 'Salvar')}
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

// Patch: garantir que "Visualizar" navegue usando o router, evitando redirecionamento por troca de location
// (window.location.assign pode causar refresh e perda momentânea do estado do usuário)

export default CadastroRequerentes;



