import React from 'react';
import { Eye, MessageSquare, Check, FileText } from 'lucide-react';

function formatNumber(numStr) {
  const n = parseInt(numStr, 10);
  if (isNaN(n)) return numStr || '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export function VideoCard({ meta }) {
  if (!meta) return null;

  const title = meta.title || meta.videoTitle || 'Loading video details...';
  const channelTitle = meta.channelTitle || 'YouTube Channel';
  const videoId = meta.videoId || '';
  const thumbnailUrl =
    meta.thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '');
  const hasTranscript = meta.hasTranscript ?? Boolean(meta.transcript);

  return (
    <div className="video-card">
      <div className="video-thumb-container">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="video-thumb"
            onError={(e) => {
              if (videoId) {
                e.target.src = `https://img.youtube.com/vi/${videoId}/0.jpg`;
              }
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            Loading thumbnail...
          </div>
        )}
        <div className="video-thumb-badge">HD</div>
      </div>

      <div className="video-meta">
        <h3 className="video-title">{title}</h3>
        <p className="video-channel">{channelTitle}</p>

        <div className="video-stats-bar">
          <div className="video-stats-item">
            <Eye size={14} />
            <span>{formatNumber(meta.viewCount)} views</span>
          </div>
          <div className="video-stats-item">
            <MessageSquare size={14} />
            <span>{formatNumber(meta.commentCount)} comments</span>
          </div>
          {hasTranscript && (
            <div
              className="video-stats-item"
              style={{ color: 'var(--pos-green)', background: 'var(--pos-green-glow)', padding: '2px 8px', borderRadius: '4px' }}
            >
              <FileText size={13} />
              <span>Transcript Indexed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
