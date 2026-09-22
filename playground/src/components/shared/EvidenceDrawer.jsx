import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { CommentCard } from './CommentCard';

export function EvidenceDrawer({ isOpen, onClose, criterion }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !criterion) return null;

  const supporting = criterion.evidence?.supporting || [];
  const opposing = criterion.evidence?.opposing || [];

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '18px',
                  fontWeight: 800,
                  color:
                    criterion.percentage >= 65
                      ? 'var(--pos-green)'
                      : criterion.percentage >= 40
                      ? 'var(--amber-gold)'
                      : 'var(--neg-red)',
                }}
              >
                {criterion.percentage}%
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{criterion.name}</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {criterion.question}
            </p>
            {(criterion.true_criteria || criterion.false_criteria) && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '10px 14px',
                  background: '#F8F9FC',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {criterion.true_criteria && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ color: 'var(--pos-green)', fontWeight: 700 }}>YES:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{criterion.true_criteria}</span>
                  </div>
                )}
                {criterion.false_criteria && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ color: 'var(--neg-red)', fontWeight: 700 }}>NO:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{criterion.false_criteria}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          <div style={{ marginBottom: '24px' }}>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--pos-green)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <CheckCircle2 size={16} /> Supporting Comments ({supporting.length})
            </h4>
            {supporting.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                No strong supporting comments found for this criterion.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {supporting.map((c, i) => (
                  <CommentCard key={i} comment={c} score={c.score} tag="agree" />
                ))}
              </div>
            )}
          </div>

          <div>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--neg-red)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <AlertCircle size={16} /> Opposing / Dissenting Comments ({opposing.length})
            </h4>
            {opposing.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                No significant dissenting comments identified.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {opposing.map((c, i) => (
                  <CommentCard key={i} comment={c} score={c.score} tag="dissent" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
