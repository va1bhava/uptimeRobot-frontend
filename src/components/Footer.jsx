import React from 'react';

const ActivityIcon = () => (
  <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

/**
 * Footer component.
 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <ActivityIcon />
            <span className="logo-text">UptimeRobot</span>
          </div>
          <p className="footer-tagline">Open-source node monitoring stack built on Spring &amp; React.</p>
        </div>
        <div className="footer-bottom">
          <p className="footer-credit">Maintained by <a href="https://github.com/va1bhava" target="_blank" rel="noopener noreferrer">Vaibhava</a></p>
          <p className="footer-copy">MIT License — feel free to self-host and clone.</p>
        </div>
      </div>
    </footer>
  );
}
