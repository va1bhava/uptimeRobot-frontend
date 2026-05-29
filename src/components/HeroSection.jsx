import React, { useRef, useCallback } from 'react';
import EarthGlobe from './EarthGlobe';
import TerminalWindow from './TerminalWindow';
import StatsBar from './StatsBar';
import { useScrollZoom } from '../hooks/useScrollZoom';

/**
 * Hero section with Earth globe background, terminal, and stats.
 */
export default function HeroSection() {
  const heroRef = useRef(null);

  const handleHeroMouseMove = useCallback((e) => {
    const hero = heroRef.current;
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    hero.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);

  const badge = useScrollZoom({ scaleFrom: 0.9, translateY: 20, delay: 0 });
  const title = useScrollZoom({ scaleFrom: 0.9, translateY: 30, delay: 100 });
  const subtitle = useScrollZoom({ scaleFrom: 0.9, translateY: 30, delay: 200 });
  const actions = useScrollZoom({ scaleFrom: 0.9, translateY: 30, delay: 300 });
  const terminal = useScrollZoom({ scaleFrom: 0.92, translateY: 40, delay: 400 });

  return (
    <section
      className="hero"
      id="hero"
      ref={heroRef}
      onMouseMove={handleHeroMouseMove}
    >
      {/* Animated gradient orbs */}
      <div className="hero-orb hero-orb--1"></div>
      <div className="hero-orb hero-orb--2"></div>
      <div className="hero-orb hero-orb--3"></div>

      {/* Earth Globe Background */}
      <EarthGlobe />

      {/* Cursor-following glow */}
      <div className="hero-cursor-glow"></div>
      <div className="hero-glow"></div>
      <div className="hero-grid-bg"></div>

      <div className="hero-content">
        <div className="hero-badge" ref={badge.ref} style={badge.style}>
          <span className="pulse-dot"></span>
          Real-time checking active
        </div>
        <h1 className="hero-title" ref={title.ref} style={title.style}>
          Never miss a<br />
          <span className="gradient-text">second of downtime</span>
        </h1>
        <p className="hero-subtitle" ref={subtitle.ref} style={subtitle.style}>
          Open-source uptime monitoring backend built with Spring Boot 4 &amp; Java 21.
          Monitor your nodes every 60 seconds. Get instant notifications when services degrade or recover.
        </p>
        <div className="hero-actions" ref={actions.ref} style={actions.style}>
          <a href="login.html" className="btn btn-primary">
            <span>Get Started Free</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="https://github.com/va1bhava" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            <span>Repository</span>
          </a>
        </div>

        {/* Live Terminal Console Preview */}
        <div ref={terminal.ref} style={terminal.style}>
          <TerminalWindow />
        </div>
      </div>

      {/* Live Stats Bar */}
      <StatsBar />
    </section>
  );
}
