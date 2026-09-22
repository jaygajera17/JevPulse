import React from 'react';
import { ArrowRight, MessageSquare } from 'lucide-react';

export function ConsensusGrid({ criteria, onSelectCriterion }) {
  if (!criteria || criteria.length === 0) return null;

  const getBadgeClass = (pct) => {
    if (pct >= 65) return 'high';
    if (pct >= 40) return 'mid';
    return 'low';
  };

  const getBarColor = (pct) => {
    if (pct >= 65) return 'var(--pos-green)';
    if (pct >= 40) return 'var(--amber-gold)';
    return 'var(--neg-red)';
  };

  return (
    <div style={{ marginBottom: '36px' }}>
      <div className="section-title-bar">
        <h3 className="section-title">
          <MessageSquare size={18} color="var(--jev-cyan)" /> What viewers care about
        </h3>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {criteria.length} core topics evaluated
        </span>
      </div>

      <div className="consensus-grid">
        {criteria.map((c) => {
          const badgeClass = getBadgeClass(c.percentage);
          const barColor = getBarColor(c.percentage);

          return (
            <div key={c.id} className="criterion-card">
              <div>
                <div className="criterion-card-top">
                  <span className="criterion-title">{c.name}</span>
                  <span className={`criterion-badge ${badgeClass}`}>{c.percentage}% agree</span>
                </div>

                <p className="criterion-q-text">{c.question}</p>

                <div className="consensus-meter">
                  <div
                    className="consensus-meter-fill"
                    style={{
                      width: `${c.percentage}%`,
                      background: barColor,
                    }}
                  />
                </div>
              </div>

              <div className="criterion-card-footer">
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {c.positiveCount || Math.round((c.evaluatedCount || 0) * c.percentage / 100)} of {c.evaluatedCount || 0} comments
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
