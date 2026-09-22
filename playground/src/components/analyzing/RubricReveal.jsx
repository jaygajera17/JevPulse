import React from 'react';
import { Sparkles } from 'lucide-react';

export function RubricReveal({ rubric }) {
  if (!rubric) return null;

  return (
    <div className="rubric-card">
      <div className="rubric-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="rubric-tag">
            <Sparkles size={12} /> What matters in this video
          </span>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              textTransform: 'capitalize',
            }}
          >
            {(rubric.video_type || '').replace(/_/g, ' ')}
          </span>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
          {rubric.criteria?.length || 0} core topics
        </span>
      </div>

      {rubric.video_summary && (
        <p className="rubric-summary">
          {rubric.video_summary}
        </p>
      )}

      <div className="criteria-list">
        {rubric.criteria?.map((c) => (
          <div key={c.id} className="criterion-pill">
            <div className="criterion-pill-name">
              <span>{c.name}</span>
            </div>
            <div className="criterion-pill-q">{c.question}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
