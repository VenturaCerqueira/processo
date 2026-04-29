import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function RequerenteCadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: '',
    cpfCnpj: '',
    tipoPessoa: 'fisica',
    email: '',
    senha: '',
    telefone: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: ''
  });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const formatarCpfCnpj = (value) => {
    value = value.replace(/\D/g, '');
    if (form.tipoPessoa === 'fisica' && value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2}\.\d{3})(\d)/, '$1.$2');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.senha.length < 6) {
      setErro('Senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    setErro('');
    try {
      await api.post('/requerente/auth/registrar', form);
      alert('Cadastro realizado! Você pode fazer login.');
      navigate('/requerente/login');
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao cadastrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2>Cadastro - Área do Requerente</h2>
        <h3>Crie sua conta para acompanhar seus processos</h3>
        
        {erro && <div className="alert alert-danger">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nome Completo *</label>
              <input name="nome" type="text" className="form-control" value={form.nome} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Senha *</label>
              <input name="senha" type="password" className="form-control" value={form.senha} onChange={handleChange} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input name="telefone" type="tel" className="form-control" value={form.telefone} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Tipo Pessoa</label>
              <select name="tipoPessoa" className="form-control" value={form.tipoPessoa} onChange={handleChange}>
                <option value="fisica">Física</option>
                <option value="juridica">Jurídica</option>
              </select>
            </div>
            <div className="form-group">
              <label>CPF/CNPJ *</label>
              <input name="cpfCnpj" type="text" className="form-control" value={form.cpfCnpj} onChange={(e) => handleChange({ target: { name: 'cpfCnpj', value: formatarCpfCnpj(e.target.value) } })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Endereço</label>
              <input name="endereco" type="text" className="form-control" value={form.endereco} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Número</label>
              <input name="numero" type="text" className="form-control" value={form.numero} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Bairro</label>
              <input name="bairro" type="text" className="form-control" value={form.bairro} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Cidade</label>
              <input name="cidade" type="text" className="form-control" value={form.cidade} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Estado</label>
              <select name="estado" className="form-control" value={form.estado} onChange={handleChange}>
                <option value="">Selecione</option>
                <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option><option value="AM">AM</option>
                <option value="BA">BA</option><option value="CE">CE</option><option value="DF">DF</option><option value="ES">ES</option>
                <option value="GO">GO</option><option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option>
                <option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option><option value="PR">PR</option>
                <option value="PE">PE</option><option value="PI">PI</option><option value="RJ">RJ</option><option value="RN">RN</option>
                <option value="RS">RS</option><option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option>
                <option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
              </select>
            </div>
            <div className="form-group">
              <label>CEP</label>
              <input name="cep" type="text" className="form-control" value={form.cep} onChange={handleChange} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Criar Conta'}
          </button>
        </form>

        <div className="login-actions">
          <Link to="/requerente/login" className="btn btn-secondary">
            Já tenho conta
          </Link>
          <Link to="/" className="btn btn-secondary">
            Área do Servidor
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RequerenteCadastro;

