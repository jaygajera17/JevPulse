import React, { useState } from 'react';
import { ArrowRight, PlayCircle, FileText, Cpu, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

export function HowItWorks() {
  const [showTechnical, setShowTechnical] = useState(false);

  const steps = [
    {
      icon: <PlayCircle size={22} color="#EF4444" />,
      title: '1. Understand the video',
      desc: 'Ingests video title, description & subtitles excerpt',
    },
    {
      icon: <FileText size={22} color="var(--rubric-purple)" />,
      title: '2. Figure out what matters',
      desc: 'Creates custom video-specific criteria tailored to the content',
    },
    {
      icon: <Cpu size={22} color="var(--jev-cyan)" />,
      title: '3. Analyze the comments',
      desc: 'Jev evaluates thousands of tiny decisions in parallel',
    },
    {
      icon: <BarChart3 size={22} color="var(--pos-green)" />,
      title: '4. Find the patterns',
      desc: 'Surfaces agreement, division, viewer requests & questions',
    },
  ];

  return (
    <div className="how-it-works-box">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
            How it works
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
            From raw YouTube comments to structured audience consensus in seconds
          </p>
        </div>

        <button
          className="btn-secondary"
          onClick={() => setShowTechnical(!showTechnical)}
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          {showTechnical ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showTechnical ? 'Hide technical details' : 'Technical details'}
        </button>
      </div>

      <div className="flow-diagram">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flow-node">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                {step.icon}
              </div>
              <div className="flow-node-title">{step.title}</div>
              <div className="flow-node-sub">{step.desc}</div>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight className="flow-arrow" size={18} />
            )}
          </React.Fragment>
        ))}
      </div>

      {showTechnical && (
        <div
          style={{
            marginTop: '20px',
            padding: '16px',
            background: '#F8F9FC',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Under the hood:
          </div>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li><strong>YouTube Ingestion:</strong> Parallel fetch of video statistics, snippet, subtitles and up to 500 top-level comments.</li>
            <li><strong>Topic Calibration:</strong> Gemini analyzes video context and formulates calibrated <code>true_criteria</code> & <code>false_criteria</code> bounds.</li>
            <li><strong>Jev System One:</strong> Bounded concurrency pool executes typed <code>noul</code>, <code>choice</code>, and <code>score</code> questions concurrently at ultra-low latency.</li>
            <li><strong>Consensus Synthesis:</strong> Opinion filtering and intensity scoring aggregate individual comment decisions into calibrated consensus percentages.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
