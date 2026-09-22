import React from 'react';
import { Activity, ThumbsUp, MessageCircle, HelpCircle, Lightbulb, AlertCircle, CheckCircle, Compass, Heart } from 'lucide-react';

const CATEGORY_META = {
  praise: {
    label: 'Praise & Enthusiasm',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    icon: ThumbsUp,
  },
  experience: {
    label: 'Personal Experiences',
    color: '#0EA5E9',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    icon: Compass,
  },
  question: {
    label: 'Questions & Inquiries',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    icon: HelpCircle,
  },
  suggestion: {
    label: 'Ideas & Suggestions',
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    icon: Lightbulb,
  },
  criticism: {
    label: 'Critique & Friction',
    color: '#EF4444',
    bg: '#FEF2F2',
    border: '#FECACA',
    icon: AlertCircle,
  },
  agreement: {
    label: 'Agreement',
    color: '#14B8A6',
    bg: '#F0FDFA',
    border: '#99F6E4',
    icon: CheckCircle,
  },
  disagreement: {
    label: 'Disagreement',
    color: '#F43F5E',
    bg: '#FFF1F2',
    border: '#FECDD3',
    icon: AlertCircle,
  },
  correction: {
    label: 'Corrections / Bugs',
    color: '#6366F1',
    bg: '#EEF2FF',
    border: '#C7D2FE',
    icon: MessageCircle,
  },
  other: {
    label: 'General / Casual',
    color: '#94A3B8',
    bg: '#F8FAFC',
    border: '#E2E8F0',
    icon: MessageCircle,
  },
};

function formatCount(numStr) {
  const n = parseInt(numStr, 10);
  if (isNaN(n)) return numStr || '';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export function AudiencePulse({ breakdown = {}, total = 0, videoCommentCount = null }) {
  if (!breakdown || total === 0) return null;

  const entries = Object.entries(breakdown)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  const totalStr = formatCount(videoCommentCount);
  const subtitle =
    totalStr && parseInt(videoCommentCount, 10) > total
      ? `Full coverage: ${total.toLocaleString()} accessible comments analyzed out of ${totalStr} total on YouTube`
      : `Full coverage: ${total.toLocaleString()} accessible comments analyzed by intent & sentiment`;

  return (
    <div className="audience-pulse-card" style={{ marginBottom: '28px' }}>
      <div className="audience-pulse-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="pulse-icon-badge">
            <Activity size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Audience Pulse
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              {subtitle}
            </p>
          </div>
        </div>
        <div className="pulse-tag-100">
          ✓ 100% classified
        </div>
      </div>

      {/* Segmented Distribution Bar */}
      <div className="pulse-bar-track">
        {entries.map(([type, count]) => {
          const pct = Math.max(1, Math.round((count / total) * 100));
          const meta = CATEGORY_META[type] || CATEGORY_META.other;
          return (
            <div
              key={type}
              className="pulse-bar-segment"
              style={{
                width: `${(count / total) * 100}%`,
                backgroundColor: meta.color,
              }}
              title={`${meta.label}: ${count} comments (${pct}%)`}
            />
          );
        })}
      </div>

      {/* Interactive Category Chips */}
      <div className="pulse-chips-grid">
        {entries.map(([type, count]) => {
          const pct = Math.round((count / total) * 100);
          const meta = CATEGORY_META[type] || CATEGORY_META.other;
          const Icon = meta.icon;
          return (
            <div
              key={type}
              className="pulse-chip"
              style={{
                backgroundColor: meta.bg,
                borderColor: meta.border,
              }}
            >
              <span className="pulse-chip-icon" style={{ color: meta.color }}>
                <Icon size={13} />
              </span>
              <span className="pulse-chip-name">{meta.label}</span>
              <span className="pulse-chip-count" style={{ color: meta.color }}>
                {count.toLocaleString()}
              </span>
              <span className="pulse-chip-pct">({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
