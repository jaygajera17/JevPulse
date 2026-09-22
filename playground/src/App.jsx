import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { LandingHero } from './components/landing/LandingHero';
import { HowItWorks } from './components/landing/HowItWorks';
import { VideoCard } from './components/analyzing/VideoCard';
import { PipelineStepper } from './components/analyzing/PipelineStepper';
import { RubricReveal } from './components/analyzing/RubricReveal';
import { JevMissionControl } from './components/analyzing/JevMissionControl';
import { ResultsHeader } from './components/results/ResultsHeader';
import { TopInsights } from './components/results/TopInsights';
import { ConsensusGrid } from './components/results/ConsensusGrid';
import { WhatViewersWant } from './components/results/WhatViewersWant';
import { AudienceSignals } from './components/results/AudienceSignals';
import { AudiencePulse } from './components/results/AudiencePulse';
import { CommentBreakdown } from './components/results/CommentBreakdown';
import { EvidenceDrawer } from './components/shared/EvidenceDrawer';
import { useSSEAnalysis, PHASES } from './hooks/useSSEAnalysis';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function App() {
  const {
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
  } = useSSEAnalysis();

  const [selectedCriterion, setSelectedCriterion] = useState(null);
  const missionControlRef = useRef(null);

  const isAnalyzing =
    phase === PHASES.CONNECTING ||
    phase === PHASES.FETCHING_CONTEXT ||
    phase === PHASES.FETCHING_COMMENTS ||
    phase === PHASES.GENERATING_RUBRIC ||
    phase === PHASES.ANALYZING_JEV;

  const isComplete = phase === PHASES.COMPLETE && results;

  // Auto-scroll to Mission Control when Jev analysis begins so user focuses on the real-time USP
  useEffect(() => {
    if (phase === PHASES.ANALYZING_JEV) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [phase]);

  return (
    <>
      <Header
        onReset={reset}
        showReset={isAnalyzing || isComplete || phase === PHASES.ERROR}
      />

      <main className="app-container" style={{ paddingBottom: '64px' }}>
        {/* Error Alert */}
        {phase === PHASES.ERROR && (
          <div
            style={{
              margin: '32px 0',
              padding: '20px 24px',
              background: 'var(--neg-red-glow)',
              border: '1px solid var(--neg-red)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle color="var(--neg-red)" size={24} />
              <div>
                <h4 style={{ color: 'var(--neg-red)', fontWeight: 700 }}>Analysis Encountered an Error</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {error || 'An unexpected error occurred while analyzing comments.'}
                </p>
              </div>
            </div>
            <button className="btn-secondary" onClick={reset}>
              <RotateCcw size={14} /> Try Again
            </button>
          </div>
        )}

        {/* Landing State */}
        {phase === PHASES.IDLE && (
          <>
            <LandingHero onAnalyze={startAnalysis} isLoading={false} />
            <HowItWorks />
          </>
        )}

        {/* Live Analyzing State */}
        {isAnalyzing && (
          <div style={{ padding: '32px 0' }} ref={missionControlRef}>
            <PipelineStepper phase={phase} />

            {/* During JEV analysis, show Mission Control front-and-center so user never has to scroll */}
            {phase === PHASES.ANALYZING_JEV ? (
              <JevMissionControl
                videoMeta={videoMeta}
                rubric={rubric}
                jevProgress={jevProgress}
                totalComments={commentsCount || jevProgress.totalComments || 0}
                jevStartTime={jevStartTime}
                elapsedSeconds={elapsedSeconds}
                elapsedMs={elapsedMs}
                isComplete={false}
              />
            ) : (
              <>
                {videoMeta ? (
                  <VideoCard meta={videoMeta} />
                ) : (
                  <div
                    style={{
                      padding: '32px',
                      textAlign: 'center',
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '24px',
                    }}
                  >
                    <p style={{ color: 'var(--text-secondary)' }}>Connecting to YouTube stream...</p>
                  </div>
                )}

                {rubric && <RubricReveal rubric={rubric} />}
              </>
            )}
          </div>
        )}

        {/* Complete Results State */}
        {isComplete && (
          <div style={{ padding: '32px 0' }}>
            <ResultsHeader
              meta={results.meta}
              elapsedSeconds={elapsedSeconds}
              telemetry={telemetry || results.telemetry}
              onReset={reset}
            />

            <VideoCard
              meta={{
                ...videoMeta,
                ...results.meta,
                title: results.meta?.title || results.meta?.videoTitle || videoMeta?.title,
                channelTitle: results.meta?.channelTitle || videoMeta?.channelTitle,
                thumbnailUrl: results.meta?.thumbnailUrl || videoMeta?.thumbnailUrl,
                hasTranscript: results.meta?.hasTranscript ?? videoMeta?.hasTranscript,
              }}
            />

            <AudiencePulse
              breakdown={results.typeBreakdown}
              total={results.meta?.totalAnalyzed || commentsCount || 0}
              videoCommentCount={videoMeta?.commentCount || results.meta?.commentCount}
            />

            <TopInsights
              criteria={results.criteria}
              questions={results.signals?.questions}
              suggestions={results.signals?.suggestions}
              onSelectCriterion={setSelectedCriterion}
            />

            <ConsensusGrid
              criteria={results.criteria}
              onSelectCriterion={setSelectedCriterion}
            />

            <WhatViewersWant
              suggestions={results.signals?.suggestions}
              questions={results.signals?.questions}
            />

            <AudienceSignals
              praises={results.signals?.praises}
              criticisms={results.signals?.criticisms}
            />

            <CommentBreakdown
              breakdown={results.typeBreakdown}
              total={results.meta?.totalAnalyzed || commentsCount || 0}
            />

            <HowItWorks />
          </div>
        )}
      </main>

      {/* Slide-out Evidence Drawer */}
      <EvidenceDrawer
        isOpen={Boolean(selectedCriterion)}
        onClose={() => setSelectedCriterion(null)}
        criterion={selectedCriterion}
      />

    </>
  );
}
