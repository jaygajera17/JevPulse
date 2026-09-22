import React, { useState } from 'react';
import { Header } from './components/Header';
import { LandingHero } from './components/landing/LandingHero';
import { HowItWorks } from './components/landing/HowItWorks';
import { VideoCard } from './components/analyzing/VideoCard';
import { PipelineStepper } from './components/analyzing/PipelineStepper';
import { RubricReveal } from './components/analyzing/RubricReveal';
import { JevProgress } from './components/analyzing/JevProgress';
import { ResultsHeader } from './components/results/ResultsHeader';
import { TopInsights } from './components/results/TopInsights';
import { ConsensusGrid } from './components/results/ConsensusGrid';
import { WhatViewersWant } from './components/results/WhatViewersWant';
import { AudienceSignals } from './components/results/AudienceSignals';
import { CommentBreakdown } from './components/results/CommentBreakdown';
import { EvidenceDrawer } from './components/shared/EvidenceDrawer';
import { ShareCard } from './components/shared/ShareCard';
import { useSSEAnalysis, PHASES } from './hooks/useSSEAnalysis';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function App() {
  const {
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
  } = useSSEAnalysis();

  const [selectedCriterion, setSelectedCriterion] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const isAnalyzing =
    phase === PHASES.CONNECTING ||
    phase === PHASES.FETCHING_CONTEXT ||
    phase === PHASES.FETCHING_COMMENTS ||
    phase === PHASES.GENERATING_RUBRIC ||
    phase === PHASES.ANALYZING_JEV;

  const isComplete = phase === PHASES.COMPLETE && results;

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
          <div style={{ padding: '32px 0' }}>
            <PipelineStepper phase={phase} />

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

            {(phase === PHASES.ANALYZING_JEV || jevProgress.processedCount > 0) && (
              <JevProgress
                jevProgress={jevProgress}
                totalComments={commentsCount || jevProgress.totalComments || 0}
                elapsedSeconds={elapsedSeconds}
              />
            )}
          </div>
        )}

        {/* Complete Results State */}
        {isComplete && (
          <div style={{ padding: '32px 0' }}>
            <ResultsHeader
              meta={results.meta}
              elapsedSeconds={elapsedSeconds}
              onShare={() => setIsShareOpen(true)}
              onReset={reset}
            />

            <VideoCard meta={results.meta} />

            <TopInsights
              criteria={results.criteria}
              questions={results.signals?.questions}
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

      {/* Share Card Modal */}
      <ShareCard
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        results={results}
      />
    </>
  );
}
