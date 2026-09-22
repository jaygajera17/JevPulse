import React, { useState } from 'react';
import { Search, ArrowRight, PlayCircle } from 'lucide-react';

const EXAMPLE_VIDEOS = [
  {
    label: 'Fireship - Jev',
    url: 'https://youtu.be/TbkUKCm3CHQ?si=cVUcARDsDCdYzZ-e',
  },
  {
    label: 'Anthropic - Introducing Fable 5',
    url: 'https://youtu.be/Y9Wz2PV404E?si=XJXyPDSRybcCTTg0',
  },
  {
    label: 'Andrej Karapathy - deep dive into LLMs',
    url: 'https://youtu.be/7xTGNNLPyMI?si=YNguhBMC0ectK4rE',
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
