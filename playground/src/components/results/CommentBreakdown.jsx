import React from 'react';
import { BarChart2 } from 'lucide-react';

export function CommentBreakdown({ breakdown = {}, total = 0 }) {
  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0 || total === 0) return null;

  return (
    <div className="panel" style={{ marginBottom: '36px' }}>
      <div className="section-title-bar" style={{ margin: '0 0 16px 0' }}>
        <h3 className="section-title">
          <BarChart2 size={18} color="var(--jev-cyan)" /> What viewers are saying
        </h3>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Comment types · {total} comments
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {entries.map(([type, count]) => {
          const pct = Math.round((count / total) * 100);
          return (
            <div key={type} className="breakdown-row">
              <span className="breakdown-label">{type}</span>
              <div className="breakdown-bar-track">
                <div
                  className="breakdown-bar-fill"
                  style={{
                    width: `${pct}%`,
                    background:
                      type === 'praise' || type === 'agreement'
                        ? 'var(--pos-green)'
                        : type === 'criticism' || type === 'disagreement'
                        ? 'var(--neg-red)'
                        : type === 'question'
                        ? 'var(--rubric-purple)'
                        : type === 'suggestion'
                        ? 'var(--amber-gold)'
                        : 'var(--text-muted)',
                  }}
                />
              </div>
              <span className="breakdown-count">
                {count} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
