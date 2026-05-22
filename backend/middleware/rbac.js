import pool from '../config/database.js';

/**
 * Middleware de controle de acesso baseado em permissões (RBAC)
 *
 * Mapa de permissões por nível de acesso:
 *
 * admin:  Acesso total ao sistema
 * gestor: Pode gerenciar processos, cadastros e usuários (exceto exclusões e configurações)
 * operador: Pode criar e editar processos
 * visualizador: Apenas visualização
 */

// Mapeamento de nível -> permissões padrão (fallback se não encontrar no banco)
const defaultPermissions = {
  admin: {
    dashboard: true,
    processos_ver: true, processos_criar: true, processos_editar: true, processos_excluir: true,
    relatorios_ver: true, relatorios_gerar: true,
    cadastros_ver: true, cadastros_editar: true,
    usuarios_ver: true, usuarios_editar: true,
    configuracoes_ver: true, configuracoes_editar: true,
    especies_ver: true, especies_editar: true,
    entidades_ver: true, entidades_editar: true,
    niveis_ver: true, niveis_editar: true
  },
  gestor: {
    dashboard: true,
    processos_ver: true, processos_criar: true, processos_editar: true, processos_excluir: false,
    relatorios_ver: true, relatorios_gerar: true,
    cadastros_ver: true, cadastros_editar: true,
    usuarios_ver: true, usuarios_editar: true,
    configuracoes_ver: true, configuracoes_editar: false,
    especies_ver: true, especies_editar: false,
    entidades_ver: true, entidades_editar: false,
    niveis_ver: true, niveis_editar: false
  },
  operador: {
    dashboard: true,
    processos_ver: true, processos_criar: true, processos_editar: true, processos_excluir: false,
    relatorios_ver: true, relatorios_gerar: false,
    cadastros_ver: true, cadastros_editar: false,
    usuarios_ver: false, usuarios_editar: false,
    configuracoes_ver: false, configuracoes_editar: false,
    especies_ver: true, especies_editar: false,
    entidades_ver: false, entidades_editar: false,
    niveis_ver: false, niveis_editar: false
  },
  visualizador: {
    dashboard: true,
    processos_ver: true, processos_criar: false, processos_editar: false, processos_excluir: false,
    relatorios_ver: true, relatorios_gerar: false,
    cadastros_ver: true, cadastros_editar: false,
    usuarios_ver: false, usuarios_editar: false,
    configuracoes_ver: false, configuracoes_editar: false,
    especies_ver: true, especies_editar: false,
    entidades_ver: false, entidades_editar: false,
    niveis_ver: false, niveis_editar: false
  }
};

// Cache de permissões ( invalidate a cada 5 minutos )
let permissionsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Carrega permissões do banco ou usa padrão
 */
async function loadPermissions() {
  const now = Date.now();
  if (permissionsCache && (now - cacheTimestamp) < CACHE_TTL) {
    return permissionsCache;
  }

  try {
    const [rows] = await pool.query('SELECT nome, permissoes FROM niveis_acesso WHERE ativo = 1');
    const loaded = {};
    for (const row of rows) {
      try {
        loaded[row.nome] = JSON.parse(row.permissoes);
      } catch {
        loaded[row.nome] = defaultPermissions[row.nome] || {};
      }
    }
    // Preencher com padrões os níveis que não têm permissões customizadas
    for (const [nivel, perms] of Object.entries(defaultPermissions)) {
      if (!loaded[nivel]) {
        loaded[nivel] = perms;
      }
    }
    permissionsCache = loaded;
    cacheTimestamp = now;
    return loaded;
  } catch (error) {
    // Se falhar, usa padrões
    return defaultPermissions;
  }
}

/**
 * Middleware para verificar permissão específica
 * @param {string} permission - Nome da permissão (ex: 'processos_criar')
 */
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const permissions = await loadPermissions();
      const nivelAcesso = req.user?.nivelAcesso;

      if (!nivelAcesso) {
        return res.status(403).json({ message: 'Nível de acesso não definido.' });
      }

      // Admin sempre tem acesso
      if (nivelAcesso === 'admin') {
        return next();
      }

      const nivelPerms = permissions[nivelAcesso];
      if (!nivelPerms) {
        return res.status(403).json({ message: `Nível de acesso '${nivelAcesso}' não reconhecido.` });
      }

      if (!nivelPerms[permission]) {
        return res.status(403).json({
          message: `Sem permissão para esta ação. Permissão requerida: ${permission}`
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Erro ao verificar permissões.' });
    }
  };
};

/**
 * Middleware para verificar pelo menos UMA das permissões informadas
 * @param {...string} permissions - Lista de permissões (qualquer uma serve)
 */
export const requireAnyPermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      const permissoes = await loadPermissions();
      const nivelAcesso = req.user?.nivelAcesso;

      if (!nivelAcesso) {
        return res.status(403).json({ message: 'Nível de acesso não definido.' });
      }

      if (nivelAcesso === 'admin') {
        return next();
      }

      const nivelPerms = permissoes[nivelAcesso];
      if (!nivelPerms) {
        return res.status(403).json({ message: `Nível de acesso '${nivelAcesso}' não reconhecido.` });
      }

      const hasAny = permissions.some(p => nivelPerms[p]);
      if (!hasAny) {
        return res.status(403).json({
          message: `Sem permissão para esta ação. Precisa de uma destas: ${permissions.join(', ')}`
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Erro ao verificar permissões.' });
    }
  };
};

/**
 * Middleware para verificar TODAS as permissões informadas
 * @param {...string} permissions - Lista de permissões (todas necessárias)
 */
export const requireAllPermissions = (...permissions) => {
  return async (req, res, next) => {
    try {
      const permissoes = await loadPermissions();
      const nivelAcesso = req.user?.nivelAcesso;

      if (!nivelAcesso) {
        return res.status(403).json({ message: 'Nível de acesso não definido.' });
      }

      if (nivelAcesso === 'admin') {
        return next();
      }

      const nivelPerms = permissoes[nivelAcesso];
      if (!nivelPerms) {
        return res.status(403).json({ message: `Nível de acesso '${nivelAcesso}' não reconhecido.` });
      }

      const hasAll = permissions.every(p => nivelPerms[p]);
      if (!hasAll) {
        return res.status(403).json({
          message: `Sem permissão para esta ação. Precisa de todas estas: ${permissions.join(', ')}`
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Erro ao verificar permissões.' });
    }
  };
};

/**
 * Helper para invalidar cache (útil quando permissões são atualizadas)
 */
export const invalidatePermissionsCache = () => {
  permissionsCache = null;
  cacheTimestamp = 0;
};