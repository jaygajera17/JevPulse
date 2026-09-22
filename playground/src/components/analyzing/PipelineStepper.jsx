import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { PHASES } from '../../hooks/useSSEAnalysis';

const STEPS = [
  {
    key: 'context',
    label: 'Video context',
    phases: [PHASES.FETCHING_CONTEXT],
  },
  {
    key: 'comments',
    label: 'Fetch comments',
    phases: [PHASES.FETCHING_COMMENTS],
  },
  {
    key: 'rubric',
    label: 'Identify topics',
    phases: [PHASES.GENERATING_RUBRIC],
  },
  {
    key: 'jev',
    label: 'Analyze opinions',
    phases: [PHASES.ANALYZING_JEV],
  },
  {
    key: 'consensus',
    label: 'Uncover patterns',
    phases: [PHASES.COMPLETE],
  },
];

export function PipelineStepper({ phase }) {
  const getStepStatus = (index) => {
    let activeIndex = 0;
    if (phase === PHASES.FETCHING_CONTEXT || phase === PHASES.CONNECTING) activeIndex = 0;
    else if (phase === PHASES.FETCHING_COMMENTS) activeIndex = 1;
    else if (phase === PHASES.GENERATING_RUBRIC) activeIndex = 2;
    else if (phase === PHASES.ANALYZING_JEV) activeIndex = 3;
    else if (phase === PHASES.COMPLETE) activeIndex = 4;

    if (index < activeIndex) return 'completed';
    if (index === activeIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="stepper-container">
      {STEPS.map((step, idx) => {
        const status = getStepStatus(idx);
        return (
          <React.Fragment key={step.key}>
            <div className={`step-item ${status}`}>
              <div className="step-icon-wrap">
                {status === 'completed' ? (
                  <Check size={14} />
                ) : status === 'active' ? (
                  <Loader2 size={14} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  idx + 1
                )}
              </div>
              <span>{step.label}</span>
            </div>

            {idx < STEPS.length - 1 && (
              <div className={`step-connector ${getStepStatus(idx) === 'completed' ? 'completed' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
