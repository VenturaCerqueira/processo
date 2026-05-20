import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api';

// Icons as components
const IconEspecie = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconTipo = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const IconSetor = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const IconAssunto = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const IconPrioridade = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const IconRequerente = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconDocumento = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconTelefone = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 006.516 6.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const IconEmail = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconEndereco = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconPrazo = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconDescricao = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
  </svg>
);

// Helpers para máscara de CPF/CNPJ e telefone
function formatCpfCnpj(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 14);
  if (!digits) return '';

  // CPF: 000.000.000-00 (até 11 dígitos)
  if (digits.length <= 11) {
    const d = digits;
    const p1 = d.slice(0, 3);
    const p2 = d.slice(3, 6);
    const p3 = d.slice(6, 9);
    const p4 = d.slice(9, 11);

    if (d.length <= 3) return p1;
    if (d.length <= 6) return `${p1}.${p2}`;
    if (d.length <= 9) return `${p1}.${p2}.${p3}`;
    return `${p1}.${p2}.${p3}-${p4}`;
  }

  // CNPJ: 00.000.000/0000-00 (12 a 14 dígitos, máscara parcial)
  const d = digits;
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 5);
  const p3 = d.slice(5, 8);
  const p4 = d.slice(8, 12);
  const p5 = d.slice(12, 14);

  if (d.length <= 2) return p1;
  if (d.length <= 5) return `${p1}.${p2}`;
  if (d.length <= 8) return `${p1}.${p2}.${p3}`;
  if (d.length <= 12) return `${p1}.${p2}.${p3}/${p4}`;
  return `${p1}.${p2}.${p3}/${p4}-${p5}`;
}



function formatTelefone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';

  const d = digits.slice(0, 11);
  const ddd = d.slice(0, 2);

  if (d.length <= 2) return `(${ddd}`;
  if (d.length <= 6) {
    const p = d.slice(2);
    return `(${ddd}) ${p}`;
  }

  // 10 ou 11 dígitos
  if (d.length === 10) {
    const p1 = d.slice(2, 6);
    const p2 = d.slice(6, 10);
    return `(${ddd}) ${p1}-${p2}`;
  }

  const p1 = d.slice(2, 7);
  const p2 = d.slice(7, 11);
  return `(${ddd}) ${p1}-${p2}`;
}

