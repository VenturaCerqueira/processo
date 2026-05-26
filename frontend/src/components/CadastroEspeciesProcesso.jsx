import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';

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

      {open && createPortal(
        <div className="actions-dropdown-fixed-menu" style={menuStyle}>
          {actions.map((a, i) => (
            <button
              key={i}
              type="button"
              className={`actions-dropdown-item ${a.variant ? `item-${a.variant}` : ''}`}
              onClick={() => { setOpen(false); a.onClick(); }}
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

function AcoesDropdownLinha({ t, viewEspecie, abrirModalEditar, excluir, desativar }) {
  const btnRef = useRef(null);
  return (
    <AcoesDropdown
      btnRef={btnRef}
      actions={[
        { label: 'Visualizar', variant: 'secondary', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>, onClick: () => viewEspecie(t) },
        { label: 'Editar', variant: 'secondary', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>, onClick: () => abrirModalEditar(t) },
        { label: 'Excluir', variant: 'danger', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>, onClick: () => excluir(t.id) },
        { label: 'Desativar', variant: 'danger', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /><path d="M8 12h8" /></svg>, onClick: () => desativar(t.id) },
      ]}
    />
  );
}

function CadastroEspeciesProcesso() {
  const [especies, setEspecies] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [setores, setSetores] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [somenteLeitura, setSomenteLeitura] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ id: null, codigo: '', nome: '', tipo_processo_id: '', setor_id: '', prazo_minimo: '', prazo_maximo: '', dias_uteis: false, mensagem_customizada: '', ativo: 1 });
  const [loadingAnexosCampos, setLoadingAnexosCampos] = useState(false);
  const [anexosCampos, setAnexosCampos] = useState([]);
  const [erroAnexosCampos, setErroAnexosCampos] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    setLoading(true);
    setErro('');
    try {
      const [eRes, tRes, sRes] = await Promise.all([api.get('/especies-processo'), api.get('/tipos-processo'), api.get('/setores')]);
      setEspecies(eRes.data);
      setTipos(tRes.data);
      setSetores(sRes.data);
    } catch { setErro('Erro ao carregar dados.'); }
    finally { setLoading(false); }
  };

  const fecharModal = () => { setMostrarModal(false); setSalvando(false); setErro(''); setSomenteLeitura(false); };

  const abrirModalNovo = () => {
    setErro(''); setEditando(false); setSomenteLeitura(false); setAnexosCampos([]); setErroAnexosCampos('');
    setForm({ id: null, codigo: '', nome: '', tipo_processo_id: '', setor_id: '', prazo_minimo: '', prazo_maximo: '', dias_uteis: false, mensagem_customizada: '', ativo: 1 });
    setMostrarModal(true);
  };

  const abrirModalEditar = (item) => {
    setErro(''); setEditando(true); setSomenteLeitura(false);
    setForm({ id: item.id, codigo: item.codigo || '', nome: item.nome || '', tipo_processo_id: item.tipo_processo_id ?? '', setor_id: item.setor_id ?? '', prazo_minimo: item.prazo_minimo ?? '', prazo_maximo: item.prazo_maximo ?? '', dias_uteis: !!item.dias_uteis, mensagem_customizada: item.mensagem_customizada || '', ativo: item.ativo === 0 ? 0 : 1 });
    setMostrarModal(true);
    carregarAnexosCampos(item.id);
  };

  const viewEspecie = (item) => {
    setErro(''); setEditando(false); setSomenteLeitura(true);
    setForm({ id: item.id, codigo: item.codigo || '', nome: item.nome || '', tipo_processo_id: item.tipo_processo_id ?? '', setor_id: item.setor_id ?? '', prazo_minimo: item.prazo_minimo ?? '', prazo_maximo: item.prazo_maximo ?? '', dias_uteis: !!item.dias_uteis, mensagem_customizada: item.mensagem_customizada || '', ativo: item.ativo === 0 ? 0 : 1 });
    setMostrarModal(true);
    carregarAnexosCampos(item.id);
  };

  const carregarAnexosCampos = async (especieId) => {
    setLoadingAnexosCampos(true); setErroAnexosCampos('');
    try {
      if (!especieId) { setAnexosCampos([]); return; }
      const { data } = await api.get(`/especies-processo/${especieId}/anexos`);
      setAnexosCampos(Array.isArray(data) ? data.map((x) => ({ titulo: x.titulo ?? '', tipo: x.tipo ?? 'arquivo', obrigatorio: !!x.obrigatorio, ordem: x.ordem ?? 0, opcoes: x.opcoes ?? null })) : []);
    } catch { setErroAnexosCampos('Erro ao carregar campos.'); setAnexosCampos([]); }
    finally { setLoadingAnexosCampos(false); }
  };

  const salvar = async (e) => {
    e.preventDefault(); setErro('');
    if (!form.codigo.trim()) { setErro('Código é obrigatório.'); return; }
    if (!form.nome.trim()) { setErro('Nome é obrigatório.'); return; }
    setSalvando(true);
    try {
      const payload = { ...form, ativo: Number(form.ativo) === 1 ? 1 : 0, codigo: form.codigo.trim(), prazo_minimo: form.prazo_minimo !== '' && form.prazo_minimo !== null ? parseInt(form.prazo_minimo) : null, prazo_maximo: form.prazo_maximo !== '' && form.prazo_maximo !== null ? parseInt(form.prazo_maximo) : null };
      let especieId = form.id;
      if (editando) { await api.put(`/especies-processo/${form.id}`, payload); }
      else { const resp = await api.post('/especies-processo', payload); especieId = resp?.data?.id ?? especieId; }
      try {
        const especieIdNumero = Number(especieId);
        if (Number.isFinite(especieIdNumero) && especieIdNumero > 0) {
          await api.post(`/especies-processo/${especieIdNumero}/anexos`, { anexos: anexosCampos.map((x) => ({ titulo: x.titulo ?? '', tipo: x.tipo ?? 'arquivo', obrigatorio: !!x.obrigatorio, ordem: x.ordem ?? 0, opcoes: x.opcoes ?? null })) });
        }
      } catch { setErro('Espécie salva, mas houve erro ao salvar anexos.'); fecharModal(); carregarDados(); return; }
      fecharModal(); carregarDados();
    } catch { setErro('Erro ao salvar espécie.'); }
    finally { setSalvando(false); }
  };

  const desativar = async (id) => { setErro(''); const ok = confirm('Deseja desativar esta espécie?'); if (!ok) return; try { await api.delete(`/especies-processo/${id}`); carregarDados(); } catch { setErro('Erro ao desativar espécie.'); } };
  const excluir = async (id) => { setErro(''); const ok = confirm('Deseja excluir esta espécie definitivamente?'); if (!ok) return; try { await api.delete(`/especies-processo/${id}`); carregarDados(); } catch { setErro('Erro ao excluir espécie.'); } };

  const getTipoNome = useMemo(() => (id) => tipos.find((t) => t.id === id)?.nome || '—', [tipos]);
  const getSetorNome = useMemo(() => (id) => setores.find((s) => s.id === id)?.nome || '—', [setores]);

  if (loading) return (<div className="loading-modern"><span className="spinner"></span><span>Carregando...</span></div>);

  const modalTitle = editando ? 'Editar Espécie de Processo' : somenteLeitura ? 'Visualizar Espécie de Processo' : 'Nova Espécie de Processo';

  return (
    <div className="page-content">
      {/* Header */}
      <div className="especie-header">
        <div className="especie-header-content">
          <div className="especie-icon-wrapper">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
          </div>
          <div className="especie-title-area">
            <h2>Cadastro de Espécies de Processo</h2>
            <p>Configure tipo, setor e prazos para cada espécie</p>
          </div>
        </div>
        <button className="btn btn-primary btn-new-especie" onClick={abrirModalNovo}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          Nova Espécie
        </button>
        <div className="especie-header-decoration"></div>
      </div>

      {erro && <div className="alert-modern alert-danger-modern">{erro}</div>}

      {/* Stats */}
      <div className="especie-stats-grid">
        <div className="especie-stat-card">
          <div className="especie-stat-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div>
          <div className="especie-stat-info"><span className="especie-stat-number">{especies.length}</span><span className="especie-stat-label">Total de Espécies</span></div>
        </div>
        <div className="especie-stat-card active">
          <div className="especie-stat-icon green"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div>
          <div className="especie-stat-info"><span className="especie-stat-number">{especies.filter(e => e.ativo === 1).length}</span><span className="especie-stat-label">Disponíveis</span></div>
        </div>
        <div className="especie-stat-card inactive">
          <div className="especie-stat-icon gray"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg></div>
          <div className="especie-stat-info"><span className="especie-stat-number">{especies.filter(e => e.ativo === 0).length}</span><span className="especie-stat-label">Indisponíveis</span></div>
        </div>
      </div>

      {/* Table */}
      <div className="especie-table-card">
        <div className="especie-table-header">
          <div className="especie-table-title"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3zM3 9h18M9 21V9" /></svg><span>Lista de Espécies</span></div>
          <div className="especie-table-count"><span className="count-badge">{especies.length}</span><span>{especies.length === 1 ? 'registro' : 'registros'}</span></div>
        </div>
        <div className="table-container modern-table">
          <table>
            <thead><tr><th>Código</th><th>Nome</th><th>Tipo</th><th>Setor</th><th>Prazo</th><th>Status</th><th style={{ width: 120 }}>Ações</th></tr></thead>
            <tbody>
              {especies.length === 0 ? (
                <tr><td colSpan="7"><div className="table-empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg><h4>Nenhuma espécie cadastrada</h4><p>Cadastre a primeira espécie</p></div></td></tr>
              ) : especies.map((item, index) => (
                <tr key={item.id} className="especie-row" style={{ animationDelay: `${index * 30}ms` }}>
                  <td><span className="codigo-badge">{item.codigo}</span></td>
                  <td><div className="especie-cell"><div className="especie-icon-box"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div><span className="especie-cell-name">{item.nome}</span></div></td>
                  <td><span className="tipo-badge">{item.tipo_processo_nome || getTipoNome(item.tipo_processo_id)}</span></td>
                  <td><span className="setor-badge">{item.setor_nome || getSetorNome(item.setor_id)}</span></td>
                  <td><span className="prazo-badge">{item.prazo_minimo ?? '—'} a {item.prazo_maximo ?? '—'} {item.dias_uteis ? 'dias úteis' : 'dias'}</span></td>
                  <td><span className={`status-badge ${item.ativo === 1 ? 'active' : 'inactive'}`}><span className={`status-dot ${item.ativo === 1 ? 'active' : ''}`}></span>{item.ativo === 1 ? 'Disponível' : 'Indisponível'}</span></td>
                  <td><AcoesDropdownLinha t={item} viewEspecie={viewEspecie} abrirModalEditar={abrirModalEditar} excluir={excluir} desativar={desativar} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content modal-modern modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <div className="modal-header-icon orange"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div>
              <div className="modal-header-text"><h2>{modalTitle}</h2><p>{somenteLeitura ? 'Somente visualização' : editando ? 'Atualize os dados' : 'Preencha os dados'}</p></div>
              <button className="modal-close" onClick={fecharModal}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
            </div>
            <div className="modal-body-modern">
              <form onSubmit={salvar}>
                <div className="form-row-grid">
                  <div className="form-group-modern"><label>Código <span className="required">*</span></label><input type="text" className="form-control-modern" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required placeholder="Ex: E01" disabled={somenteLeitura} /></div>
                  <div className="form-group-modern"><label>Nome <span className="required">*</span></label><input type="text" className="form-control-modern" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required placeholder="Ex: Requerimento" disabled={somenteLeitura} /></div>
                  <div className="form-group-modern"><label>Tipo de Processo</label><select className="form-control-modern" value={form.tipo_processo_id} onChange={(e) => setForm({ ...form, tipo_processo_id: e.target.value })} disabled={somenteLeitura}><option value="">Selecione</option>{tipos.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}</select></div>
                  <div className="form-group-modern"><label>Setor Responsável</label><select className="form-control-modern" value={form.setor_id} onChange={(e) => setForm({ ...form, setor_id: e.target.value })} disabled={somenteLeitura}><option value="">Selecione</option>{setores.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}</select></div>
                </div>
                <div className="form-row-grid">
                  <div className="form-group-modern"><label>Prazo Mínimo (dias)</label><input type="number" className="form-control-modern" value={form.prazo_minimo} onChange={(e) => setForm({ ...form, prazo_minimo: e.target.value })} min="0" disabled={somenteLeitura} /></div>
                  <div className="form-group-modern"><label>Prazo Máximo (dias)</label><input type="number" className="form-control-modern" value={form.prazo_maximo} onChange={(e) => setForm({ ...form, prazo_maximo: e.target.value })} min="0" disabled={somenteLeitura} /></div>
                  <div className="form-group-modern"><label>Disponível p/ Requerente</label><select className="form-control-modern" value={String(form.ativo)} onChange={(e) => setForm({ ...form, ativo: parseInt(e.target.value, 10) })} disabled={somenteLeitura}><option value="1">Sim</option><option value="0">Não</option></select></div>
                  <div className="form-group-modern" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" id="dias_uteis" className="permissao-checkbox" checked={form.dias_uteis} onChange={(e) => setForm({ ...form, dias_uteis: e.target.checked })} disabled={somenteLeitura} />
                    <label htmlFor="dias_uteis" className="permissao-label" style={{ margin: 0 }}>Contar dias úteis</label>
                  </div>
                </div>
                <div className="form-group-modern" style={{ gridColumn: '1 / -1' }}>
                  <label>Mensagem Personalizada</label>
                  <textarea className="form-control-modern" rows="3" value={form.mensagem_customizada} onChange={(e) => setForm({ ...form, mensagem_customizada: e.target.value })} placeholder="Mensagem para processos desta espécie..." disabled={somenteLeitura} />
                </div>

                {/* Campos e Anexos */}
                <div className="anexos-section-modern">
                  <div className="anexos-header-modern">
                    <div><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg><span>Campos e Anexos</span></div>
                    {!somenteLeitura && <button type="button" className="btn btn-add-field" onClick={() => setAnexosCampos((prev) => [...prev, { titulo: '', tipo: 'arquivo', obrigatorio: false, ordem: prev.length ? Math.max(...prev.map((x) => Number(x.ordem) || 0)) + 1 : 1, opcoes: null }])}>+ Adicionar campo</button>}
                  </div>
                  {loadingAnexosCampos && <div className="especies-loading"><span className="spinner"></span>Carregando campos...</div>}
                  {erroAnexosCampos && <div className="alert-modern alert-danger-modern">{erroAnexosCampos}</div>}
                  <div className="anexos-fields-list">
                    {anexosCampos.length === 0 ? (
                      <div className="anexos-empty"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg><p>Nenhum campo/anexo configurado</p></div>
                    ) : anexosCampos.slice().sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0)).map((campo, idx) => {
                      const ordemValue = Number(campo.ordem) || idx + 1;
                      return (
                        <div key={`campo-${idx}`} className="campo-card-modern">
                          <div className="campo-card-header">
                            <div className="campo-card-meta">
                              <span className="campo-ordem">#{ordemValue}</span>
                              <span className={`campo-tipo-badge tipo-${campo.tipo}`}>{campo.tipo}</span>
                              <span className={`campo-obrigatorio-badge ${campo.obrigatorio ? 'required' : ''}`}>{campo.obrigatorio ? 'Obrigatório' : 'Opcional'}</span>
                            </div>
                            {!somenteLeitura && <button type="button" className="btn-remove-campo" onClick={() => setAnexosCampos((prev) => prev.filter((_, i) => i !== idx))}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>}
                          </div>
                          <div className="form-row-grid">
                            <div className="form-group-modern"><label>Documento</label><input type="text" className="form-control-modern" value={campo.titulo} disabled={somenteLeitura} placeholder="Ex: Cópia do RG" onChange={(e) => setAnexosCampos((prev) => prev.map((x, i) => i === idx ? { ...x, titulo: e.target.value } : x))} /></div>
                            <div className="form-group-modern"><label>Tipo</label><select className="form-control-modern" value={campo.tipo} disabled={somenteLeitura} onChange={(e) => setAnexosCampos((prev) => prev.map((x, i) => i === idx ? { ...x, tipo: e.target.value } : x))}><option value="texto">Texto</option><option value="numero">Número</option><option value="data">Data</option><option value="arquivo">Arquivo</option></select></div>
                            <div className="form-group-modern"><label>Ordem</label><input type="number" className="form-control-modern" value={ordemValue} disabled={somenteLeitura} min="1" onChange={(e) => setAnexosCampos((prev) => prev.map((x, i) => i === idx ? { ...x, ordem: e.target.value } : x))} /></div>
                            <div className="form-group-modern" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <input type="checkbox" className="permissao-checkbox" checked={!!campo.obrigatorio} disabled={somenteLeitura} onChange={(e) => setAnexosCampos((prev) => prev.map((x, i) => i === idx ? { ...x, obrigatorio: e.target.checked } : x))} />
                              <label className="permissao-label" style={{ margin: 0 }}>Obrigatório</label>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {erro && <div className="alert-modern alert-danger-modern" style={{ marginTop: 16 }}>{erro}</div>}
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary-modern" onClick={fecharModal} disabled={salvando}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>{somenteLeitura ? 'Fechar' : 'Cancelar'}</button>
                  {!somenteLeitura && <button type="submit" className="btn btn-primary-modern orange" disabled={salvando}>{salvando ? <><span className="spinner"></span>Salvando...</> : <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>{editando ? 'Atualizar' : 'Salvar'}</>}</button>}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CadastroEspeciesProcesso;