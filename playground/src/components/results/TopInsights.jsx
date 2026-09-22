import React from 'react';
import { ArrowRight, HelpCircle, MessageSquare } from 'lucide-react';

export function TopInsights({ criteria = [], questions = [], onSelectCriterion }) {
  if (!criteria || criteria.length === 0) return null;

  // 1. Highest agreement criterion
  const sortedByAgreement = [...criteria].sort((a, b) => b.percentage - a.percentage);
  const topConsensus = sortedByAgreement[0];

  // 2. Most divided criterion (closest to 50%, strictly distinct from topConsensus if possible)
  const remaining = criteria.filter((c) => c.id !== topConsensus.id);
  const candidates = remaining.length > 0 ? remaining : criteria;
  const mostDivided = [...candidates].sort(
    (a, b) => Math.abs(a.percentage - 50) - Math.abs(b.percentage - 50)
  )[0];

  // 3. Top question from audience signals
  const topQuestion = questions?.[0];

  const getTopQuote = (crit, type = 'supporting') => {
    const list = crit?.evidence?.[type] || [];
    if (list.length > 0 && list[0]?.text) {
      return list[0].text;
    }
    return null;
  };

  const topConsensusQuote = getTopQuote(topConsensus, 'supporting');
  const dividedAgreeQuote = getTopQuote(mostDivided, 'supporting');
  const dividedDisagreeQuote = getTopQuote(mostDivided, 'opposing');

  return (
    <div className="hero-insights-grid">
      {/* 🟢 Most Agreed-On Card */}
      {topConsensus && (
        <div className="insight-card top-consensus">
          <div>
            <div className="insight-tag">
              🟢 Most agreed-on
            </div>

            <h3 className="insight-headline">
              {topConsensus.name}
            </h3>

            <div className="insight-metric">
              <span className="insight-metric-number">{topConsensus.percentage}%</span>
              <span className="insight-metric-label">
                among commenters · {topConsensus.positiveCount || Math.round(topConsensus.evaluatedCount * topConsensus.percentage / 100)} of {topConsensus.evaluatedCount || 0} comments
              </span>
            </div>

            {topConsensusQuote && (
              <div className="insight-quote">
                "{topConsensusQuote}"
              </div>
            )}
          </div>

          <div style={{ marginTop: '16px' }}>
            <button
              className="view-evidence-btn"
              onClick={() => onSelectCriterion(topConsensus)}
              style={{ color: 'var(--pos-green)', fontWeight: 700 }}
            >
              See the comments ({topConsensus.evaluatedCount || 0}) <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 🟠 Most Divided Card */}
      {mostDivided && (
        <div className="insight-card top-disagreement">
          <div>
            <div className="insight-tag">
              🟠 Most divided
            </div>

            <h3 className="insight-headline">
              {mostDivided.name}
            </h3>

            <div className="insight-metric">
              <span className="insight-metric-number">
                {mostDivided.percentage}% <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-muted)' }}>/ {100 - mostDivided.percentage}%</span>
              </span>
              <span className="insight-metric-label">
                split opinion · {mostDivided.evaluatedCount || 0} comments
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '10px 0 14px' }}>
              {dividedAgreeQuote && (
                <div style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-secondary)', borderLeft: '3px solid var(--pos-green)', paddingLeft: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--pos-green)', fontStyle: 'normal' }}>AGREE: </span>
                  "{dividedAgreeQuote.length > 120 ? `${dividedAgreeQuote.slice(0, 120)}...` : dividedAgreeQuote}"
                </div>
              )}
              {dividedDisagreeQuote && (
                <div style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-secondary)', borderLeft: '3px solid var(--neg-red)', paddingLeft: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--neg-red)', fontStyle: 'normal' }}>DISAGREE: </span>
                  "{dividedDisagreeQuote.length > 120 ? `${dividedDisagreeQuote.slice(0, 120)}...` : dividedDisagreeQuote}"
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <button
              className="view-evidence-btn"
              onClick={() => onSelectCriterion(mostDivided)}
              style={{ color: 'var(--amber-gold)', fontWeight: 700 }}
            >
              See both sides ({mostDivided.evaluatedCount || 0}) <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 🔵 People Are Asking (If questions exist) */}
      {topQuestion && (
        <div className="insight-card top-question">
          <div>
            <div className="insight-tag">
              🔵 People are asking
            </div>

            <h3 className="insight-headline" style={{ fontSize: '16px' }}>
              Top Viewer Question
            </h3>

            <div className="insight-quote" style={{ borderLeftColor: 'var(--jev-cyan)' }}>
              "{topQuestion.text}"
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              👍 {topQuestion.likeCount || 0} likes {topQuestion.author ? `· @${topQuestion.author}` : ''}
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              See all questions in section below ↓
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
