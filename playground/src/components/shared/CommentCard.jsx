import React from 'react';
import { ThumbsUp, User } from 'lucide-react';

export function CommentCard({ comment, score = null, tag = null }) {
  if (!comment) return null;

  // For agreement, confidence is score (P(YES))
  // For dissent, confidence in opposing stance is (1 - score) (P(NO))
  const confidence =
    score !== null
      ? tag === 'dissent'
        ? Math.round((1 - score) * 100)
        : Math.round(score * 100)
      : null;

  return (
    <div className="comment-item">
      {tag && (
        <div style={{ marginBottom: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              padding: '2px 8px',
              borderRadius: '4px',
              background: tag === 'agree' ? 'var(--pos-green-glow)' : 'var(--neg-red-glow)',
              color: tag === 'agree' ? 'var(--pos-green)' : 'var(--neg-red)',
              fontWeight: 700,
            }}
          >
            {tag === 'agree' ? 'AGREEMENT' : 'DISSENT'}
            {confidence !== null && ` (${confidence}% confidence)`}
          </span>
        </div>
      )}
      <p style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>
        "{comment.text}"
      </p>
      <div className="comment-meta">
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <User size={12} /> {comment.author || 'Anonymous'}
        </span>
        <span className="comment-likes">
          <ThumbsUp size={12} /> {comment.likeCount || 0}
        </span>
      </div>
    </div>
  );
}
