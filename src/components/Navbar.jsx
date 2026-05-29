import React from 'react';

const ActivityIcon = () => (
  <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

/**
 * Navigation bar — memoized to prevent re-renders from counter animations.
 */
const Navbar = React.memo(function Navbar({ isScrolled, isMobileMenuOpen, onToggleMobileMenu }) {
  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="nav-container">
        <a href="#" className="nav-logo">
          <ActivityIcon />
          <span className="logo-text">UptimeRobot</span>
        </a>
        <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`} id="nav-links">
          <a href="#features" className="nav-link" onClick={() => onToggleMobileMenu(false)}>Features</a>
          <a href="#how-it-works" className="nav-link" onClick={() => onToggleMobileMenu(false)}>How It Works</a>
          <a href="#tech-stack" className="nav-link" onClick={() => onToggleMobileMenu(false)}>Tech Stack</a>
          <a href="#api" className="nav-link" onClick={() => onToggleMobileMenu(false)}>API</a>
          <a href="login.html" className="nav-cta">Console Dashboard</a>
        </div>
        <button
          className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          id="mobile-toggle"
          aria-label="Toggle menu"
          onClick={() => onToggleMobileMenu(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
});

export default Navbar;
