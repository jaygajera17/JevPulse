import React from 'react';
import { ArrowRight, HelpCircle, MessageSquare, Lightbulb, TrendingUp } from 'lucide-react';

export function TopInsights({
  criteria = [],
  questions = [],
  suggestions = [],
  onSelectCriterion,
}) {
  if (!criteria || criteria.length === 0) return null;

  // 1. Highest agreement / highest positive count criterion
  const sortedByPositiveCount = [...criteria].sort(
    (a, b) => (b.positiveCount || 0) - (a.positiveCount || 0)
  );
  const topConsensus = sortedByPositiveCount[0];

  // 2. Intelligent Middle Card:
  // Is there a genuine debate / split opinion? (stance between 30% and 70% AND at least 5 opposing comments)
  const remaining = criteria.filter((c) => c.id !== topConsensus?.id);
  const genuinelyDivided = remaining.find((c) => {
    const ratio = c.stanceRatio ?? c.percentage;
    const oppCount = c.opposingCount || 0;
    return ratio >= 30 && ratio <= 70 && oppCount >= 5;
  });

  // If no genuine split, pick top viewer suggestion or 2nd highest theme
  const topSuggestion = suggestions?.[0];
  const secondaryTheme = remaining[0];

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
  const dividedAgreeQuote = genuinelyDivided ? getTopQuote(genuinelyDivided, 'supporting') : null;
  const dividedDisagreeQuote = genuinelyDivided ? getTopQuote(genuinelyDivided, 'opposing') : null;

  const topPosCount =
    topConsensus?.positiveCount ??
    Math.round(((topConsensus?.evaluatedCount || 0) * (topConsensus?.percentage || 0)) / 100);

  return (
    <div className="hero-insights-grid">
      {/* 🟢 Card 1: Most Agreed-On / Top Resonance */}
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
              <span className="insight-metric-number">
                {topPosCount.toLocaleString()}
              </span>
              <span className="insight-metric-label">
                comments agreed {topConsensus.percentage > 0 ? `(${topConsensus.percentage}% of analyzed)` : ''}
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
              See the comments ({topPosCount}) <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 🟠 Card 2: Either Genuinely Divided OR Top Suggestion / Secondary Theme */}
      {genuinelyDivided ? (
        <div className="insight-card top-disagreement">
          <div>
            <div className="insight-tag">
              🟠 Most divided
            </div>

            <h3 className="insight-headline">
              {genuinelyDivided.name}
            </h3>

            <div className="insight-metric">
              <span className="insight-metric-number" style={{ fontSize: '24px' }}>
                {genuinelyDivided.positiveCount || 0} Agree / {genuinelyDivided.opposingCount || 0} Disagree
              </span>
              <span className="insight-metric-label">
                split debate across {genuinelyDivided.mentionCount || genuinelyDivided.evaluatedCount} comments
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
              onClick={() => onSelectCriterion(genuinelyDivided)}
              style={{ color: 'var(--amber-gold)', fontWeight: 700 }}
            >
              See both sides ({genuinelyDivided.mentionCount || genuinelyDivided.evaluatedCount}) <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : topSuggestion ? (
        /* Unified sentiment: show Top Viewer Suggestion / Request */
        <div className="insight-card" style={{ borderColor: 'var(--amber-gold)', background: '#FFFDF7' }}>
          <div>
            <div className="insight-tag" style={{ color: 'var(--amber-gold)', background: '#FEF3C7', borderColor: '#FDE68A' }}>
              💡 Top viewer suggestion
            </div>

            <h3 className="insight-headline" style={{ fontSize: '17px' }}>
              Community Request
            </h3>

            <div className="insight-metric">
              <span className="insight-metric-number" style={{ color: 'var(--amber-gold)' }}>
                {suggestions.length}
              </span>
              <span className="insight-metric-label">
                viewer suggestions & requested improvements
              </span>
            </div>

            <div className="insight-quote" style={{ borderLeftColor: 'var(--amber-gold)' }}>
              "{topSuggestion.text}"
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              👍 {topSuggestion.likeCount || 0} likes {topSuggestion.author ? `· @${topSuggestion.author}` : ''}
            </div>
          </div>
        </div>
      ) : secondaryTheme ? (
        /* Or secondary high-resonance theme */
        <div className="insight-card" style={{ borderColor: '#E2E8F0' }}>
          <div>
            <div className="insight-tag" style={{ color: 'var(--jev-cyan)', background: '#EFF6FF', borderColor: '#BFDBFE' }}>
              ⭐ Key theme
            </div>

            <h3 className="insight-headline">
              {secondaryTheme.name}
            </h3>

            <div className="insight-metric">
              <span className="insight-metric-number">
                {(secondaryTheme.positiveCount ?? 0).toLocaleString()}
              </span>
              <span className="insight-metric-label">
                comments affirmed {secondaryTheme.percentage > 0 ? `(${secondaryTheme.percentage}%)` : ''}
              </span>
            </div>

            {getTopQuote(secondaryTheme, 'supporting') && (
              <div className="insight-quote">
                "{getTopQuote(secondaryTheme, 'supporting')}"
              </div>
            )}
          </div>

          <div style={{ marginTop: '16px' }}>
            <button
              className="view-evidence-btn"
              onClick={() => onSelectCriterion(secondaryTheme)}
              style={{ color: 'var(--jev-cyan)', fontWeight: 700 }}
            >
              See comments ({secondaryTheme.positiveCount ?? 0}) <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : null}

      {/* 🔵 Card 3: Top Viewer Question */}
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
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
              See all questions in section below ↓
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
