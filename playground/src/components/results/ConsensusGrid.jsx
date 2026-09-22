import React from 'react';
import { ArrowRight, MessageSquare, CheckCircle } from 'lucide-react';

export function ConsensusGrid({ criteria, onSelectCriterion }) {
  if (!criteria || criteria.length === 0) return null;

  return (
    <div style={{ marginBottom: '36px' }}>
      <div className="section-title-bar">
        <h3 className="section-title">
          <MessageSquare size={18} color="var(--jev-cyan)" /> What viewers care about
        </h3>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {criteria.length} core themes evaluated
        </span>
      </div>

      <div className="consensus-grid">
        {criteria.map((c) => {
          const posCount =
            c.positiveCount ?? Math.round(((c.evaluatedCount || 0) * (c.percentage || 0)) / 100);
          const ratio = c.stanceRatio ?? c.percentage;

          // Determine badge color: if ratio or count is strong, show green/blue
          const badgeClass = ratio >= 65 || posCount >= 30 ? 'high' : ratio >= 35 ? 'mid' : 'low';
          const barColor = ratio >= 65 || posCount >= 30 ? 'var(--pos-green)' : 'var(--jev-cyan)';

          return (
            <div key={c.id} className="criterion-card">
              <div>
                <div className="criterion-card-top">
                  <span className="criterion-title">{c.name}</span>
                  <span className={`criterion-badge ${badgeClass}`}>
                    {posCount.toLocaleString()} comments
                  </span>
                </div>

                <p className="criterion-q-text">{c.question}</p>

                <div className="consensus-meter">
                  <div
                    className="consensus-meter-fill"
                    style={{
                      width: `${Math.min(100, Math.max(8, ratio))}%`,
                      background: barColor,
                    }}
                  />
                </div>
              </div>

              <div className="criterion-card-footer">
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong>{posCount.toLocaleString()}</strong> agreed
                  {c.percentage > 0 ? ` · ${c.percentage}% of comments` : ''}
                </span>
                <button className="view-evidence-btn" onClick={() => onSelectCriterion(c)}>
                  View comments <ArrowRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
