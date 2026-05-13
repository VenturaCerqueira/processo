import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function RequerenteDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [requerente, setRequerente] = useState(null);
  const [representantes, setRepresentantes] = useState([]);
  const [protocolos, setProtocolos] = useState([]);
  const [carregandoRepresentantes, setCarregandoRepresentantes] = useState(false);
  const [carregandoProtocolos, setCarregandoProtocolos] = useState(false);

  const chips = useMemo(() => {
    if (!requerente) return [];

    const t = (requerente.tipoPessoa || '').toLowerCase();
    const tipoLabel = t === 'juridica' ? 'Jurídica' : t === 'fisica' ? 'Física' : requerente.tipoPessoa;

    const cityUf = requerente.cidade || requerente.estado
      ? `${requerente.cidade || ''}${requerente.cidade && requerente.estado ? '/' : ''}${requerente.estado || ''}`.trim()
      : '';

    const cpfCnpj = requerente.cpfCnpj || '';

    return [
      { label: tipoLabel || 'Tipo não informado', kind: 'info' },
      ...(cpfCnpj ? [{ label: cpfCnpj, kind: 'primary' }] : []),
      ...(cityUf ? [{ label: cityUf, kind: 'gray' }] : []),
    ];
  }, [requerente]);


  useEffect(() => {
    let isMounted = true;

    async function carregar() {
      setLoading(true);
      setErro('');
      try {
        const res = await api.get(`/requerentes/${id}`);
        if (isMounted) setRequerente(res.data);
      } catch (e) {
        if (!isMounted) return;
        setErro('Erro ao carregar requerente.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    carregar();
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!requerente?.id) return;

    let isMounted = true;

    async function carregarRepresentantes() {
      setCarregandoRepresentantes(true);
      try {
        const res = await api.get(`/requerentes/${requerente.id}/representantes`);
        if (isMounted) setRepresentantes(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (isMounted) setRepresentantes([]);
      } finally {
        if (isMounted) setCarregandoRepresentantes(false);
      }
    }

    async function carregarProtocolos() {
      setCarregandoProtocolos(true);
      try {
        const res = await api.get(`/requerentes/${requerente.id}/protocolos`);
        if (isMounted) setProtocolos(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (isMounted) setProtocolos([]);
      } finally {
        if (isMounted) setCarregandoProtocolos(false);
      }
    }

    carregarRepresentantes();
    carregarProtocolos();

    return () => {
      isMounted = false;
    };
  }, [requerente?.id]);

  const titulo = useMemo(() => {
    if (!requerente) return 'Detalhe do Requerente';
    const nome = (requerente.nome || '').trim();
    return nome ? `Detalhe: ${nome}` : 'Detalhe do Requerente';
  }, [requerente]);

  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;

  return (
    <div className="page-content">
      <div className="detail-hero">
        <div className="detail-hero-left">
          <div className="detail-hero-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16v16H4z" opacity="0.25" />
              <path d="M9 9h6" />
              <path d="M9 13h6" />
              <path d="M7 4v16" />
            </svg>
          </div>
        </div>

        <div className="detail-hero-center">
          <div className="detail-hero-title-row">
            <h1>{titulo}</h1>
            {requerente?.id && <span className="detail-hero-id">ID {requerente.id}</span>}
          </div>
          <p className="detail-hero-subtitle">Visualização somente leitura do cadastro.</p>

          {chips.length > 0 && (
            <div className="detail-chip-row">
              {chips.map((c, i) => (
                <span key={i} className={`detail-chip ${c.kind === 'primary' ? 'primary' : c.kind === 'gray' ? 'gray' : 'info'}`}>
                  {c.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="detail-hero-right">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/cadastros/requerentes')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Voltar
          </button>
        </div>
      </div>


      {erro && <div className="alert alert-danger">{erro}</div>}

      {requerente && (
        <div className="card detail-page-card">
          <div className="detail-section-header">
            <div className="detail-section-header-left">
              <span className="detail-section-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h18" />
                  <path d="M12 3v18" />
                </svg>
              </span>
              <div className="detail-section-header-title">Dados do Requerente</div>
            </div>
            <div className="detail-section-meta">ID: {requerente.id}</div>
          </div>

          <div className="modal-body detail-page-body" style={{ paddingTop: 0 }}>
            <div className="detail-fields-grid">
              <div className="detail-field detail-field-full">
                <div className="detail-field-label">Nome</div>
                <div className="detail-field-value detail-main-name">{requerente.nome || '—'}</div>
              </div>

              <div className="detail-field">

                <div className="detail-field-label">
                  <span className="detail-field-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  Tipo de Pessoa
                </div>
                <div className="detail-field-value">{requerente.tipoPessoa || '—'}</div>
              </div>

              <div className="detail-field">
                <div className="detail-field-label">
                  <span className="detail-field-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a4 4 0 01-4 4H7a4 4 0 01-4-4V9a4 4 0 014-4h10a4 4 0 014 4z" />
                      <path d="M9 13h6" />
                    </svg>
                  </span>
                  CPF/CNPJ
                </div>
                <div className="detail-field-value">
                  {requerente.cpfCnpj ? <span className="detail-chip primary">{requerente.cpfCnpj}</span> : '—'}
                </div>
              </div>

              <div className="detail-field detail-field-full">
                <div className="detail-field-label">
                  <span className="detail-field-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16v16H4z" opacity="0.25" />
                      <path d="M22 6l-10 7L2 6" />
                    </svg>
                  </span>
                  Email
                </div>
                <div className="detail-field-value">{requerente.email || '—'}</div>
              </div>


              <div className="detail-field">
                <div className="detail-field-label">Telefone</div>
                <div className="detail-field-value">{requerente.telefone || '—'}</div>
              </div>

              <div className="detail-field detail-field-full">
                <div className="detail-field-label">Endereço</div>
                <div className="detail-field-value">{requerente.endereco || '—'}</div>
              </div>

              <div className="detail-field">
                <div className="detail-field-label">Número</div>
                <div className="detail-field-value">{requerente.numero || '—'}</div>
              </div>

              <div className="detail-field">
                <div className="detail-field-label">Complemento</div>
                <div className="detail-field-value">{requerente.complemento || '—'}</div>
              </div>

              <div className="detail-field detail-field-full">
                <div className="detail-field-label">Bairro</div>
                <div className="detail-field-value">{requerente.bairro || '—'}</div>
              </div>

              <div className="detail-field">
                <div className="detail-field-label">Cidade</div>
                <div className="detail-field-value">{requerente.cidade || '—'}</div>
              </div>

              <div className="detail-field">
                <div className="detail-field-label">Estado</div>
                <div className="detail-field-value">{requerente.estado || '—'}</div>
              </div>

              <div className="detail-field detail-field-full">
                <div className="detail-field-label">CEP</div>
                <div className="detail-field-value">{requerente.cep || '—'}</div>
              </div>
            </div>


            {/* Representantes legais */}
            <div className="detail-section">
              <div className="detail-section-inner-header">
                <span className="detail-section-inner-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                <div className="detail-section-inner-title">Representantes legais</div>
              </div>

              {carregandoRepresentantes && (

                <div className="alert alert-info" style={{ padding: 10, margin: 0 }}>Carregando representantes...</div>
              )}

              {!carregandoRepresentantes && representantes.length === 0 && (
                <div className="alert alert-info" style={{ padding: 10, margin: 0 }}>Nenhum representante cadastrado.</div>
              )}

              {!carregandoRepresentantes && representantes.length > 0 && (
                <div className="detail-list">

                  {representantes.map((r, idx) => (
                    <div key={r.id ?? idx} className="detail-mini-card">
                      <div className="detail-mini-card-title">Representante {idx + 1}</div>
                      <div className="detail-fields-grid detail-fields-grid-mini">

                        <div className="detail-field">
                          <div className="detail-field-label">Nome</div>
                          <div className="detail-field-value">{r.nome || '—'}</div>
                        </div>
                        <div className="detail-field">
                          <div className="detail-field-label">CPF/CNPJ</div>
                          <div className="detail-field-value">
                            {r.cpfCnpj ? <span className="detail-chip primary">{r.cpfCnpj}</span> : '—'}
                          </div>
                        </div>
                        <div className="detail-field">
                          <div className="detail-field-label">Telefone</div>
                          <div className="detail-field-value">{r.telefone || '—'}</div>
                        </div>
                        <div className="detail-field">
                          <div className="detail-field-label">Email</div>
                          <div className="detail-field-value">{r.email || '—'}</div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Protocolos */}
            <div className="detail-section">
              <div className="detail-section-inner-header">
                <span className="detail-section-inner-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H12" />
                    <path d="M17 19H9.5a3.5 3.5 0 0 1 0-7H12" />
                  </svg>
                </span>
                <div className="detail-section-inner-title">Protocolos</div>
              </div>


              {carregandoProtocolos && (
                <div className="alert alert-info" style={{ padding: 10, margin: 0 }}>Carregando protocolos...</div>
              )}


              {!carregandoProtocolos && protocolos.length === 0 && (
                <div className="alert alert-info" style={{ padding: 10, margin: 0 }}>Nenhum protocolo encontrado para este requerente.</div>
              )}

              {!carregandoProtocolos && protocolos.length > 0 && (
                <div className="detail-list">

                  {protocolos.map((p, idx) => (
                    <div key={`${p.sistema ?? 's'}-${p.protocolo ?? idx}-${idx}`} className="detail-mini-card">
                      <div className="detail-mini-card-title">{p.sistema || 'Sistema'}</div>
                      <div className="detail-fields-grid detail-fields-grid-protocolos">

                        <div className="detail-field detail-field-full">
                          <div className="detail-field-label">Protocolo</div>
                          <div className="detail-field-value">{p.protocolo || '—'}</div>
                        </div>
                        <div className="detail-field">
                          <div className="detail-field-label">Data</div>
                          <div className="detail-field-value">{p.data || '—'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: 0, padding: 18 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/cadastros/requerentes`)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RequerenteDetalhe;

