import React from 'react';
import { RotateCcw, Timer } from 'lucide-react';

export function ResultsHeader({ meta, elapsedSeconds, onReset }) {
  const timeDisplay = elapsedSeconds && elapsedSeconds !== '0.0' ? `${elapsedSeconds}s` : null;

  return (
    <div className="results-header">
      <div className="results-meta-title">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--pos-green)',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              ✓ Analysis complete
            </span>

            {timeDisplay && (
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--jev-cyan)',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Timer size={12} /> Analyzed in {timeDisplay}
              </span>
            )}
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Here's what commenters are saying
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {meta?.channelTitle ? `${meta.channelTitle} · ` : ''}
            <strong>{meta?.totalAnalyzed ?? 0} comments analyzed</strong> ·{' '}
            <span>{meta?.opinionBearing || 0} substantive opinions ({meta?.opinionPercentage || 0}%)</span>
          </p>
        </div>
      </div>

      <div className="results-actions">
        <button className="btn-primary" onClick={onReset}>
          <RotateCcw size={14} /> Analyze another video
        </button>
      </div>
    </div>
  );
}
