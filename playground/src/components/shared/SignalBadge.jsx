import React from 'react';

/**
 * Signal strength badge based on number of evaluated comments:
 * < 10: "Insufficient"
 * 10 - 29: "Emerging"
 * 30 - 99: "Moderate"
 * 100+: "Strong signal"
 */
export function SignalBadge({ count = 0 }) {
  let label = 'Insufficient';
  let badgeClass = 'insufficient';

  if (count >= 100) {
    label = 'Strong Signal';
    badgeClass = 'strong';
  } else if (count >= 30) {
    label = 'Moderate';
    badgeClass = 'moderate';
  } else if (count >= 10) {
    label = 'Emerging';
    badgeClass = 'emerging';
  }

  return (
    <span className={`signal-badge ${badgeClass}`} title={`${count} substantive opinions evaluated`}>
      <span style={{ fontSize: '10px' }}>●</span> {label} ({count})
    </span>
  );
}
