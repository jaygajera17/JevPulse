import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { CommentCard } from '../shared/CommentCard';

export function AudienceSignals({ praises = [], criticisms = [] }) {
  if (praises.length === 0 && criticisms.length === 0) return null;

  return (
    <div style={{ marginBottom: '36px' }}>
      <div className="section-title-bar">
        <h3 className="section-title">
          Top praise and criticism
        </h3>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Ranked by commenter engagement & likes
        </span>
      </div>

      <div className="signals-grid">
        <div className="comment-stream-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--pos-green)',
              marginBottom: '16px',
            }}
          >
            <ThumbsUp size={16} /> Most agreed-on praise ({praises.length})
          </div>

          {praises.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No strong praises identified.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {praises.map((p, i) => (
                <CommentCard key={i} comment={p} />
              ))}
            </div>
          )}
        </div>

        <div className="comment-stream-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--neg-red)',
              marginBottom: '16px',
            }}
          >
            <ThumbsDown size={16} /> Most common criticisms ({criticisms.length})
          </div>

          {criticisms.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No significant criticisms identified.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {criticisms.map((c, i) => (
                <CommentCard key={i} comment={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
