import React, { useState } from 'react';
import { X, Copy, Check, Camera } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export function ShareCard({ isOpen, onClose, results }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !results) return null;

  const { meta, criteria } = results;
  const sorted = [...(criteria || [])].sort((a, b) => b.percentage - a.percentage);
  const topInsight = sorted[0];
  const topQuote = topInsight?.evidence?.supporting?.[0]?.text;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share-modal-backdrop" onClick={onClose}>
      <div className="share-card-container" onClick={(e) => e.stopPropagation()}>
        <div className="share-card-watermark">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src={logoImg}
              alt="JevPulse Logo"
              className="brand-logo-img"
              style={{ width: '28px', height: '28px' }}
            />
            <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>
              jev<span>Pulse</span>
            </span>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                background: '#F1F3F9',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Powered by Jev
            </span>
          </div>
          <button className="drawer-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.35 }}>
            {meta?.videoTitle || 'YouTube Video Insights'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {meta?.channelTitle || 'YouTube Creator'} · {meta?.totalAnalyzed ?? 0} comments analyzed
          </p>
        </div>

        {topInsight && (
          <div
            style={{
              background: '#F8F9FC',
              border: '1px solid #EAECF0',
              borderTop: '4px solid var(--pos-green)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--pos-green)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}
            >
              🟢 Most agreed-on
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {topInsight.name}
            </h4>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: topQuote ? '10px' : 0 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '28px',
                  fontWeight: 800,
                  color: 'var(--pos-green)',
                }}
              >
                {topInsight.percentage}%
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                of substantive comments
              </span>
            </div>
            {topQuote && (
              <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-secondary)', borderLeft: '3px solid var(--border-medium)', paddingLeft: '10px' }}>
                "{topQuote.length > 140 ? `${topQuote.slice(0, 140)}...` : topQuote}"
              </p>
            )}
          </div>
        )}

        <div
          style={{
            background: '#F8F9FC',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          <span>Analyzed with Jev</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--jev-cyan)', fontWeight: 600 }}>
            jevpulse
          </span>
        </div>

        <div className="share-card-actions">
          <button className="btn-secondary" onClick={handleCopyLink}>
            {copied ? <Check size={14} color="var(--pos-green)" /> : <Copy size={14} />}
            {copied ? 'Link Copied!' : 'Copy Link'}
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              alert('Tip: Use Windows Snipping Tool (Win + Shift + S) or Mac (Cmd + Shift + 4) to screenshot this card for LinkedIn/X!');
            }}
          >
            <Camera size={14} /> Screenshot Card
          </button>
        </div>
      </div>
    </div>
  );
}
