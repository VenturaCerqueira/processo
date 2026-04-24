import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  cargo: { type: String, required: true },
  setor: { 
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
      'Divisão de Inspetoria de Obras e Postura Municipal',
      'Administrador'
    ]
  },
  nivelAcesso: { 
    type: String, 
    enum: ['admin', 'gestor', 'operador', 'visualizador'],
    default: 'operador'
  },
  ativo: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 10);
  next();
});

userSchema.methods.compararSenha = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};

export default mongoose.model('User', userSchema);

