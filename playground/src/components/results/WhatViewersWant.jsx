import React from 'react';
import { Lightbulb, HelpCircle } from 'lucide-react';
import { CommentCard } from '../shared/CommentCard';

export function WhatViewersWant({ suggestions = [], questions = [] }) {
  if (suggestions.length === 0 && questions.length === 0) return null;

  return (
    <div style={{ marginBottom: '36px' }}>
      <div className="signals-grid">
        {/* Left Column: 💡 What viewers want */}
        <div className="comment-stream-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--amber-gold)',
              }}
            >
              <Lightbulb size={18} /> 💡 What viewers want
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {suggestions.length} requests
            </span>
          </div>

          {suggestions.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No feature suggestions found in this sample.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {suggestions.map((s, i) => (
                <CommentCard key={i} comment={s} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: ❓ What viewers are asking */}
        <div className="comment-stream-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--jev-cyan)',
              }}
            >
              <HelpCircle size={18} /> ❓ What viewers are asking
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {questions.length} questions
            </span>
          </div>

          {questions.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No common questions identified in this sample.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {questions.map((q, i) => (
                <CommentCard key={i} comment={q} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