function NovoProcesso() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const processoPaiId = searchParams.get('processoPaiId');

  const [form, setForm] = useState({
    tipo: '', // nome do tipo (tp.nome) - enviado ao backend
    tipo_id: '', // id do tipo - usado apenas no select e para carregar espécies
    assunto: '',
    requerente: '',
    cpfCnpj: '',
    endereco: '',
    telefone: '',
    email: '',
    descricao: '',
    prioridade: 'normal',
    prazo: '',
    setorAtual: '',
    especie_id: ''
  });
  const userEditedRef = useRef(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [tipos, setTipos] = useState([]);
  const [setores, setSetores] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [requerentes, setRequerentes] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [loadingEspecies, setLoadingEspecies] = useState(false);
  const [erroEspecies, setErroEspecies] = useState('');
  const [processoPai, setProcessoPai] = useState(null);
  const [especieSelecionada, setEspecieSelecionada] = useState(null);

  // Representantes legais (CNPJ/jurídico)
  const [requerenteIdAtual, setRequerenteIdAtual] = useState(null);
  const [representantes, setRepresentantes] = useState([]);
  const [carregandoRepresentantes, setCarregandoRepresentantes] = useState(false);
  const [mostrarModalRepresentantes, setMostrarModalRepresentantes] = useState(false);


  useEffect(() => {
    async function carregarOpcoes() {
      try {
        const [tRes, sRes, pRes, cRes] = await Promise.all([
          api.get('/tipos-processo'),
          api.get('/setores'),
          api.get('/prioridades'),
          api.get('/requerentes')
        ]);
        setTipos(tRes.data);
        setSetores(sRes.data);
        setPrioridades(pRes.data);
        setRequerentes(cRes.data);
      } catch (error) { console.error('Erro ao carregar opcoes:', error); }
    }
    carregarOpcoes();

    async function carregarProcessoPai() {
      if (!processoPaiId) return;
      try {
        const { data } = await api.get(`/processos/${processoPaiId}`);
        setProcessoPai(data);
        setForm(prev => ({
          ...prev,
          requerente: data.requerente || '',
          cpfCnpj: data.cpfCnpj || '',
          endereco: data.endereco || '',
          telefone: data.telefone || '',
          email: data.email || ''
        }));
      } catch (error) { console.error('Erro ao carregar processo pai:', error); }
    }
    carregarProcessoPai();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processoPaiId]);

  useEffect(() => {
    (async () => {
      if (!form.tipo_id) {
        setEspecies([]);
        setLoadingEspecies(false);
        setErroEspecies('');
        setEspecieSelecionada(null);
        setForm(prev => ({ ...prev, especie_id: '', prazo: '' }));
        return;
      }

      setLoadingEspecies(true);
      setErroEspecies('');
      try {
        const { data } = await api.get('/especies-processo', { params: { tipo: form.tipo_id } });
        const list = Array.isArray(data) ? data : [];
        setEspecies(list);

        // Se a espécie selecionada não existir mais para o tipo atual, limpa
        setForm(prev => {
          const selectedId = prev.especie_id ? parseInt(prev.especie_id) : null;
          const selectedStillValid = selectedId && list.some(x => x.id === selectedId);
          if (!selectedStillValid) return { ...prev, especie_id: '', prazo: '' };
          return prev;
        });
      } catch (error) {
        setEspecies([]);
        setErroEspecies('Erro ao carregar espécies vinculadas ao tipo.');
        setForm(prev => ({ ...prev, especie_id: '', prazo: '' }));
      } finally {
        setLoadingEspecies(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.tipo_id]);





  const calcularPrazo = (dias, diasUteis) => {
    if (!dias) return '';
    const data = new Date();
    let diasAdicionados = 0;
    while (diasAdicionados < dias) {
      data.setDate(data.getDate() + 1);
      if (diasUteis) {
        const diaSemana = data.getDay();
        if (diaSemana !== 0 && diaSemana !== 6) diasAdicionados++;
      } else {
        diasAdicionados++;
      }
    }
    return data.toISOString().split('T')[0];
  };

  const handleEspecieChange = (e) => {
    const especieId = e.target.value;
    const esp = especies.find(ep => ep.id === parseInt(especieId));
    setEspecieSelecionada(esp || null);

    if (esp) {
      setForm(prev => ({
        ...prev,
        especie_id: especieId,
        // mantém o tipo escolhido pelo usuário (form.tipo é ID no select)
        // tipo: esp.tipo_processo_nome || prev.tipo,  (REMOVIDO para não quebrar o select)
        tipo: prev.tipo,
        setorAtual: esp.setor_nome || prev.setorAtual,
        prazo: esp.prazo_maximo ? calcularPrazo(esp.prazo_maximo, !!esp.dias_uteis) : prev.prazo
      }));
    } else {
      setForm(prev => ({ ...prev, especie_id: '', prazo: '' }));
    }
  };

  // Campos/anexos configurados na espécie
  const [loadingAnexosCampos, setLoadingAnexosCampos] = useState(false);
  const [anexosCampos, setAnexosCampos] = useState([]);
  const [erroAnexosCampos, setErroAnexosCampos] = useState('');

  const [valoresAnexos, setValoresAnexos] = useState({
    // [especie_anexo_id]: { valor_texto?, valor_numero?, valor_data?, arquivo?, arquivoDocumento? }
  });

  const carregarAnexosCampos = async (especieId) => {
    setLoadingAnexosCampos(true);
    setErroAnexosCampos('');
    try {
      if (!especieId) {
        setAnexosCampos([]);
        setValoresAnexos({});
        return;
      }
      const { data } = await api.get(`/especies-processo/${especieId}/anexos`);
      const list = Array.isArray(data)
        ? data.map((x) => ({
            id: x.id,
            especie_id: x.especie_id,
            titulo: x.titulo ?? '',
            tipo: x.tipo ?? 'arquivo',
            obrigatorio: !!x.obrigatorio,
            ordem: x.ordem ?? 0,
            opcoes: x.opcoes ?? null,
          }))
        : [];
      setAnexosCampos(list);
      // resetar valores ao trocar espécie
      setValoresAnexos({});
    } catch {
      setErroAnexosCampos('Erro ao carregar campos de anexos da espécie.');
      setAnexosCampos([]);
      setValoresAnexos({});
    } finally {
      setLoadingAnexosCampos(false);
    }
  };

  useEffect(() => {
    if (form.especie_id) {
      carregarAnexosCampos(form.especie_id);
    } else {
      setAnexosCampos([]);
      setValoresAnexos({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.especie_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setErroAnexosCampos('');
    try {
      // Persistir representantes legais (somente se houver CNPJ/jurídico e requerente identificado)
      const normalizar = (v) => String(v || '').replace(/\D/g, '');
      const isJuridico = normalizar(form.cpfCnpj).length === 14;

      if (isJuridico && requerenteIdAtual) {
        setCarregandoRepresentantes(true);
        await api.post(`/requerentes/${requerenteIdAtual}/representantes`, {
          representantes
        });
        setCarregandoRepresentantes(false);
      }

      // ===== Arquivos dos campos da espécie =====
      // Para campos do tipo 'arquivo', primeiro criamos o processo para obter o id,
      // depois fazemos upload via multipart e finalmente salvamos documento_id.
      const anexosValoresSemArquivo = anexosCampos.map((campo) => {
        const v = valoresAnexos[campo.id] || {};
        return {
          especie_anexo_id: campo.id,
          valor_texto:
            campo.tipo === 'texto' ? (v.valor_texto ?? '') : null,
          valor_numero:
            campo.tipo === 'numero' ? (v.valor_numero ?? null) : null,
          valor_data:
            campo.tipo === 'data' ? (v.valor_data ?? null) : null,
          documento_id:
            campo.tipo === 'arquivo' ? null : null,
        };
      });

      const payloadBase = {
        ...form,
        anexosValores: anexosValoresSemArquivo,
      };

      const response = processoPaiId
        ? await api.post(`/processos/${processoPaiId}/filho`, payloadBase)
        : await api.post('/processos', payloadBase);

      const novoProcessoId = response?.data?.id;
      if (!novoProcessoId) {
        throw new Error('Processo criado, mas id não foi retornado pelo backend.');
      }

      // Faz upload de cada arquivo e monta o anexosValores final
      const anexosValoresFinal = [];
      for (const campo of anexosCampos) {
        const v = valoresAnexos[campo.id] || {};

        if (campo.tipo === 'arquivo') {
          const file = v.arquivo;
          let documento_id = null;

          if (file) {
            const fd = new FormData();
            fd.append('documento', file);

            const uploadRes = await api.post(
              `/uploads/${novoProcessoId}/documento`,
              fd,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }
            );

            documento_id = uploadRes?.data?.documento?.id ?? null;
          }

          anexosValoresFinal.push({
            especie_anexo_id: campo.id,
            valor_texto: null,
            valor_numero: null,
            valor_data: null,
            documento_id,
          });
        } else {
          anexosValoresFinal.push({
            especie_anexo_id: campo.id,
            valor_texto:
              campo.tipo === 'texto' ? (v.valor_texto ?? '') : null,
            valor_numero:
              campo.tipo === 'numero' ? (v.valor_numero ?? null) : null,
            valor_data:
              campo.tipo === 'data' ? (v.valor_data ?? null) : null,
            documento_id: null,
          });
        }
      }

      // Endpoint dedicado para gravar/atualizar anexosValores com documento_id.
      // (criado no backend: POST /api/processos/:id/anexos-valores)
      await api.post(`/processos/${novoProcessoId}/anexos-valores`, {
        anexosValores: anexosValoresFinal,
      });

      navigate(`/processos/${novoProcessoId}`);
    } catch (error) {
      setCarregandoRepresentantes(false);
      setErro(error.response?.data?.message || 'Erro ao criar processo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="breadcrumb">
        <Link to="/caixa-entrada">Caixa de Entrada</Link>
        <span>/</span>
        <span>Novo Processo</span>
      </div>

      <div className="form-hero">
        <div className="form-hero-icon">
          <IconDocumento />
        </div>
        <div className="form-hero-content">
          <h1>{processoPaiId ? `Novo Processo Filho` : 'Novo Processo'}</h1>
          <p>Preencha os dados abaixo para criar um novo processo judicial.</p>
        </div>
      </div>

      {processoPai && (
        <div className="alert alert-info" style={{ marginBottom: 24 }}>
          <strong>Processo Pai:</strong>{' '}
          <Link to={`/processos/${processoPai.id}`}>{processoPai.numero}</Link> — {processoPai.assunto}
          <br />
          <span style={{ fontSize: 12, opacity: 0.8 }}>Os dados do Interresado serão copiados automaticamente.</span>
        </div>
      )}

      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="card">

        <form onSubmit={handleSubmit}>
          {/* Process Details */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">
                <IconTipo />
              </div>
              <div>
                <div className="form-section-title">Detalhes do Processo</div>
              </div>
            </div>
            <div className="form-row-modern">
              <div className="form-group">
                <label htmlFor="tipo">Tipo de Processo *</label>
                <div className="input-group">
                  <span className="input-icon"><IconTipo /></span>
                  <select
                    id="tipo"
                    className="form-control select-enhanced"
                    value={form.tipo_id}
                    onChange={e => {

                      const tipoSelecionadoId = e.target.value;
                      const tipoObj = tipos.find(t => String(t.id) === String(tipoSelecionadoId));
                      setForm(prev => ({
                        ...prev,
                        tipo_id: tipoSelecionadoId,
                        tipo: tipoObj?.nome || '',
                        especie_id: '',

                        prazo: ''
                      }));
                      setEspecieSelecionada(null);
                    }}
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    {tipos.map(t => (
                      <option key={t.id} value={String(t.id)}>{t.nome}</option>
                    ))}
                  </select>

                </div>
              </div>
            </div>
            <div className="form-row-modern">
              <div className="form-group">
                <label htmlFor="assunto">Assunto do Processo *</label>
                <div className="input-group">
                  <span className="input-icon"><IconAssunto /></span>
                  <input id="assunto" type="text" className="form-control" value={form.assunto} onChange={e => setForm(prev => ({ ...prev, assunto: e.target.value }))} required placeholder="Ex: Solicitação de documentos, recurso administrativo..." maxLength="200" />
                </div>
                <div className="char-counter">{form.assunto.length}/200</div>
              </div>
              <div className="form-group">
                <label htmlFor="prioridade">Prioridade</label>
                <div className="input-group">
                  <span className="input-icon"><IconPrioridade /></span>
                  <select id="prioridade" className="form-control select-enhanced" value={form.prioridade} onChange={e => setForm(prev => ({ ...prev, prioridade: e.target.value }))}>
                    {prioridades.map(p => (
                      <option key={p.id} value={p.nome}>{p.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Especie Section */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">
                <IconEspecie />
              </div>
              <div>
                <div className="form-section-title">Especie e Prazo</div>
                <div className="form-section-description">Selecione a especie para auto-preencher dados comuns</div>
              </div>
            </div>
            <div className="form-row-modern">
              <div className="form-group">
                <label htmlFor="especie">Especie de Processo</label>
                <div className="input-group">
                  <span className="input-icon"><IconEspecie /></span>
                  <select
                    id="especie"
                    className="form-control select-enhanced"
                    value={form.especie_id}
                    onChange={handleEspecieChange}
                    disabled={loadingEspecies || especies.length === 0}
                  >
                    <option value="">
                      {loadingEspecies
                        ? 'Carregando espécies...'
                        : especies.length === 0
                          ? 'Selecione um tipo para ver espécies'
                          : 'Selecione uma espécie (opcional)'}
                    </option>
                    {especies.map(ep => (
                      <option key={ep.id} value={ep.id}>
                        {ep.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prazo">Prazo *</label>
                <div className="input-group">
                  <span className="input-icon"><IconPrazo /></span>
                  <input
                    id="prazo"
                    type="date"
                    className="form-control"
                    value={form.prazo}
                    onChange={e => setForm(prev => ({ ...prev, prazo: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Especie Info */}
          {erroEspecies && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{erroEspecies}</div>}
          {especieSelecionada?.mensagem_customizada && (
            <div className="alert alert-especie">
              <strong>Informações da Especie:</strong>
              <div style={{ marginTop: 8 }}>{especieSelecionada.mensagem_customizada}</div>
              {especieSelecionada.prazo_minimo && especieSelecionada.prazo_maximo && (
                <div className="badge badge-info" style={{ marginTop: 8, fontSize: 13 }}>
                  Prazo: {especieSelecionada.prazo_minimo}-{especieSelecionada.prazo_maximo} {especieSelecionada.dias_uteis ? 'dias úteis' : 'dias corridos'}
                </div>
              )}
            </div>
          )}

          {/* Campos/anexos da espécie */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">
                <IconDocumento />
              </div>
              <div>
                <div className="form-section-title">Campos e anexos da espécie</div>
                <div className="form-section-description">Preencha os campos configurados na espécie selecionada</div>
              </div>
            </div>

            {loadingAnexosCampos && (
              <div className="alert alert-info" style={{ marginTop: 12 }}>
                Carregando campos da espécie...
              </div>
            )}

            {erroAnexosCampos && (
              <div className="alert alert-danger" style={{ marginTop: 12 }}>
                {erroAnexosCampos}
              </div>
            )}

            {!loadingAnexosCampos && anexosCampos.length === 0 && (
              <div className="empty-state" style={{ fontSize: 13, opacity: 0.85 }}>
                Nenhum campo/anexo configurado para esta espécie.
              </div>
            )}

            {anexosCampos.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {anexosCampos
                  .slice()
                  .sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0))
                  .map((campo) => {
                    const v = valoresAnexos[campo.id] || {};
                    const obrigatorio = campo.obrigatorio;

                    return (
                      <div
                        key={campo.id}
                        className="card"
                        style={{ padding: 16, borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                          <div style={{ fontWeight: 900 }}>
                            {campo.titulo || 'Campo'}{' '}
                            {obrigatorio && <span style={{ color: '#dc2626', fontWeight: 800 }}>*</span>}
                          </div>
                          <div style={{ fontSize: 12, opacity: 0.75 }}>
                            Tipo: <b>{campo.tipo || 'arquivo'}</b>
                          </div>
                        </div>

                        <div style={{ marginTop: 12 }}>
                          {campo.tipo === 'texto' && (
                            <input
                              type="text"
                              className="form-control"
                              value={v.valor_texto ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setValoresAnexos((prev) => ({
                                  ...prev,
                                  [campo.id]: { ...(prev[campo.id] || {}), valor_texto: val },
                                }));
                              }}
                              placeholder={campo.opcoes?.placeholder || 'Digite...'}
                              disabled={loading}
                            />
                          )}

                          {campo.tipo === 'numero' && (
                            <input
                              type="number"
                              className="form-control"
                              value={v.valor_numero ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setValoresAnexos((prev) => ({
                                  ...prev,
                                  [campo.id]: {
                                    ...(prev[campo.id] || {}),
                                    valor_numero: val === '' ? null : Number(val),
                                  },
                                }));
                              }}
                              placeholder={campo.opcoes?.placeholder || 'Digite um número...'}
                              disabled={loading}
                            />
                          )}

                          {campo.tipo === 'data' && (
                            <input
                              type="date"
                              className="form-control"
                              value={v.valor_data ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setValoresAnexos((prev) => ({
                                  ...prev,
                                  [campo.id]: { ...(prev[campo.id] || {}), valor_data: val },
                                }));
                              }}
                              disabled={loading}
                            />
                          )}

                          {campo.tipo === 'arquivo' && (
                            <input
                              type="file"
                              className="form-control"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setValoresAnexos((prev) => ({
                                  ...prev,
                                  [campo.id]: { ...(prev[campo.id] || {}), arquivo: file, documento_id: null },
                                }));
                              }}
                              disabled={loading}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Requester Details */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">
                <IconRequerente />
              </div>
              <div>
                <div className="form-section-title">Dados do Interresado</div>
                <div className="form-section-description">Informações do cidadão ou empresa solicitante</div>
              </div>
            </div>

            <div className="form-row-modern">
              <div className="form-group">
                <label htmlFor="cpfCnpj">CPF / CNPJ</label>
                <div className="input-group">
                  <span className="input-icon"><IconDocumento /></span>
                  <input
                    id="cpfCnpj"
                    type="text"
                    className="form-control"
                    value={form.cpfCnpj}
                    onChange={(e) => {
                      userEditedRef.current = true;
                      const value = formatCpfCnpj(e.target.value);
                      setForm(prev => ({ ...prev, cpfCnpj: value }));
                    }}
                    onBlur={async () => {
                      const cpfCnpjAtual = form.cpfCnpj;
                      if (!cpfCnpjAtual) return;
                      try {
                        const { data } = await api.get(`/requerentes?busca=${encodeURIComponent(cpfCnpjAtual)}`);
                        const normalizar = (v) => String(v || '').replace(/\D/g, '');
                        const normalizadoAtual = normalizar(cpfCnpjAtual);

                        const match = Array.isArray(data)
                          ? data.find(r => normalizar(r.cpfCnpj) === normalizadoAtual)
                          : null;

                        const req = match || (Array.isArray(data) ? data[0] : null);
                        if (!req) return;

                        const isJuridico = normalizadoAtual.length === 14;

                        setForm(prev => ({
                          ...prev,
                          requerente: req.nome || prev.requerente,
                          cpfCnpj: req.cpfCnpj || prev.cpfCnpj,
                          endereco: req.endereco || prev.endereco,
                          telefone: req.telefone || prev.telefone,
                          email: req.email || prev.email,
                        }));

                        // Carregar representantes apenas se for CNPJ (jurídico)
                        setRequerenteIdAtual(req.id || null);
                        if (isJuridico && req.id) {
                          setCarregandoRepresentantes(true);
                          const { data: reps } = await api.get(`/requerentes/${req.id}/representantes`);
                          setRepresentantes(Array.isArray(reps) ? reps.map(r => ({
                            id: r.id,
                            nome: r.nome || '',
                            cpfCnpj: r.cpfCnpj || '',
                            telefone: r.telefone || '',
                            email: r.email || ''
                          })) : []);
                          setCarregandoRepresentantes(false);
                        } else {
                          setRepresentantes([]);
                        }
                      } catch (error) {
                        setCarregandoRepresentantes(false);
                        console.warn('Erro ao buscar requerente por CPF/CNPJ:', error?.response?.data || error.message);
                      }
                    }}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="interessado">{(() => {
                      const digits = String(form.cpfCnpj || '').replace(/\D/g, '');
                      const isJuridico = digits.length === 14;
                      return isJuridico ? 'Nome Fantasia *' : 'Nome do Interressado *';
                    })()}</label>

                <div className="input-group">
                  <span className="input-icon"><IconRequerente /></span>
                  <input
                    id="interessado"
                    type="text"
                    className="form-control"
                    value={form.requerente}
                    onChange={e => {
                      userEditedRef.current = true;
                      setForm(prev => ({ ...prev, requerente: e.target.value }));
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-row-modern">
              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <div className="input-group">
                  <span className="input-icon"><IconTelefone /></span>
                  <input
                    id="telefone"
                    type="text"
                    className="form-control"
                    value={form.telefone}
                    onChange={e => {
                      userEditedRef.current = true;
                      setForm(prev => ({ ...prev, telefone: formatTelefone(e.target.value) }));
                    }}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-group">
                  <span className="input-icon"><IconEmail /></span>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={e => {
                      userEditedRef.current = true;
                      setForm(prev => ({ ...prev, email: e.target.value }));
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="form-row-modern">
              <div className="form-group">
                <label htmlFor="endereco">Endereço Completo</label>
                <div className="input-group">
                  <span className="input-icon"><IconEndereco /></span>
                  <input
                    id="endereco"
                    type="text"
                    className="form-control"
                    value={form.endereco}
                    onChange={e => {
                      userEditedRef.current = true;
                      setForm(prev => ({ ...prev, endereco: e.target.value }));
                    }}
                    placeholder="Rua, número, bairro, cidade - CEP"
                  />
                </div>
              </div>
            </div>

            {/* Representantes legais (somente CNPJ/jurídico) */}
            {(() => {
              const normalizar = (v) => String(v || '').replace(/\D/g, '');
              const isJuridico = normalizar(form.cpfCnpj).length === 14;
              if (!isJuridico) return null;

              return (
                <div style={{ marginTop: 18 }}>
                  <div className="form-section-title" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(33, 150, 243, 0.12)',
                        color: '#2196f3',
                        fontWeight: 800
                      }}
                    >
                      R
                    </span>
                    Representantes legais
                  </div>
                  <div className="form-section-description" style={{ marginBottom: 14 }}>
                    Cadastre um ou mais representantes do Interresado (CNPJ).
                  </div>

                  {carregandoRepresentantes && (
                    <div className="alert alert-info" style={{ marginBottom: 12 }}>Carregando representantes...</div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setMostrarModalRepresentantes(true)}
                      disabled={!requerenteIdAtual || carregandoRepresentantes}
                      style={{
                        borderRadius: 12,
                        padding: '10px 16px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        transition: 'transform .08s ease, box-shadow .08s ease',
                        boxShadow: '0 6px 18px rgba(33,150,243,0.18)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 10px 26px rgba(33,150,243,0.26)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow = '0 6px 18px rgba(33,150,243,0.18)';
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                      Gerenciar representantes ({representantes.length})
                    </button>

                    {requerenteIdAtual && !carregandoRepresentantes && (
                      <div style={{ fontSize: 12, opacity: 0.75 }}>
                        Dica: use o botão para adicionar/editar e remover representantes.
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}


            {mostrarModalRepresentantes && requerenteIdAtual && (
              <div className="modal-overlay" onClick={() => setMostrarModalRepresentantes(false)}>
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                  style={{ maxWidth: 980, borderRadius: 14 }}
                >
                  <div className="modal-header" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 12,
                            background: 'rgba(76, 175, 80, 0.12)',
                            color: '#4caf50',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900
                          }}
                        >
                          ✓
                        </div>
                        <h3 style={{ margin: 0 }}>Gerenciar representantes legais</h3>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setMostrarModalRepresentantes(false)}
                        style={{ borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6 6 18" />
                          <path d="M6 6l12 12" />
                        </svg>
                        Fechar
                      </button>
                    </div>
                  </div>

                  <div className="modal-body" style={{ paddingTop: 16 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setRepresentantes(prev => ([
                          ...prev,
                          { id: null, nome: '', cpfCnpj: '', telefone: '', email: '' }
                        ]))}
                        style={{ borderRadius: 12, padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: 10 }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 5v14" />
                          <path d="M5 12h14" />
                        </svg>
                        Adicionar representante
                      </button>

                      <div style={{ fontSize: 12, opacity: 0.75 }}>
                        Campos essenciais: <b>Nome</b>.
                      </div>
                    </div>

                    {representantes.length === 0 && (
                      <div className="alert alert-info">
                        Nenhum representante cadastrado ainda. Clique em <b>Adicionar</b>.
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {representantes.map((rep, idx) => (
                        <div
                          key={rep.id ?? `novo-${idx}`}
                          className="card"
                          style={{ padding: 16, borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12 }}>
                            <div style={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{
                                width: 28,
                                height: 28,
                                borderRadius: 10,
                                background: 'rgba(33,150,243,0.12)',
                                color: '#2196f3',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {idx + 1}
                              </span>
                              Representante
                            </div>

                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => setRepresentantes(prev => prev.filter((_, i) => i !== idx))}
                              style={{ borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                              aria-label={`Remover representante ${idx + 1}`}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M3 6h18" />
                                <path d="M8 6V4h8v2" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                              </svg>
                              Remover
                            </button>
                          </div>

                          <div className="form-row-modern" style={{ gap: 16 }}>
                            <div className="form-group" style={{ flex: 1, minWidth: 240 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                                Nome *
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={rep.nome}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setRepresentantes(prev => prev.map((r, i) => i === idx ? { ...r, nome: val } : r));
                                }}
                                required
                              />
                            </div>

                            <div className="form-group" style={{ flex: 1, minWidth: 240 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                  <path d="M7 9h10" />
                                  <path d="M7 13h6" />
                                </svg>
                                CPF / CNPJ
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={rep.cpfCnpj}
                                onChange={(e) => {
                                  const val = formatCpfCnpj(e.target.value);
                                  setRepresentantes(prev => prev.map((r, i) => i === idx ? { ...r, cpfCnpj: val } : r));
                                }}
                                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                              />
                            </div>
                          </div>

                          <div className="form-row-modern" style={{ gap: 16, marginTop: 12 }}>
                            <div className="form-group" style={{ flex: 1, minWidth: 240 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72c.12.81.32 1.6.59 2.36a2 2 0 0 1-.45 2.11L9.09 10.91a16 16 0 0 0 4 4l1.72-1.16a2 2 0 0 1 2.11-.45c.76.27 1.55.47 2.36.59A2 2 0 0 1 22 16.92z" />
                                </svg>
                                Telefone
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={rep.telefone}
                                onChange={(e) => {
                                  const val = formatTelefone(e.target.value);
                                  setRepresentantes(prev => prev.map((r, i) => i === idx ? { ...r, telefone: val } : r));
                                }}
                                placeholder="(00) 00000-0000"
                              />
                            </div>

                            <div className="form-group" style={{ flex: 1, minWidth: 240 }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 4h16v16H4z" />
                                  <path d="M22 6l-10 7L2 6" />
                                </svg>
                                Email
                              </label>
                              <input
                                type="email"
                                className="form-control"
                                value={rep.email}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setRepresentantes(prev => prev.map((r, i) => i === idx ? { ...r, email: val } : r));
                                }}
                                placeholder="email@dominio.com"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="modal-footer" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 14 }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setMostrarModalRepresentantes(false)}
                        style={{ borderRadius: 12, padding: '10px 16px' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        Concluir
                      </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Description */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">
                <IconDescricao />
              </div>
              <div>
                <div className="form-section-title">Descrição Detalhada</div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="descricao">Descrição</label>
              <div className="input-group">
                <span className="input-icon"><IconDescricao /></span>
                <textarea id="descricao" className="form-control" rows="6" value={form.descricao} onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))} placeholder="Descreva em detalhes o objeto do processo, anexos necessários e qualquer informação relevante..." maxLength="2000" />
              </div>
              <div className="char-counter">{form.descricao.length}/2000</div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="submit-bar">
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, marginRight: 8 }} />
                  Salvando...
                </>
              ) : (
                <>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Criar Processo
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => navigate('/caixa-entrada')}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12" />
              </svg>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NovoProcesso;

