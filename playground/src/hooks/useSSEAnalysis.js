import { useState, useEffect, useRef, useCallback } from 'react';
import { getApiUrl } from '../config/api';

export const PHASES = {
  IDLE: 'IDLE',
  CONNECTING: 'CONNECTING',
  FETCHING_CONTEXT: 'FETCHING_CONTEXT',
  FETCHING_COMMENTS: 'FETCHING_COMMENTS',
  GENERATING_RUBRIC: 'GENERATING_RUBRIC',
  ANALYZING_JEV: 'ANALYZING_JEV',
  COMPLETE: 'COMPLETE',
  ERROR: 'ERROR',
};

// TypeSafe Jev 1.13 pricing: $0.042 per 1M input tokens ($42 per billion tokens).
// Each comment evaluation averages ~150 input tokens per decision (including state, criteria, instruction).
// 150 * (0.042 / 1,000,000) = $0.0000063 per decision.
export const JEV_COST_PER_DECISION = 0.0000063;

export function formatUsd(amount) {
  if (!amount || amount <= 0) return '$0.0000';
  if (amount < 0.01) {
    return `$${amount.toFixed(4)}`;
  }
  return `$${amount.toFixed(3)}`;
}

export function useSSEAnalysis() {
  const [phase, setPhase] = useState(PHASES.IDLE);
  const [videoMeta, setVideoMeta] = useState(null);
  const [commentsCount, setCommentsCount] = useState(0);
  const [rubric, setRubric] = useState(null);
  const [jevStartTime, setJevStartTime] = useState(null);
  const [jevProgress, setJevProgress] = useState({
    batchIndex: 0,
    totalBatches: 0,
    processedCount: 0,
    totalComments: 0,
    decisionsCount: 0,
    estimatedCostUsd: 0,
    costFormatted: '$0.0000',
  });
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState('0.000');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [telemetry, setTelemetry] = useState(null);

  const eventSourceRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const jevStartTimeRef = useRef(null);
  const rubricRef = useRef(null);
  const jevProgressRef = useRef(jevProgress);

  useEffect(() => {
    jevProgressRef.current = jevProgress;
  }, [jevProgress]);

  useEffect(() => {
    rubricRef.current = rubric;
  }, [rubric]);

  const clearTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    clearTimer();
    jevStartTimeRef.current = null;
    setJevStartTime(null);
    setElapsedSeconds('0.000');
    setElapsedMs(0);
    setTelemetry(null);
    setPhase(PHASES.IDLE);
    setVideoMeta(null);
    setCommentsCount(0);
    setRubric(null);
    setJevProgress({
      batchIndex: 0,
      totalBatches: 0,
      processedCount: 0,
      totalComments: 0,
      decisionsCount: 0,
      estimatedCostUsd: 0,
      costFormatted: '$0.0000',
    });
    setResults(null);
    setError(null);
  }, [clearTimer]);

  const startAnalysis = useCallback((url) => {
    reset();

    if (!url || !url.trim()) {
      setError('Please enter a valid YouTube video URL or ID.');
      setPhase(PHASES.ERROR);
      return;
    }

    setPhase(PHASES.CONNECTING);

    const streamUrl = getApiUrl(`/api/analyze/stream?url=${encodeURIComponent(url.trim())}`);
    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    setPhase(PHASES.FETCHING_CONTEXT);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'METADATA_READY':
            setVideoMeta({
              videoId: data.videoId,
              title: data.title,
              description: data.description,
              channelTitle: data.channelTitle,
              thumbnailUrl: data.thumbnailUrl,
              viewCount: data.viewCount,
              commentCount: data.commentCount,
              hasTranscript: data.hasTranscript,
            });
            setPhase((prev) =>
              prev === PHASES.FETCHING_CONTEXT || prev === PHASES.CONNECTING
                ? PHASES.FETCHING_COMMENTS
                : prev
            );
            break;

          case 'COMMENTS_READY':
            setCommentsCount(data.count);
            setPhase(PHASES.GENERATING_RUBRIC);
            break;

          case 'RUBRIC_READY': {
            const rubricData = {
              video_type: data.video_type,
              video_summary: data.video_summary,
              criteria: data.criteria || [],
            };
            setRubric(rubricData);
            rubricRef.current = rubricData;
            setPhase(PHASES.ANALYZING_JEV);

            // Start Jev high-precision stopwatch
            const startNow = performance.now();
            jevStartTimeRef.current = startNow;
            setJevStartTime(startNow);
            clearTimer();

            timerIntervalRef.current = setInterval(() => {
              if (jevStartTimeRef.current) {
                const ms = Math.round(performance.now() - jevStartTimeRef.current);
                setElapsedMs(ms);
                setElapsedSeconds((ms / 1000).toFixed(3));
              }
            }, 30);
            break;
          }

          case 'ANALYSIS_PROGRESS': {
            const decisions = data.decisionsCount || 0;
            const cost = decisions * JEV_COST_PER_DECISION;
            setJevProgress({
              batchIndex: data.batchIndex,
              totalBatches: data.totalBatches,
              processedCount: data.processedCount,
              totalComments: data.totalComments,
              decisionsCount: decisions,
              estimatedCostUsd: cost,
              costFormatted: formatUsd(cost),
            });
            break;
          }

          case 'COMPLETE': {
            clearTimer();
            let finalMs = 0;
            let finalSec = '0.000';
            if (jevStartTimeRef.current) {
              finalMs = Math.round(performance.now() - jevStartTimeRef.current);
              finalSec = (finalMs / 1000).toFixed(3);
            }
            setElapsedMs(finalMs);
            setElapsedSeconds(finalSec);

            // Compute final decision count & cost
            const totalAnalyzed = data.meta?.totalAnalyzed || commentsCount || 0;
            const criteriaCount = rubricRef.current?.criteria?.length || data.criteria?.length || 4;
            const totalDecisions =
              jevProgressRef.current.decisionsCount > 0
                ? jevProgressRef.current.decisionsCount
                : totalAnalyzed * (4 + criteriaCount);

            const finalCost = totalDecisions * JEV_COST_PER_DECISION;
            const dps = finalMs > 0 ? Math.round(totalDecisions / (finalMs / 1000)) : 0;

            const finalTelemetry = {
              elapsedMs: finalMs,
              elapsedSeconds: finalSec,
              elapsedFormatted: `${finalSec}s`,
              decisionsCount: totalDecisions,
              estimatedCostUsd: finalCost,
              costFormatted: formatUsd(finalCost),
              decisionsPerSec: dps,
              totalComments: totalAnalyzed,
            };

            setTelemetry(finalTelemetry);
            setResults({
              ...data,
              telemetry: finalTelemetry,
            });
            setPhase(PHASES.COMPLETE);
            es.close();
            break;
          }

          case 'ERROR':
            clearTimer();
            setError(data.message || 'An error occurred during analysis');
            setPhase(PHASES.ERROR);
            es.close();
            break;

          default:
            break;
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err, event.data);
      }
    };

    es.onerror = (err) => {
      console.error('SSE connection error:', err);
      clearTimer();
      setPhase((prev) => {
        if (prev === PHASES.COMPLETE) return prev;
        setError('Lost connection to analysis server or request timed out.');
        return PHASES.ERROR;
      });
      es.close();
    };
  }, [reset, clearTimer, commentsCount]);

  return {
    phase,
    videoMeta,
    commentsCount,
    rubric,
    jevStartTime,
    jevProgress,
    results,
    error,
    elapsedSeconds,
    elapsedMs,
    telemetry,
    startAnalysis,
    reset,
  };
}
