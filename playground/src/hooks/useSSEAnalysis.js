import { useState, useRef, useCallback } from 'react';
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

export function useSSEAnalysis() {
  const [phase, setPhase] = useState(PHASES.IDLE);
  const [videoMeta, setVideoMeta] = useState(null);
  const [commentsCount, setCommentsCount] = useState(0);
  const [rubric, setRubric] = useState(null);
  const [jevProgress, setJevProgress] = useState({
    batchIndex: 0,
    totalBatches: 0,
    processedCount: 0,
    totalComments: 0,
    decisionsCount: 0,
  });
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState('0.0');

  const eventSourceRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const jevStartTimeRef = useRef(null);

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
    setElapsedSeconds('0.0');
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

          case 'RUBRIC_READY':
            setRubric({
              video_type: data.video_type,
              video_summary: data.video_summary,
              criteria: data.criteria || [],
            });
            setPhase(PHASES.ANALYZING_JEV);
            // Start Jev stopwatch with 0.1s precision
            jevStartTimeRef.current = performance.now();
            clearTimer();
            timerIntervalRef.current = setInterval(() => {
              if (jevStartTimeRef.current) {
                const sec = (performance.now() - jevStartTimeRef.current) / 1000;
                setElapsedSeconds(sec.toFixed(1));
              }
            }, 50);
            break;

          case 'ANALYSIS_PROGRESS':
            setJevProgress({
              batchIndex: data.batchIndex,
              totalBatches: data.totalBatches,
              processedCount: data.processedCount,
              totalComments: data.totalComments,
              decisionsCount: data.decisionsCount,
            });
            break;

          case 'COMPLETE':
            clearTimer();
            if (jevStartTimeRef.current) {
              const finalSec = (performance.now() - jevStartTimeRef.current) / 1000;
              setElapsedSeconds(finalSec.toFixed(1));
            }
            setResults(data);
            setPhase(PHASES.COMPLETE);
            es.close();
            break;

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
      // If we already finished, ignore error on close
      setPhase((prev) => {
        if (prev === PHASES.COMPLETE) return prev;
        setError('Lost connection to analysis server or request timed out.');
        return PHASES.ERROR;
      });
      es.close();
    };
  }, [reset, clearTimer]);

  return {
    phase,
    videoMeta,
    commentsCount,
    rubric,
    jevProgress,
    results,
    error,
    elapsedSeconds,
    startAnalysis,
    reset,
  };
}
