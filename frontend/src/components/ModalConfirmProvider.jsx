import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ConfirmModal from './ConfirmModal';

const ModalConfirmContext = createContext(null);

export function ModalConfirmProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    title: '',
    message: '',
    variant: 'default',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    requireInput: false,
    inputLabel: '',
    inputPlaceholder: '',
    inputType: 'text',
    inputValue: '',
    loading: false,
    resolve: null,
  });

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false, resolve: null, loading: false }));
  }, []);

  const api = useMemo(
    () => ({
      confirm: ({
        title,
        message,
        variant,
        confirmText,
        cancelText,
      }) =>
        new Promise((resolve) => {
          setState({
            open: true,
            title: title || 'Confirmação',
            message: message || '',
            variant: variant || 'default',
            confirmText: confirmText || 'Confirmar',
            cancelText: cancelText || 'Cancelar',
            requireInput: false,
            inputLabel: '',
            inputPlaceholder: '',
            inputType: 'text',
            inputValue: '',
            loading: false,
            resolve,
          });
        }),

      alert: ({ title = 'Mensagem', message, confirmText = 'Fechar', variant } = {}) =>
        new Promise((resolve) => {
          setState({
            open: true,
            title,
            message: message || '',
            variant: variant || 'default',
            confirmText,
            cancelText: 'Fechar',
            requireInput: false,
            inputLabel: '',
            inputPlaceholder: '',
            inputType: 'text',
            inputValue: '',
            loading: false,
            resolve,
          });
        }),

      prompt: ({
        title,
        message,
        inputLabel,
        inputPlaceholder,
        inputType,
        confirmText,
        cancelText,
        initialValue,
        validate,
      }) =>
        new Promise((resolve) => {
          setState({
            open: true,
            title: title || 'Entrada necessária',
            message: message || '',
            variant: 'danger',
            confirmText: confirmText || 'Confirmar',
            cancelText: cancelText || 'Cancelar',
            requireInput: true,
            inputLabel: inputLabel || 'Digite',
            inputPlaceholder: inputPlaceholder || '',
            inputType: inputType || 'text',
            inputValue: initialValue || '',
            loading: false,
            resolve: (value) => {
              if (typeof validate === 'function') {
                const res = validate(value);
                if (res === false) return resolve(null);
              }
              resolve(value);
            },
          });
        }),

      setLoading: (loading) => setState((s) => ({ ...s, loading })),
    }),
    []
  );

  const onCancel = useCallback(() => {
    const resolve = state.resolve;
    close();
    resolve?.(null);
  }, [close, state.resolve]);

  const onConfirm = useCallback(
    (value) => {
      const resolve = state.resolve;
      close();
      resolve?.(value);
    },
    [close, state.resolve]
  );

  const handleConfirm = useCallback(
    async (inputValue) => {
      // resolve controlado em onConfirm
      onConfirm(inputValue);
    },
    [onConfirm]
  );

  const onInputChange = useCallback((inputValue) => {
    setState((s) => ({ ...s, inputValue }));
  }, []);

  return (
    <ModalConfirmContext.Provider value={api}>
      {children}
      <ConfirmModal
        open={state.open}
        title={state.title}
        message={state.message}
        variant={state.variant}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        inputLabel={state.inputLabel}
        inputPlaceholder={state.inputPlaceholder}
        inputValue={state.inputValue}
        inputType={state.inputType}
        requireInput={state.requireInput}
        onInputChange={onInputChange}
        onCancel={onCancel}
        onConfirm={handleConfirm}
        loading={state.loading}
      />
    </ModalConfirmContext.Provider>
  );
}

export function useModalConfirm() {
  const ctx = useContext(ModalConfirmContext);
  if (!ctx) throw new Error('useModalConfirm must be used within ModalConfirmProvider');
  return ctx;
}

