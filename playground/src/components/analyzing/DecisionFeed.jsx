import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Terminal, CheckCircle, HelpCircle, Lightbulb, ThumbsUp, AlertCircle } from 'lucide-react';

const SAMPLE_TEMPLATES = [
  {
    type: 'Substantive Feedback',
    sentiment: 'positive',
    tag: 'high-signal',
    conf: 97,
    icon: ThumbsUp,
    text: 'Clear explanation of the architecture & real-world trade-offs',
  },
  {
    type: 'Actionable Suggestion',
    sentiment: 'neutral',
    tag: 'feature-req',
    conf: 93,
    icon: Lightbulb,
    text: 'Requested benchmarking against alternative models in part 2',
  },
  {
    type: 'Viewer Question',
    sentiment: 'neutral',
    tag: 'question',
    conf: 95,
    icon: HelpCircle,
    text: 'Inquiring about latency impact with 500+ concurrent requests',
  },
  {
    type: 'Constructive Critique',
    sentiment: 'negative',
    tag: 'pacing',
    conf: 88,
    icon: AlertCircle,
    text: 'Audio background track slightly overpowered dialogue around 04:15',
  },
  {
    type: 'Audience Endorsement',
    sentiment: 'positive',
    tag: 'praise',
    conf: 99,
    icon: CheckCircle,
    text: 'Bookmarked for team onboarding — exactly what was missing',
  },
  {
    type: 'Domain Nuance',
    sentiment: 'mixed',
    tag: 'technical',
    conf: 91,
    icon: Lightbulb,
    text: 'Pointed out edge case in deployment configuration step',
  },
];

export function DecisionFeed({ rubric, processedCount = 0, isRunning = true }) {
  const [items, setItems] = useState([]);
  const feedEndRef = useRef(null);
  const criteriaNames = useMemo(() => {
    return (
      rubric?.criteria?.map((c) => c.name) || [
        'Content Clarity',
        'Practical Value',
        'Audio & Production',
      ]
    );
  }, [rubric]);

  useEffect(() => {
    if (!isRunning) return;

    // Generate simulated high-frequency decisions matching Jev's parallel speed
    const interval = setInterval(() => {
      setItems((prev) => {
        const index = prev.length + 1;
        const template = SAMPLE_TEMPLATES[Math.floor(Math.random() * SAMPLE_TEMPLATES.length)];
        const criterion = criteriaNames[Math.floor(Math.random() * criteriaNames.length)];
        const msTimestamp = (Math.random() * 0.9 + 0.1).toFixed(2);

        const newItem = {
          id: `dec-${Date.now()}-${Math.random()}`,
          commentNum: Math.min(processedCount + index, Math.max(processedCount, 12)),
          criterion,
          type: template.type,
          sentiment: template.sentiment,
          conf: template.conf + Math.floor(Math.random() * 3) - 1,
          text: template.text,
          timeOffset: `+${msTimestamp}s`,
        };

        // Keep last 6 items for clean visible stream
        return [...prev.slice(-5), newItem];
      });
    }, 280);

    return () => clearInterval(interval);
  }, [isRunning, processedCount, criteriaNames]);

  return (
    <div className="decision-feed-container">
      <div className="decision-feed-header">
        <div className="feed-title">
          <Terminal size={14} className="terminal-icon" />
          <span>REAL-TIME JEV SYSTEM ONE DECISION STREAM</span>
        </div>
        <div className="feed-status-badge">
          <span className="live-dot pulse-active" />
          PARALLEL INFERENCE ACTIVE
        </div>
      </div>

      <div className="decision-feed-list">
        {items.length === 0 ? (
          <div className="feed-empty">Connecting to Jev evaluation stream...</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="decision-feed-row animate-feed-row">
              <div className="feed-row-left">
                <span className="feed-comment-idx">#{item.commentNum}</span>
                <span className={`feed-sentiment-badge ${item.sentiment}`}>
                  {item.sentiment === 'positive' && '+'}
                  {item.sentiment === 'negative' && '-'}
                  {item.sentiment === 'mixed' && '~'}
                  {item.type}
                </span>
                <span className="feed-criterion-pill">{item.criterion}</span>
              </div>
              <div className="feed-row-center">
                <span className="feed-text">"{item.text}"</span>
              </div>
              <div className="feed-row-right">
                <span className="feed-conf">{item.conf}% conf</span>
                <span className="feed-time">{item.timeOffset}</span>
              </div>
            </div>
          ))
        )}
        <div ref={feedEndRef} />
      </div>
    </div>
  );
}
