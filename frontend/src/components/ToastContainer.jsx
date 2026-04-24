import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const [notificacoesVistas, setNotificacoesVistas] = useState(new Set());
  const navigate = useNavigate();

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const marcarComoLida = async (notificacaoId) => {
    try {
      await api.put(`/notificacoes/${notificacaoId}/lida`);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const handleToastClick = (toast) => {
    if (toast.processoId) {
      navigate(`/processos/${toast.processoId}`);
    }
    marcarComoLida(toast.notificacaoId);
    removeToast(toast.id);
  };

  useEffect(() => {
    let mounted = true;

    const verificarNotificacoes = async () => {
      try {
        const response = await api.get('/notificacoes/nao-lidas');
        const notificacoes = response.data || [];

        if (!mounted || notificacoes.length === 0) return;

        const novasNotificacoes = notificacoes.filter(n => !notificacoesVistas.has(n.id));

        if (novasNotificacoes.length > 0) {
          const novosToasts = novasNotificacoes.map((n, index) => ({
            id: Date.now() + index,
            notificacaoId: n.id,
            titulo: n.titulo,
            mensagem: n.mensagem,
            tipo: n.tipo || 'info',
            prioridade: n.prioridade || 'normal',
            processoId: n.processoId,
            processoNumero: n.processoNumero,
          }));

          setToasts(prev => [...prev, ...novosToasts]);
          setNotificacoesVistas(prev => {
            const next = new Set(prev);
            novasNotificacoes.forEach(n => next.add(n.id));
            return next;
          });

          novosToasts.forEach(t => {
            setTimeout(() => removeToast(t.id), 8000);
          });
        }
      } catch (error) {
        // Silencioso em caso de erro de autenticação
      }
    };

    const initialTimer = setTimeout(verificarNotificacoes, 1500);
    const interval = setInterval(verificarNotificacoes, 12000);

    return () => {
      mounted = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [notificacoesVistas, removeToast]);

  const icones = {
    info: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    success: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  // Cores baseadas na prioridade do processo
  const coresPorPrioridade = {
    urgente: {
      border: '#dc2626',
      bg: '#fef2f2',
      iconBg: 'rgba(220, 38, 38, 0.1)',
      iconColor: '#dc2626',
      label: 'URGENTE — Caixa de Entrada',
      dot: '#dc2626'
    },
    alta: {
      border: '#d97706',
      bg: '#fffbeb',
      iconBg: 'rgba(217, 119, 6, 0.1)',
      iconColor: '#d97706',
      label: 'ALTA PRIORIDADE — Caixa de Entrada',
      dot: '#d97706'
    },
    normal: {
      border: '#2563eb',
      bg: '#eff6ff',
      iconBg: 'rgba(37, 99, 235, 0.1)',
      iconColor: '#2563eb',
      label: 'Caixa de Entrada',
      dot: '#2563eb'
    },
    baixa: {
      border: '#64748b',
      bg: '#f8fafc',
      iconBg: 'rgba(100, 116, 139, 0.1)',
      iconColor: '#64748b',
      label: 'Caixa de Entrada',
      dot: '#94a3b8'
    },
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const cor = coresPorPrioridade[toast.prioridade] || coresPorPrioridade.normal;
        return (
          <div
            key={toast.id}
            className="toast-item"
            style={{ borderLeftColor: cor.border, background: cor.bg }}
            onClick={() => handleToastClick(toast)}
          >
            <div className="toast-icon" style={{ color: cor.iconColor, background: cor.iconBg }}>
              {icones[toast.tipo] || icones.info}
            </div>
            <div className="toast-content">
              <div className="toast-label" style={{ color: cor.iconColor }}>
                <span className="toast-priority-dot" style={{ background: cor.dot }} />
                {cor.label}
              </div>
              <div className="toast-title">{toast.titulo}</div>
              <div className="toast-message">{toast.mensagem}</div>
              {toast.processoNumero && (
                <div className="toast-meta">Processo: {toast.processoNumero}</div>
              )}
            </div>
            <button
              className="toast-close"
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;

