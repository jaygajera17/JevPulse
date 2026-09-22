import React from 'react';
import { ThumbsUp, User } from 'lucide-react';

export function CommentCard({ comment, score = null, tag = null }) {
  if (!comment) return null;

  return (
    <div className="comment-item">
      {tag && (
        <div style={{ marginBottom: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              padding: '2px 6px',
              borderRadius: '4px',
              background: tag === 'agree' ? 'var(--pos-green-glow)' : 'var(--neg-red-glow)',
              color: tag === 'agree' ? 'var(--pos-green)' : 'var(--neg-red)',
              fontWeight: 600,
            }}
          >
            {tag === 'agree' ? 'AGREEMENT' : 'DISSENT'}
            {score !== null && ` (${Math.round(score * 100)}%)`}
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
