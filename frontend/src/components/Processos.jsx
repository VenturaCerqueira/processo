import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Processos() {
  const [processos, setProcessos] = useState([]);
  const [filtros, setFiltros] = useState({ busca: '', status: '', tipo: '', setor: '' });
  const [loading, setLoading] = useState(true);
  const [tipos, setTipos] = useState([]);
  const [setores, setSetores] = useState([]);

  useEffect(() => {
    carregarProcessos();
    async function carregarOpcoes() {
      try {
        const [tRes, sRes] = await Promise.all([api.get('/tipos-processo'), api.get('/setores')]);
        setTipos(tRes.data);
        setSetores(sRes.data);
      } catch (error) { console.error('Erro ao carregar opcoes:', error); }
    }
    carregarOpcoes();
  }, []);

  const carregarProcessos = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.status) params.append('status', filtros.status);
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.setor) params.append('setor', filtros.setor);
      if (filtros.busca) params.append('busca', filtros.busca);
      const response = await api.get(`/processos?${params}`);
      setProcessos(response.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleBuscar = (e) => { e.preventDefault(); carregarProcessos(); };
  const handleLimpar = () => { setFiltros({ busca: '', status: '', tipo: '', setor: '' }); setTimeout(carregarProcessos, 0); };

  if (loading) return <div className="loading"><span className="spinner" />Carregando...</div>;

  return (
    <div className="page-content">
      <div className="top-bar">
        <h2>Controle de Processos</h2>
        <Link to="/processos/novo" className="btn btn-primary">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Novo Processo
        </Link>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={handleBuscar}>
          <div className="search-box">
            <input type="text" className="form-control" placeholder="Buscar por número, requerente ou assunto..."
              value={filtros.busca} onChange={e => setFiltros({...filtros, busca: e.target.value})} />
            <button type="submit" className="btn btn-primary">Buscar</button>
            <button type="button" className="btn btn-secondary" onClick={handleLimpar}>Limpar</button>
          </div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <select className="form-control" value={filtros.status} onChange={e => setFiltros({...filtros, status: e.target.value})}>
              <option value="">Todos os Status</option>
              <option value="tramitando">Tramitando</option>
              <option value="aguardando">Aguardando</option>
              <option value="concluido">Concluído</option>
              <option value="arquivado">Arquivado</option>
              <option value="indeferido">Indeferido</option>
            </select>
            <select className="form-control" value={filtros.tipo} onChange={e => setFiltros({...filtros, tipo: e.target.value})}>
              <option value="">Todos os Tipos</option>
              {tipos.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
            </select>
            <select className="form-control" value={filtros.setor} onChange={e => setFiltros({...filtros, setor: e.target.value})}>
              <option value="">Todos os Setores</option>
              {setores.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
            </select>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Número</th><th>Tipo</th><th>Assunto</th><th>Requerente</th><th>Status</th><th>Prioridade</th><th>Setor Atual</th><th>Data</th>
              </tr>
            </thead>
            <tbody>
              {processos.length === 0 ? (
                <tr><td colSpan="8">
                  <div className="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <h4>Nenhum processo encontrado</h4>
                    <p>Ajuste os filtros ou cadastre um novo processo</p>
                  </div>
                </td></tr>
              ) : processos.map(p => (
                <tr key={p.id}>
                  <td><Link to={`/processos/${p.id}`} className="table-link">{p.numero}</Link></td>
                  <td>{p.tipo}</td>
                  <td>{p.assunto}</td>
                  <td>{p.requerente}</td>
                  <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                  <td className={`priority-${p.prioridade}`}>{p.prioridade}</td>
                  <td>{p.setorAtual}</td>
                  <td>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Processos;

