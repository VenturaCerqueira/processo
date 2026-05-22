import pool from '../config/database.js';
import { criarNotificacao } from '../controllers/notificacaoController.js';

// Título padronizado para notificações de prazo
export const AVISO_TITULO_PRAZO = '[PRAZO] Próximo do vencimento';

function toISODate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isFinalSituacao(situacao) {
  const finals = new Set([
    'arquivado',
    'indeferido',
    'concluido',
    'excluido',
    'deferido',
  ]);
  return finals.has(String(situacao || '').toLowerCase());
}

export async function enviarAlertasPrazosAproximando({ diasAntecedencia = 2 } = {}) {
  // Aviso baseado em diferença de datas no formato DATE do MySQL (sem hora)
  const agora = new Date();
  const hojeISO = toISODate(agora);
  const limite = new Date(agora);
  limite.setDate(limite.getDate() + Number(diasAntecedencia || 0));
  const limiteISO = toISODate(limite);

  // Só processos com prazo válido e que ainda não estejam em situação final
  // Observação: como situacao é texto, filtramos parcialmente e depois garantimos com isFinalSituacao.
  const [rows] = await pool.query(
    `SELECT p.id, p.numero, p.prazo, p.situacao, p.usuarioResponsavel, u.nome as usuarioResponsavelNome
     FROM processos p
     LEFT JOIN users u ON u.id = p.usuarioResponsavel
     WHERE p.prazo IS NOT NULL
       AND p.prazo >= ?
       AND p.prazo <= ?
     ORDER BY p.prazo ASC, p.id ASC`,
    [hojeISO, limiteISO],
  );

  for (const p of rows) {
    if (isFinalSituacao(p.situacao)) continue;
    if (!p.usuarioResponsavel) continue; // regra: avisar apenas quem está no usuarioResponsavel

    // Anti-spam: evita repetir notificação para o mesmo processo.
    const [existing] = await pool.query(
      `SELECT id
       FROM notificacoes
       WHERE usuarioId = ?
         AND processoId = ?
         AND titulo = ?
       LIMIT 1`,
      [p.usuarioResponsavel, p.id, AVISO_TITULO_PRAZO],
    );

    if (existing.length > 0) continue;

    const diasRestantes = Math.ceil(
      (new Date(p.prazo).getTime() - new Date(hojeISO).getTime()) / (1000 * 60 * 60 * 24)
    );

    await criarNotificacao(
      p.usuarioResponsavel,
      p.id,
      AVISO_TITULO_PRAZO,
      `O prazo do processo ${p.numero} está próximo de vencer (vence em ${p.prazo}). Dias restantes: ${Math.max(
        diasRestantes,
        0
      )}.`,
      'warning',
      'normal',
    );
  }
}

