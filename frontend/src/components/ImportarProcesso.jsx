import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const IconUpload = () => (
  <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const IconDocumento = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconSearch = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

function ImportarProcesso() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [tab, setTab] = useState('importar');
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Consulta
  const [processos, setProcessos] = useState([]);
  const [loadingLista, setLoadingLista] = useState(false);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);

  const carregarImportados = async (pag = 1) => {
    setLoadingLista(true);
    try {
      const params = new URLSearchParams({ pagina: pag, limite: 10 });
      if (busca) params.append('busca', busca);
      const { data } = await api.get(`/processos/importados?${params}`);
      setProcessos(data.processos || []);
      setTotalPaginas(data.totalPaginas || 1);
      setTotal(data.total || 0);
      setPagina(pag);
    } catch (error) {
      console.error('Erro ao carregar processos importados:', error);
    } finally {
      setLoadingLista(false);
    }
  };

  useEffect(() => {
    if (tab === 'consultar') {
      carregarImportados(1);
    }
  }, [tab, busca]);

  useEffect(() => {
    if (tab === 'consultar') {
      carregarImportados(pagina);
    }
  }, [pagina]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArquivo(file);
      setErro('');
      // Preview para imagens
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setArquivo(file);
      setErro('');
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleRemoveFile = () => {
    setArquivo(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatarTamanho = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!numeroProcesso.trim()) {
      setErro('Informe o número do processo antigo.');
      return;
    }

    if (!arquivo) {
      setErro('Anexe um documento referente ao processo.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('numeroProcesso', numeroProcesso.trim());
      formData.append('documento', arquivo);

      const response = await api.post('/processos/importar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const processoId = response.data.processo?.id;
      if (processoId) {
        navigate(`/processos/novo?importadoId=${processoId}`);
      } else {
        throw new Error('Processo criado, mas id não foi retornado.');
      }
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao importar processo.');
    } finally {
      setLoading(false);
    }
  };

  const tiposPermitidos = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt';

  return (
    <div className="page-content">
      <div className="breadcrumb">
        <Link to="/caixa-entrada">Caixa de Entrada</Link>
        <span>/</span>
        <span>Importar Processo</span>
      </div>

      <div className="form-hero">
        <div className="form-hero-icon">
          <IconUpload />
        </div>
        <div className="form-hero-content">
          <h1>Importar Processo Antigo</h1>
          <p>Anexe um documento e informe o número do processo antigo para criar um novo processo baseado nele.</p>
        </div>
      </div>

      {erro && <div className="alert alert-danger" style={{ marginBottom: 24 }}>{erro}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        <button
          className={tab === 'importar' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setTab('importar')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Importar
        </button>
        <button
          className={tab === 'consultar' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setTab('consultar')}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Consultar Importados
        </button>
      </div>

      {tab === 'importar' ? (

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Número do Processo */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">
                <IconDocumento />
              </div>
              <div>
                <div className="form-section-title">Número do Processo Antigo</div>
                <div className="form-section-description">Informe o número do processo que deseja importar</div>
              </div>
            </div>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Ex: 0001234-56.2024.8.12.0001"
                value={numeroProcesso}
                onChange={(e) => setNumeroProcesso(e.target.value)}
                maxLength="50"
              />
            </div>
          </div>

          {/* Upload do Documento */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-icon">
                <IconUpload />
              </div>
              <div>
                <div className="form-section-title">Documento Anexado</div>
                <div className="form-section-description">Anexe o documento do processo antigo (PDF, Word, imagem ou texto)</div>
              </div>
            </div>

            {!arquivo ? (
              <div
                className={`upload-zone ${dragOver ? 'upload-zone-active' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={tiposPermitidos}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <div className="upload-zone-icon">
                  <IconUpload />
                </div>
                <p className="upload-zone-text">
                  <strong>Clique para escolher</strong> ou arraste o arquivo aqui
                </p>
                <p className="upload-zone-hint">
                  Formatos: PDF, DOC, DOCX, JPG, PNG, TXT (máx. 10MB)
                </p>
              </div>
            ) : (
              <div className="file-preview-card">
                {preview && (
                  <div className="file-preview-image">
                    <img src={preview} alt="Preview" />
                  </div>
                )}
                <div className="file-preview-info">
                  <div className="file-preview-icon">
                    <IconDocumento />
                  </div>
                  <div className="file-preview-details">
                    <div className="file-preview-name">{arquivo.name}</div>
                    <div className="file-preview-size">{formatarTamanho(arquivo.size)}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="file-preview-remove"
                  onClick={handleRemoveFile}
                  title="Remover arquivo"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="alert alert-info" style={{ marginBottom: 24 }}>
            <strong>Como funciona:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
              <li>O sistema cria um novo processo com o documento anexado</li>
              <li>Após a importação, você será direcionado para completar os dados do processo</li>
              <li>O número do processo antigo será salvo como referência</li>
            </ul>
          </div>

          <div className="form-actions">
            <Link to="/caixa-entrada" className="btn btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Importando...
                </>
              ) : (
                <>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Importar Processo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      ) : (
      /* Consultar processos importados */
      <div>
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por número, assunto ou requerente..."
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
                style={{ paddingLeft: 40 }}
              />
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}>
                <IconSearch />
              </span>
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              {total} processo{total !== 1 ? 's' : ''} importado{total !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {loadingLista ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            <p style={{ marginTop: 12 }}>Carregando...</p>
          </div>
        ) : processos.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto 16px', opacity: 0.4 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Nenhum processo importado</p>
            <p style={{ fontSize: 13 }}>Importe um processo antigo para vê-lo aqui.</p>
          </div>
        ) : (
          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Número</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Assunto</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Requerente</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Responsável</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Data</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {processos.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 600 }}>{p.numero}</td>
                    <td style={{ padding: '12px 14px', fontSize: 14, color: 'var(--text-secondary)' }}>{p.assunto}</td>
                    <td style={{ padding: '12px 14px', fontSize: 14 }}>{p.requerente || '—'}</td>
                    <td style={{ padding: '12px 14px', fontSize: 14, color: 'var(--text-secondary)' }}>{p.responsavelNome || '—'}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: '6px 14px' }}
                        onClick={() => navigate(`/processos/novo?importadoId=${p.id}`)}
                      >
                        Complementar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                <button
                  className="btn btn-secondary"
                  disabled={pagina === 1}
                  onClick={() => setPagina(p => p - 1)}
                  style={{ fontSize: 13 }}
                >
                  « Anterior
                </button>
                <span style={{ lineHeight: '36px', fontSize: 13, color: 'var(--text-secondary)' }}>
                  {pagina} / {totalPaginas}
                </span>
                <button
                  className="btn btn-secondary"
                  disabled={pagina === totalPaginas}
                  onClick={() => setPagina(p => p + 1)}
                  style={{ fontSize: 13 }}
                >
                  Próxima »
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  );
}

export default ImportarProcesso;
