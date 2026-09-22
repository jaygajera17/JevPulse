import React from 'react';
import { Timer, CheckCircle2, Layers, DollarSign, Zap, Sparkles, TrendingDown } from 'lucide-react';
import { LiveTimer } from './LiveTimer';
import { DecisionFeed } from './DecisionFeed';
import { useCounter } from '../../hooks/useCounter';
import { formatUsd } from '../../hooks/useSSEAnalysis';

export function JevMissionControl({
  videoMeta,
  rubric,
  jevProgress,
  totalComments = 0,
  jevStartTime,
  elapsedSeconds = '0.000',
  elapsedMs = 0,
  isComplete = false,
}) {
  const { batchIndex, totalBatches, processedCount, decisionsCount, estimatedCostUsd } = jevProgress;

  const total = totalComments || jevProgress.totalComments || 0;
  const animatedComments = useCounter(processedCount, 300);
  const animatedDecisions = useCounter(decisionsCount, 300);

  const pct = total > 0 ? Math.min(100, Math.round((processedCount / total) * 100)) : 0;
  const currentCostFormatted = formatUsd(estimatedCostUsd);

  // Approximate throughput (decisions / sec)
  const durationSec = elapsedMs > 0 ? elapsedMs / 1000 : parseFloat(elapsedSeconds) || 1;
  const decisionsPerSec = decisionsCount > 0 ? Math.round(decisionsCount / Math.max(durationSec, 0.2)) : 0;

  return (
    <div className="mission-control-container">
      {/* Top Banner: Video context & active pipeline status */}
      <div className="mc-header-bar">
        <div className="mc-video-badge">
          {videoMeta?.thumbnailUrl && (
            <img
              src={videoMeta.thumbnailUrl}
              alt=""
              className="mc-thumb"
              onError={(e) => {
                if (videoMeta?.videoId) {
                  e.target.src = `https://img.youtube.com/vi/${videoMeta.videoId}/0.jpg`;
                }
              }}
            />
          )}
          <div className="mc-video-info">
            <span className="mc-video-title">{videoMeta?.title || 'Analyzing YouTube Video'}</span>
            <span className="mc-video-channel">
              {videoMeta?.channelTitle || 'YouTube'} · {total} comments fetched
            </span>
          </div>
        </div>

        <div className="mc-status-pill">
          <span className="mc-radar-dot" />
          <span>JEV SYSTEM ONE · REAL-TIME MISSION CONTROL</span>
        </div>
      </div>

      {/* Hero Stopwatch Showcase */}
      <div className="mc-hero-clock-panel">
        <div className="mc-clock-header">
          <div className="mc-clock-label">
            <Zap size={16} className="text-cyan animate-pulse" />
            <span>ANALYSIS SPEED</span>
          </div>
          <div className="mc-model-pill">
            <span className="pill-dot" />
            <span>TypeSafe Jev 1.13</span>
          </div>
        </div>

        <div className="mc-clock-display">
          <LiveTimer
            startTime={jevStartTime}
            isRunning={!isComplete}
            finalMs={elapsedMs}
          />
        </div>

        <div className="mc-clock-sub">
          {decisionsPerSec > 0 ? (
            <span className="speed-badge">
              ⚡ Evaluating at <strong>{decisionsPerSec.toLocaleString()}</strong> decisions/sec
            </span>
          ) : (
            <span className="speed-badge">⚡ Sub-second decision latency per comment batch</span>
          )}
        </div>
      </div>

      {/* 4-Column Live USP Telemetry Cards */}
      <div className="mc-telemetry-grid">
        {/* Card 1: Millisecond Stopwatch Summary */}
        <div className="mc-card highlight-cyan">
          <div className="mc-card-top">
            <span className="mc-card-label">
              <Timer size={14} /> Stopwatch
            </span>
            <span className="mc-card-tag cyan">High-Precision</span>
          </div>
          <div className="mc-card-val mono">
            {elapsedSeconds}
            <span className="val-unit">s</span>
          </div>
          <div className="mc-card-sub">
            Sub-second System One judgments
          </div>
        </div>

        {/* Card 2: Comments Processed */}
        <div className="mc-card">
          <div className="mc-card-top">
            <span className="mc-card-label">
              <CheckCircle2 size={14} color="var(--pos-green)" /> Comments Read
            </span>
            <span className="mc-card-tag green">{pct}%</span>
          </div>
          <div className="mc-card-val mono">
            {animatedComments}
            {total > 0 && <span className="val-max">/ {total}</span>}
          </div>
          <div className="mc-card-sub">
            {totalBatches > 0 ? `${batchIndex} of ${totalBatches} batches processed` : 'Evaluating comments...'}
          </div>
        </div>

        {/* Card 3: Decisions Made (Core USP) */}
        <div className="mc-card highlight-purple">
          <div className="mc-card-top">
            <span className="mc-card-label">
              <Layers size={14} color="var(--rubric-purple)" /> Decisions Made
            </span>
            <span className="mc-card-tag purple">The USP</span>
          </div>
          <div className="mc-card-val mono text-purple">
            {animatedDecisions.toLocaleString()}
          </div>
          <div className="mc-card-sub">
            {rubric?.criteria?.length ? `${4 + rubric.criteria.length} judgments per comment` : 'Multi-layered typed opinions'}
          </div>
        </div>

        {/* Card 4: Estimated Cost in USD (Core USP) */}
        <div className="mc-card highlight-amber">
          <div className="mc-card-top">
            <span className="mc-card-label">
              <DollarSign size={14} color="var(--amber-gold)" /> Estimated Cost
            </span>
            <span className="mc-card-tag amber">
              <TrendingDown size={11} /> 60× Cheaper
            </span>
          </div>
          <div className="mc-card-val mono text-amber">
            {currentCostFormatted}
          </div>
          <div className="mc-card-sub">
            $0.042/Mtok vs ~$2.50/Mtok (GPT-4o)
          </div>
        </div>
      </div>

      {/* Real-time Progress Bar */}
      <div className="mc-progress-section">
        <div className="mc-progress-bar-wrap">
          <div
            className="mc-progress-bar-fill"
            style={{ width: `${Math.max(pct, processedCount > 0 ? 5 : 2)}%` }}
          >
            <span className="mc-progress-shimmer" />
          </div>
        </div>
        <div className="mc-progress-meta">
          <span className="progress-status-msg">
            <span className="dot pulse-active" />
            <span>Evaluating opinions, tone, suggestions, and custom criteria in parallel...</span>
          </span>
          <span className="progress-pct-badge">{pct}% complete</span>
        </div>
      </div>

      {/* Live Decision Feed Stream */}
      <DecisionFeed
        rubric={rubric}
        processedCount={processedCount}
        isRunning={!isComplete}
      />

      {/* Rubric Criteria Pills Active in Evaluation */}
      {rubric?.criteria?.length > 0 && (
        <div className="mc-criteria-bar">
          <span className="criteria-bar-label">
            <Sparkles size={12} color="var(--rubric-purple)" />
            Active Rubric Targets:
          </span>
          <div className="criteria-pills-row">
            {rubric.criteria.map((c) => (
              <span key={c.id || c.name} className="mc-criterion-chip">
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
