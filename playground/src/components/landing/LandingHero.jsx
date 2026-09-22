import React, { useState } from 'react';
import { Search, ArrowRight, PlayCircle } from 'lucide-react';

const EXAMPLE_VIDEOS = [
  {
    label: 'Indian Dad ChatGPT (Demo)',
    url: 'https://youtu.be/33s2ZPOwIVE',
  },
  {
    label: 'Tech Announcement Review',
    url: 'https://youtu.be/33s2ZPOwIVE?si=1hQGQ6hPnF4HJGwi',
  },
  {
    label: 'Viral Product Showcase',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
];

export function LandingHero({ onAnalyze, isLoading = false }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onAnalyze(url.trim());
    }
  };

  const handleSelectExample = (exampleUrl) => {
    setUrl(exampleUrl);
    onAnalyze(exampleUrl);
  };

  return (
    <section className="hero-section">
      <h1 className="hero-title">
        What does the internet <br />
        actually think?
      </h1>

      <p className="hero-description">
        Skip the comment section. Paste a YouTube video and see what commenters agree on, disagree about, ask, and want.
      </p>

      <form className="search-container" onSubmit={handleSubmit}>
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Paste any YouTube video link"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="search-btn" disabled={!url.trim() || isLoading}>
            {isLoading ? (
              'Reading...'
            ) : (
              <>
                See what people think <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="example-section">
        <span className="example-label">Try an example:</span>
        {EXAMPLE_VIDEOS.map((ex, idx) => (
          <button
            key={idx}
            type="button"
            className="example-chip"
            onClick={() => handleSelectExample(ex.url)}
            disabled={isLoading}
          >
            <PlayCircle size={13} color="var(--jev-cyan)" />
            {ex.label}
          </button>
        ))}
      </div>
    </section>
  );
}
