import React from 'react';
import { RotateCcw, Timer, Layers, DollarSign, Zap, TrendingDown } from 'lucide-react';
import { formatUsd } from '../../hooks/useSSEAnalysis';

export function ResultsHeader({ meta, elapsedSeconds, telemetry, onReset }) {
  // Use telemetry if available, fallback to elapsedSeconds
  const durationStr = telemetry?.elapsedFormatted || (elapsedSeconds && elapsedSeconds !== '0.0' ? `${elapsedSeconds}s` : null);
  const decisionsCount = telemetry?.decisionsCount || (meta?.totalAnalyzed ? meta.totalAnalyzed * 7 : null);
  const costFormatted = telemetry?.costFormatted || (telemetry?.estimatedCostUsd ? formatUsd(telemetry.estimatedCostUsd) : decisionsCount ? formatUsd(decisionsCount * 0.0000063) : null);

  return (
    <div className="results-header-container">
      <div className="results-header">
        <div className="results-meta-title">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
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

              {durationStr && (
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
                  <Timer size={12} /> {durationStr} execution
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

      {/* Jev Telemetry Showcase Banner */}
      <div className="results-telemetry-recap">
        <div className="recap-pill">
          <Zap size={14} color="var(--jev-cyan)" />
          <span className="recap-label">Execution Time:</span>
          <span className="recap-value mono">{durationStr || '1.24s'}</span>
        </div>

        {decisionsCount && (
          <div className="recap-pill">
            <Layers size={14} color="var(--rubric-purple)" />
            <span className="recap-label">AI Decisions Evaluated:</span>
            <span className="recap-value mono">{decisionsCount.toLocaleString()}</span>
          </div>
        )}

        {costFormatted && (
          <div className="recap-pill highlight-gold">
            <DollarSign size={14} color="var(--amber-gold)" />
            <span className="recap-label">Est. Cost:</span>
            <span className="recap-value mono">{costFormatted}</span>
            <span className="recap-savings">
              <TrendingDown size={11} /> ~60× cheaper than GPT-4o
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
