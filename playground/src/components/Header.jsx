import React from 'react';
import { RotateCcw } from 'lucide-react';
import logoImg from '../assets/logo.png';

export function Header({ onReset, showReset = false }) {
  return (
    <header className="header">
      <div className="app-container header-content">
        <div className="brand-badge" onClick={onReset} role="button" tabIndex={0}>
          <img src={logoImg} alt="JevPulse Logo" className="brand-logo-img" />
          <div>
            <div className="brand-name">
              jev<span>Pulse</span>
            </div>
          </div>
          <span className="brand-subtitle">Powered by Jev</span>
        </div>

        <div className="header-actions">
          {showReset && (
            <button className="btn-secondary" onClick={onReset} style={{ padding: '7px 14px' }}>
              <RotateCcw size={14} /> New Video
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
