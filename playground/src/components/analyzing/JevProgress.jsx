import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle2, Layers } from 'lucide-react';
import { useCounter } from '../../hooks/useCounter';

const ROTATING_MESSAGES = [
  'Finding recurring opinions...',
  'Comparing different viewpoints...',
  'Looking for what people want...',
  'Finding where commenters disagree...',
  'Evaluating tone and specific feedback...',
];

export function JevProgress({ jevProgress, totalComments = 0, elapsedSeconds = '0.0' }) {
  const { batchIndex, totalBatches, processedCount, decisionsCount } = jevProgress;

  const animatedComments = useCounter(processedCount);
  const animatedDecisions = useCounter(decisionsCount);

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ROTATING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const total = totalComments || jevProgress.totalComments || 0;
  const pct = total > 0 ? Math.min(100, Math.round((processedCount / total) * 100)) : 0;

  return (
    <div style={{ marginBottom: '28px' }}>
      <div className="telemetry-grid">
        {/* Stopwatch USP Card */}
        <div className="telemetry-card highlight">
          <div className="telemetry-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Timer size={14} color="var(--jev-cyan)" /> Analysis Speed
          </div>
          <div className="telemetry-value">
            {elapsedSeconds}s
          </div>
          <div className="telemetry-sub">
            Powered by Jev
          </div>
        </div>

        {/* Comments Count */}
        <div className="telemetry-card">
          <div className="telemetry-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} color="var(--pos-green)" /> Comments Read
          </div>
          <div className="telemetry-value">
            {animatedComments} {total > 0 && <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>/ {total}</span>}
          </div>
          <div className="telemetry-sub">
            {total > 0 ? `${pct}% of comments evaluated` : 'Evaluating comments...'}
          </div>
        </div>

        {/* Decisions Count */}
        <div className="telemetry-card">
          <div className="telemetry-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} color="var(--rubric-purple)" /> Decisions Made
          </div>
          <div className="telemetry-value">
            {animatedDecisions.toLocaleString()}
          </div>
          <div className="telemetry-sub">
            {totalBatches > 0 ? `${batchIndex} of ${totalBatches} batches complete` : `Batch ${batchIndex} in progress`}
          </div>
        </div>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginTop: '6px',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="dot pulse-active" style={{ background: 'var(--jev-cyan)' }} />
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{ROTATING_MESSAGES[messageIndex]}</span>
        </span>
        <span style={{ color: 'var(--text-muted)' }}>{pct}% complete</span>
      </div>
    </div>
  );
}
