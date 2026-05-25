import React, { useState, useEffect } from 'react';

function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const totalDuration = 2500;
    const interval = 30;
    const steps = totalDuration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const newProgress = Math.min((step / steps) * 100, 100);
      setProgress(newProgress);

      if (step > steps * 0.3) setPhase(1);
      if (step > steps * 0.6) setPhase(2);
      if (step >= steps) {
        clearInterval(timer);
        setTimeout(() => onComplete && onComplete(), 200);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const dotsTimer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(dotsTimer);
  }, []);

  return (
    <div className="loading-screen-simple">
      <div className="loading-simple-bg">
        <div className="loading-simple-glow" />
      </div>

      <div className="loading-simple-card">
        <div className="loading-simple-header">
          <div className="loading-logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="loading-logo-text">
            <span className="logo-name">Processo</span>
            <span className="logo-plus">+</span>
          </div>
        </div>

        <div className="loading-divider" />

        <div className="loading-status-row">
          <div className="loading-spinner">
            <div className="spinner-ring" />
          </div>
          <div className="loading-status-text">
            <span className="status-main">
              {phase === 0 && 'Inicializando'}
              {phase === 1 && 'Carregando dados'}
              {phase === 2 && 'Quase pronto'}
            </span>
            <span className="status-sub">Aguarde um momento{dots}</span>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-label">{Math.floor(progress)}%</span>
        </div>

        <div className="loading-simple-footer">
          <span>Sistema de Gestão Processual</span>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;