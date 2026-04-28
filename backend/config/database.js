import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
};

async function createDatabaseIfNotExists() {
  const tempPool = mysql.createPool({ ...config });
  try {
    const database = process.env.MYSQL_DATABASE || 'processo_eletronico';
    await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Banco de dados '${database}' verificado/criado.`);
  } catch (error) {
    console.error('Erro ao criar banco de dados:', error.message);
    throw error;
  } finally {
    await tempPool.end();
  }
}

const pool = mysql.createPool({
  ...config,
  database: process.env.MYSQL_DATABASE || 'processo_eletronico'
});

export async function initDatabase() {
  await createDatabaseIfNotExists();

  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        cargo VARCHAR(255) NOT NULL,
        setor VARCHAR(255) NOT NULL,
        nivelAcesso VARCHAR(50) DEFAULT 'operador',
        ativo TINYINT DEFAULT 1,
        primeiroAcesso TINYINT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    try {
      await connection.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS primeiroAcesso TINYINT DEFAULT 0`);
    } catch {
      // Coluna já existe ou erro não crítico
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS processos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numero VARCHAR(50) UNIQUE NOT NULL,
        tipo VARCHAR(255) NOT NULL,
        assunto VARCHAR(500) NOT NULL,
        requerente VARCHAR(255) NOT NULL,
        cpfCnpj VARCHAR(20),
        endereco VARCHAR(500),
        telefone VARCHAR(50),
        email VARCHAR(255),
        descricao TEXT,
        setorAtual VARCHAR(255) NOT NULL,
        usuarioResponsavel INT,
        status VARCHAR(50) DEFAULT 'tramitando',
        situacao VARCHAR(50) DEFAULT 'novo',
        prioridade VARCHAR(50) DEFAULT 'normal',
        prazo DATE,
        dataRecebimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        dataConclusao DATE,
        criadoPor INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (criadoPor) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Adicionar coluna situacao se nao existir
    try {
      await connection.query(`ALTER TABLE processos ADD COLUMN situacao VARCHAR(50) DEFAULT 'novo'`);
    } catch {
      // Coluna ja existe ou erro nao critico
    }

    // Adicionar FK de usuarioResponsavel se nao existir
    try {
      await connection.query(`ALTER TABLE processos ADD CONSTRAINT fk_processo_usuario_resp FOREIGN KEY (usuarioResponsavel) REFERENCES users(id)`);
    } catch {
      // Constraint ja existe ou erro nao critico
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS movimentacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        processoId INT NOT NULL,
        de VARCHAR(255) NOT NULL,
        para VARCHAR(255) NOT NULL,
        usuario INT NOT NULL,
        usuarioDestino INT,
        parecer TEXT,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (processoId) REFERENCES processos(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    try {
      await connection.query(`ALTER TABLE movimentacoes ADD COLUMN usuarioDestino INT NULL`);
    } catch {
      // Coluna ja existe ou erro nao critico
    }

    try {
      await connection.query(`ALTER TABLE movimentacoes ADD CONSTRAINT fk_mov_usuario_destino FOREIGN KEY (usuarioDestino) REFERENCES users(id)`);
    } catch {
      // Constraint ja existe ou erro nao critico
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS documentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        processoId INT NOT NULL,
        nome VARCHAR(255) NOT NULL,
        tipo VARCHAR(100) NOT NULL,
        caminho VARCHAR(500) NOT NULL,
        tamanho INT,
        versao INT DEFAULT 1,
        usuario INT NOT NULL,
        dataUpload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (processoId) REFERENCES processos(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS observacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        processoId INT NOT NULL,
        texto TEXT NOT NULL,
        usuario INT NOT NULL,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (processoId) REFERENCES processos(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS integracoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        processoId INT NOT NULL,
        sistema VARCHAR(255) NOT NULL,
        protocolo VARCHAR(255),
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (processoId) REFERENCES processos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS recuperacao_senha (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        usado TINYINT DEFAULT 0,
        expiraEm TIMESTAMP NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS niveis_acesso (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao VARCHAR(255),
        permissoes JSON,
        ativo TINYINT DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS tipos_processo (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        codigo VARCHAR(50),
        ativo TINYINT DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS setores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        sigla VARCHAR(50),
        ativo TINYINT DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS prioridades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        nivel INT DEFAULT 0,
        cor VARCHAR(20),
        ativo TINYINT DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS entidades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        database_name VARCHAR(100),
        username VARCHAR(100),
        host VARCHAR(255),
        port VARCHAR(10),
        ativo TINYINT DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS especies_processo (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        tipo_processo_id INT,
        setor_id INT,
        prazo_minimo INT,
        prazo_maximo INT,
        dias_uteis TINYINT DEFAULT 0,
        mensagem_customizada TEXT,
        ativo TINYINT DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tipo_processo_id) REFERENCES tipos_processo(id),
        FOREIGN KEY (setor_id) REFERENCES setores(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Adicionar especie_id na tabela processos se nao existir
    try {
      await connection.query(`ALTER TABLE processos ADD COLUMN especie_id INT NULL`);
    } catch {
      // Coluna ja existe ou erro nao critico
    }

    try {
      await connection.query(`ALTER TABLE processos ADD CONSTRAINT fk_processo_especie FOREIGN KEY (especie_id) REFERENCES especies_processo(id)`);
    } catch {
      // Constraint ja existe ou erro nao critico
    }

    // Adicionar processoPaiId na tabela processos se nao existir
    try {
      await connection.query(`ALTER TABLE processos ADD COLUMN processoPaiId INT NULL`);
    } catch {
      // Coluna ja existe ou erro nao critico
    }

    try {
      await connection.query(`ALTER TABLE processos ADD CONSTRAINT fk_processo_pai FOREIGN KEY (processoPaiId) REFERENCES processos(id)`);
    } catch {
      // Constraint ja existe ou erro nao critico
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS requerentes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cpfCnpj VARCHAR(20),
        tipoPessoa VARCHAR(20) DEFAULT 'fisica',
        endereco VARCHAR(500),
        numero VARCHAR(20),
        complemento VARCHAR(100),
        bairro VARCHAR(100),
        cidade VARCHAR(100),
        estado VARCHAR(2),
        cep VARCHAR(20),
        telefone VARCHAR(50),
        email VARCHAR(255),
        ativo TINYINT DEFAULT 1,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS notificacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuarioId INT NOT NULL,
        processoId INT,
        titulo VARCHAR(255) NOT NULL,
        mensagem TEXT,
        tipo VARCHAR(50) DEFAULT 'info',
        prioridade VARCHAR(50) DEFAULT 'normal',
        lida TINYINT DEFAULT 0,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuarioId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (processoId) REFERENCES processos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS favoritos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuarioId INT NOT NULL,
        processoId INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_favorito (usuarioId, processoId),
        FOREIGN KEY (usuarioId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (processoId) REFERENCES processos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS historico (
        id INT AUTO_INCREMENT PRIMARY KEY,
        processoId INT NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        descricao TEXT NOT NULL,
        usuario INT NOT NULL,
        metadata JSON,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (processoId) REFERENCES processos(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    try {
      await connection.query(`ALTER TABLE notificacoes ADD COLUMN prioridade VARCHAR(50) DEFAULT 'normal'`);
    } catch {
      // Coluna ja existe ou erro nao critico
    }

    try {
      await connection.query('RENAME TABLE contribuintes TO requerentes');
      console.log('Tabela contribuintes renomeada para requerentes.');
    } catch {
      // Tabela ja renomeada ou nao existe
    }

    // Inserir dados padrao caso as tabelas estejam vazias
    const [tiposCount] = await connection.query('SELECT COUNT(*) as count FROM tipos_processo');
    if (tiposCount[0].count === 0) {
      await connection.query(`
        INSERT INTO tipos_processo (nome, codigo) VALUES
        ('01 - Cadastro Fiscal Municipal', '01'),
        ('02 - Parcelamento do Solo', '02'),
        ('03 - Edificacao e Postura', '03'),
        ('04 - Cadastro Fiscal Imobiliario', '04'),
        ('05 - Transmissao Imobiliaria', '05'),
        ('06 - Transporte de Passageiros', '06'),
        ('07 - Atividade em Logradouro Publico', '07'),
        ('08 - Publicidade', '08'),
        ('09 - Administrativo Tributario', '09'),
        ('10 - Administrativo Fiscal', '10'),
        ('11 - Diversos', '11');
      `);
    }

    const [setoresCount] = await connection.query('SELECT COUNT(*) as count FROM setores');
    if (setoresCount[0].count === 0) {
      await connection.query(`
        INSERT INTO setores (nome, sigla) VALUES
        ('Gabinete do Secretario', 'GAB'),
        ('Assessoria Juridica', 'ASJUR'),
        ('Assessoria Tecnica', 'ASTEC'),
        ('Divisao de Expediente de Processos', 'DEP'),
        ('Divisao de Controle e Registro de Documentos', 'DCRD'),
        ('Divisao de Gestao de Tecnologia da Informacao', 'DGTI'),
        ('Setor de Informatica e Digitalizacao', 'SID'),
        ('Coordenacao da Fazenda Municipal', 'CFM'),
        ('Divisao Administracao Tributaria', 'DAT'),
        ('Divisao de Cadastro Fiscal', 'DCF'),
        ('Setor de Cadastramento Urbano', 'SCU'),
        ('Setor de Cadastramento Rural', 'SCR'),
        ('Divisao de Controle Urbano', 'DCU'),
        ('Fiscalizacao do Ordenamento Uso do Solo', 'FOUS'),
        ('Divisao de Inspetoria de Obras e Postura Municipal', 'DIOPM');
      `);
    }

    const [prioridadesCount] = await connection.query('SELECT COUNT(*) as count FROM prioridades');
    if (prioridadesCount[0].count === 0) {
      await connection.query(`
        INSERT INTO prioridades (nome, nivel, cor) VALUES
        ('baixa', 1, '#94a3b8'),
        ('normal', 2, '#2563eb'),
        ('alta', 3, '#d97706'),
        ('urgente', 4, '#dc2626');
      `);
    }

    const [niveisCount] = await connection.query('SELECT COUNT(*) as count FROM niveis_acesso');
    if (niveisCount[0].count === 0) {
      await connection.query(`
        INSERT INTO niveis_acesso (nome, descricao, permissoes) VALUES
        ('admin', 'Administrador - Acesso total ao sistema.', '{"dashboard":true,"processos_ver":true,"processos_criar":true,"processos_editar":true,"processos_excluir":true,"relatorios_ver":true,"relatorios_gerar":true,"cadastros_ver":true,"cadastros_editar":true,"usuarios_ver":true,"usuarios_editar":true,"configuracoes_ver":true}'),
        ('gestor', 'Gestor - Pode gerenciar processos, cadastros e usuários.', '{"dashboard":true,"processos_ver":true,"processos_criar":true,"processos_editar":true,"processos_excluir":false,"relatorios_ver":true,"relatorios_gerar":true,"cadastros_ver":true,"cadastros_editar":true,"usuarios_ver":true,"usuarios_editar":true,"configuracoes_ver":false}'),
        ('operador', 'Operador - Pode criar e editar processos.', '{"dashboard":true,"processos_ver":true,"processos_criar":true,"processos_editar":true,"processos_excluir":false,"relatorios_ver":true,"relatorios_gerar":false,"cadastros_ver":true,"cadastros_editar":false,"usuarios_ver":false,"usuarios_editar":false,"configuracoes_ver":false}'),
        ('visualizador', 'Visualizador - Apenas visualização de processos e relatórios.', '{"dashboard":true,"processos_ver":true,"processos_criar":false,"processos_editar":false,"processos_excluir":false,"relatorios_ver":true,"relatorios_gerar":false,"cadastros_ver":true,"cadastros_editar":false,"usuarios_ver":false,"usuarios_editar":false,"configuracoes_ver":false}');
      `);
    }

    console.log('MySQL: Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar MySQL:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

export default pool;

