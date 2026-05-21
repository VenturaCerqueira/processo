# 📊 Sistema de Logging do Projeto

## Visão Geral

O projeto utiliza **Winston** para logging estruturado em produção. Todos os eventos críticos, erros e requisições HTTP são registrados com contexto completo.

## Arquitetura

### Configuração (`backend/config/logger.js`)

- **Níveis de Log**: error, warn, info, http, debug
- **Rotação de Logs**: Diária com retenção configurável
- **Formato**: Timestamp, nível, mensagem, stack trace e dados contextuais em JSON

### Transports (Armazenamento)

1. **error-%DATE%.log** - Apenas erros (14 dias)
2. **combined-%DATE%.log** - Todos os níveis (14 dias)
3. **http-%DATE%.log** - Requisições HTTP (7 dias)
4. **Console** - Em desenvolvimento apenas

## Estrutura de Logs

### Exemplo de Log de Login

```json
{
  "timestamp": "2026-05-21 14:30:45",
  "level": "INFO",
  "message": "Login bem-sucedido: user@example.com",
  "email": "user@example.com",
  "userId": 123,
  "cargo": "analista",
  "setor": "protocolo",
  "nivelAcesso": "operador",
  "ip": "192.168.1.100"
}
```

### Exemplo de Log de Erro

```json
{
  "timestamp": "2026-05-21 14:30:45",
  "level": "ERROR",
  "message": "Erro ao criar novo processo",
  "error": "..stack trace aqui...",
  "usuarioId": 123,
  "body": {...}
}
```

### Exemplo de Log HTTP

```json
{
  "timestamp": "2026-05-21 14:30:45",
  "level": "HTTP",
  "message": "POST /api/processos - 201",
  "method": "POST",
  "url": "/api/processos",
  "statusCode": 201,
  "duration": "145ms",
  "userId": "[User: 123]",
  "ip": "192.168.1.100"
}
```

## Eventos Logados

### Autenticação (`authController.js`)
- ✅ Login bem-sucedido (email, cargo, setor, IP)
- ⚠️ Tentativa de login com email não encontrado
- ⚠️ Tentativa de login com senha incorreta
- ⚠️ Conta pendente de ativação
- ❌ Erros de autenticação

### Processos (`processoController.js`)
- ✅ Novo processo criado (número, tipo, assunto, setor)
- ✅ Processo encaminhado (origem, destino, responsável)
- ❌ Erros ao criar/encaminhar processos

### Uploads (`uploadController.js`)
- ✅ Documento enviado (nome, tipo, tamanho, versão)
- ⚠️ Tipo de arquivo não permitido
- ⚠️ Tentativa de upload em processo inexistente
- ❌ Erros durante upload

### Requisições HTTP (`middleware/logger.js`)
- Todos os requests/responses (método, URL, status, duração)
- Filtro automático: errors logados como WARN, success como INFO

## Usando o Logger em Novo Código

### Importar

```javascript
import logger from '../config/logger.js';
```

### Logging Básico

```javascript
// Info
logger.info('Operação realizada', { 
  usuarioId: user.id, 
  dados: {...}
});

// Aviso
logger.warn('Algo anormal aconteceu', { 
  email: 'user@example.com',
  tentativas: 5
});

// Erro
logger.error('Erro crítico', { 
  error: error.stack,
  userId: user?.id
});

// Debug (apenas em desenvolvimento)
logger.debug('Detalhes técnicos', { 
  query: sql,
  params: [...]
});
```

## Acessando os Logs

### Localização

```
backend/logs/
├── error-2026-05-21.log       # Apenas erros
├── combined-2026-05-21.log    # Todos os eventos
└── http-2026-05-21.log        # Requisições HTTP
```

### Comandos Úteis

```bash
# Ver últimas 50 linhas de erro
tail -50 logs/error-*.log

# Filtrar erros de um usuário específico
grep "userId.*123" logs/error-*.log

# Contar eventos por tipo
grep "\[INFO\]" logs/combined-*.log | wc -l

# Monitorar em tempo real
tail -f logs/combined-*.log
```

## Variáveis de Ambiente

```bash
# Nível de log (error, warn, info, http, debug)
LOG_LEVEL=info

# Ambiente (development/production)
NODE_ENV=production
```

Em **development**: Logs também aparecem no console.
Em **production**: Apenas arquivos (sem poluição de console).

## Limitações Atuais

1. ⚠️ Não loga queries SQL (para evitar sensibilidade)
2. ⚠️ Não loga conteúdo de request/response completo
3. ⚠️ Senhas/tokens não são removidos do log (adicionar sanitização)

## Melhorias Futuras

- [ ] Integração com ELK Stack (Elasticsearch, Logstash, Kibana)
- [ ] Dashboard visual de logs
- [ ] Alertas automáticos para erros críticos
- [ ] Análise de performance por endpoint
- [ ] Rastreamento distribuído (tracing)

---

**Última atualização:** 21/05/2026
