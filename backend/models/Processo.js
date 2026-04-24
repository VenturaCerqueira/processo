import mongoose from 'mongoose';

const movimentacaoSchema = new mongoose.Schema({
  de: { type: String, required: true },
  para: { type: String, required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parecer: { type: String },
  data: { type: Date, default: Date.now }
});

const documentoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  tipo: { type: String, required: true },
  caminho: { type: String, required: true },
  tamanho: { type: Number },
  versao: { type: Number, default: 1 },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dataUpload: { type: Date, default: Date.now }
});

const processoSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true },
  tipo: { 
    type: String, 
    required: true,
    enum: [
      '01 - Cadastro Fiscal Municipal',
      '02 - Parcelamento do Solo',
      '03 - Edificação e Postura',
      '04 - Cadastro Fiscal Imobiliário',
      '05 - Transmissão Imobiliária',
      '06 - Transporte de Passageiros',
      '07 - Atividade em Logradouro Público',
      '08 - Publicidade',
      '09 - Administrativo Tributário',
      '10 - Administrativo Fiscal',
      '11 - Diversos'
    ]
  },
  assunto: { type: String, required: true },
  requerente: { type: String, required: true },
  cpfCnpj: { type: String },
  endereco: { type: String },
  telefone: { type: String },
  email: { type: String },
  descricao: { type: String },
  setorAtual: { 
    type: String, 
    required: true,
    enum: [
      'Gabinete do Secretário',
      'Assessoria Jurídica',
      'Assessoria Técnica',
      'Divisão de Expediente de Processos',
      'Divisão de Controle e Registro de Documentos',
      'Divisão de Gestão de Tecnologia da Informação',
      'Setor de Informática e Digitalização',
      'Coordenação da Fazenda Municipal',
      'Divisão Administração Tributária',
      'Divisão de Cadastro Fiscal',
      'Setor de Cadastramento Urbano',
      'Setor de Cadastramento Rural',
      'Divisão de Controle Urbano',
      'Fiscalização do Ordenamento Uso do Solo',
      'Divisão de Inspetoria de Obras e Postura Municipal'
    ]
  },
  usuarioResponsavel: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['tramitando', 'aguardando', 'concluido', 'arquivado'],
    default: 'tramitando'
  },
  prioridade: {
    type: String,
    enum: ['baixa', 'normal', 'alta', 'urgente'],
    default: 'normal'
  },
  prazo: { type: Date },
  dataRecebimento: { type: Date, default: Date.now },
  dataConclusao: { type: Date },
  movimentacoes: [movimentacaoSchema],
  documentos: [documentoSchema],
  observacoes: [{ 
    texto: String, 
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    data: { type: Date, default: Date.now }
  }],
  integracoesExternas: [{
    sistema: String,
    protocolo: String,
    data: { type: Date, default: Date.now }
  }],
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

processoSchema.pre('save', function(next) {
  if (!this.numero) {
    const ano = new Date().getFullYear();
    const sequencial = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    this.numero = `${ano}.${sequencial}`;
  }
  next();
});

export default mongoose.model('Processo', processoSchema);

