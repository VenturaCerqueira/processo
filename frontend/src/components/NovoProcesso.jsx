import React, { useState, useEffect } from 'react';
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

function NovoProcesso() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const processoPaiId = searchParams.get('processoPaiId');

  const [form, setForm] = useState({ tipo: '', assunto: '', requerente: '', cpfCnpj: '', endereco: '', telefone: '', email: '', descricao: '', prioridade: 'normal', prazo: '', setorAtual: '', especie_id: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [tipos, setTipos] = useState([]);
  const [setores, setSetores] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [requerentes, setRequerentes] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [processoPai, setProcessoPai] = useState(null);
  const [especieSelecionada, setEspecieSelecionada] = useState(null);

  useEffect(() => {
    async function carregarOpcoes() {
      try {
        const [tRes, sRes, pRes, cRes, eRes] = await Promise.all([
          api.get('/tipos-processo'),
          api.get('/setores'),
          api.get('/prioridades'),
          api.get('/requerentes'),
          api.get('/especies-processo')
        ]);
        setTipos(tRes.data);
        setSetores(sRes.data);
        setPrioridades(pRes.data);
        setRequerentes(cRes.data);
        setEspecies(eRes.data);
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
  }, [processoPaiId]);

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
        tipo: esp.tipo_processo_nome || prev.tipo,
        setorAtual: esp.setor_nome || prev.setorAtual,
        prazo: esp.prazo_maximo ? calcularPrazo(esp.prazo_maximo, !!esp.dias_uteis) : prev.prazo
      }));
    } else {
      setForm(prev => ({ ...prev, especie_id: '', prazo: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      const response = processoPaiId
        ? await api.post(`/processos/${processoPaiId}/filho`, form)
        : await api.post('/processos', form);
      navigate(`/processos/${response.data.id}`);
    } catch (error) { setErro(error.response?.data?.message || 'Erro ao criar processo'); }
    finally { setLoading(false); }
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
          <span style={{ fontSize: 12, opacity: 0.8 }}>Os dados do requerente serão copiados automaticamente.</span>
        </div>
      )}

      {erro && <div className="alert alert-danger">{erro}</div>}

      <div className="card">

        <form onSubmit={handleSubmit}>
          {/* Especie Section */}
          {especies.length > 0 && (
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
                  <select id="especie" className="form-control select-enhanced" value={form.especie_id} onChange={handleEspecieChange}>
                    <option value="">Selecione uma especie (opcional)</option>
                    {especies.map(ep => (
                      <option key={ep.id} value={ep.id}>
                        {ep.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="prazo">Prazo *</label>
                  <input id="prazo" type="date" className="form-control" value={form.prazo} onChange={e => setForm(prev => ({ ...prev, prazo: e.target.value }))} required />
                </div>
              </div>
            </div>
          )}

          {/* Especie Info */}
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
                <select id="tipo" className="form-control select-enhanced" value={form.tipo} onChange={e => setForm(prev => ({ ...prev, tipo: e.target.value }))} required>
                  <option value="">Selecione o tipo</option>
                  {tipos.map(t => (
                    <option key={t.id} value={t.nome}>{t.nome}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="setorAtual">Setor Atual *</label>
                <select id="setorAtual" className="form-control select-enhanced" value={form.setorAtual} onChange={e => setForm(prev => ({ ...prev, setorAtual: e.target.value }))} required>
                  <option value="">Selecione o setor</option>
                  {setores.map(s => (
                    <option key={s.id} value={s.nome}>{s.nome}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row-modern">
              <div className="form-group">
                <label htmlFor="assunto">Assunto do Processo *</label>
                <input id="assunto" type="text" className="form-control" value={form.assunto} onChange={e => setForm(prev => ({ ...prev, assunto: e.target.value }))} required placeholder="Ex: Solicitação de documentos, recurso administrativo..." maxLength="200" />
                <div className="char-counter">{form.assunto.length}/200</div>
              </div>
              <div className="form-group">
                <label htmlFor="prioridade">Prioridade</label>
                <select id="prioridade" className="form-control select-enhanced" value={form.prioridade} onChange={e => setForm(prev => ({ ...prev, prioridade: e.target.value }))}>
                  {prioridades.map(p => (
                    <option key={p.id} value={p.nome}>{p.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Requester Details */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">
                <IconRequerente />
              </div>
              <div>
                <div className="form-section-title">Dados do Requerente</div>
                <div className="form-section-description">Informações do cidadão ou empresa solicitante</div>
              </div>
            </div>
            <div className="form-row-modern">
              <div className="form-group">
                <label htmlFor="requerente">Nome do Requerente *</label>
                <input id="requerente" type="text" className="form-control" value={form.requerente} onChange={e => setForm(prev => ({ ...prev, requerente: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label htmlFor="cpfCnpj">CPF / CNPJ</label>
                <div className="input-group">
                  <IconDocumento />
                  <input id="cpfCnpj" type="text" className="form-control" value={form.cpfCnpj} onChange={e => setForm(prev => ({ ...prev, cpfCnpj: formatCpfCnpj(e.target.value) }))} placeholder="000.000.000-00" />
                </div>
              </div>
            </div>
            <div className="form-row-modern">
              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <div className="input-group">
                  <IconTelefone />
                  <input id="telefone" type="text" className="form-control" value={form.telefone} onChange={e => setForm(prev => ({ ...prev, telefone: formatTelefone(e.target.value) }))} placeholder="(00) 00000-0000" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-group">
                  <IconEmail />
                  <input id="email" type="email" className="form-control" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="form-row-modern">
              <div className="form-group">
                <label htmlFor="endereco">Endereço Completo</label>
                <div className="input-group">
                  <IconEndereco />
                  <input id="endereco" type="text" className="form-control" value={form.endereco} onChange={e => setForm(prev => ({ ...prev, endereco: e.target.value }))} placeholder="Rua, número, bairro, cidade - CEP" />
                </div>
              </div>
            </div>
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
              <textarea id="descricao" className="form-control" rows="6" value={form.descricao} onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))} placeholder="Descreva em detalhes o objeto do processo, anexos necessários e qualquer informação relevante..." maxLength="2000" />
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
                'Criar Processo'
              )}
            </button>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/caixa-entrada')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NovoProcesso;

