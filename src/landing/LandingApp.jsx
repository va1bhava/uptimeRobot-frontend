import React, { useState, useEffect } from 'react';
import '../styles/landing.css';

const API_BACKEND = 'https://uptimerobot-xvf5.onrender.com';

function useAnimatedCounter(targetValue, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = value;
    if (startValue === targetValue) return;

    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const current = Math.round(startValue + (targetValue - startValue) * eased);
      setValue(current);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [targetValue, duration]);

  return value;
}

export default function LandingApp() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Live stats state
  const [rawStats, setRawStats] = useState({ totalUrls: 0, urlsUp: 0, urlsDown: 0 });
  
  // Animated counters
  const animatedTotal = useAnimatedCounter(rawStats.totalUrls);
  const animatedUp = useAnimatedCounter(rawStats.urlsUp);
  const animatedDown = useAnimatedCounter(rawStats.urlsDown);

  // Fetch stats from backend
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BACKEND}/uptimerobot/stats`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setRawStats({
        totalUrls: data.totalUrls ?? 0,
        urlsUp: data.urlsUp ?? 0,
        urlsDown: data.urlsDown ?? 0
      });
    } catch (error) {
      console.warn('Stats fetch failed:', error.message);
    }
  };

  useEffect(() => {
    // Set landing body class
    document.body.className = 'landing-body';
    
    // Initial fetch
    fetchStats();

    // Poll every 60s
    const statsInterval = setInterval(fetchStats, 60000);

    // Scroll listener for navbar
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Intersection observer for fade-in animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    document.querySelectorAll('.fade-in').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      clearInterval(statsInterval);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      document.body.className = '';
    };
  }, []);

  return (
    <>
      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="nav-container">
          <a href="#" className="nav-logo">
            <span className="logo-icon">🤖</span>
            <span className="logo-text">UptimeRobot</span>
          </a>
          <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`} id="nav-links">
            <a href="#features" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>How It Works</a>
            <a href="#tech-stack" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Tech Stack</a>
            <a href="#api" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>API</a>
            <a href="login.html" className="nav-cta">Open Dashboard →</a>
          </div>
          <button 
            className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`} 
            id="mobile-toggle" 
            aria-label="Toggle menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section class="hero" id="hero">
        <div className="hero-glow"></div>
        <div className="hero-grid-bg"></div>
        <div className="hero-content">
          <div className="hero-badge fade-in">
            <span className="pulse-dot"></span>
            Monitoring in real-time
          </div>
          <h1 className="hero-title fade-in">
            Never miss a<br />
            <span className="gradient-text">second of downtime</span>
          </h1>
          <p className="hero-subtitle fade-in">
            Open-source uptime monitoring backend built with Spring Boot 4 & Java 21.
            Monitor your URLs every 60 seconds. Get instant alerts when sites go down or recover.
          </p>
          <div className="hero-actions fade-in">
            <a href="login.html" className="btn btn-primary">
              <span>Get Started Free</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a href="https://github.com/va1bhava" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span>View on GitHub</span>
            </a>
          </div>
        </div>

        {/* Live Stats Bar */}
        <div className="stats-bar fade-in" id="stats-bar">
          <div className="stat-card">
            <div className="stat-number" id="stat-total">{animatedTotal}</div>
            <div className="stat-label">URLs Monitored</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-card">
            <div className="stat-number stat-up" id="stat-up">{animatedUp}</div>
            <div className="stat-label">Currently Up</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-card">
            <div className="stat-number stat-down" id="stat-down">{animatedDown}</div>
            <div className="stat-label">Currently Down</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-card">
            <div className="stat-number stat-interval">60<span className="stat-unit">s</span></div>
            <div className="stat-label">Ping Interval</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="section-container">
          <div className="section-header fade-in">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Everything you need for<br /><span className="gradient-text">reliable uptime monitoring</span></h2>
            <p className="section-subtitle">Built from scratch with production-grade security, real-time alerts, and zero configuration overhead.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card fade-in" id="feature-jwt">
              <div className="feature-icon">🔐</div>
              <h3 className="feature-title">JWT Authentication</h3>
              <p className="feature-desc">Secure stateless authentication with JJWT 0.12.6. Session management via Redis with automatic expiry and refresh token rotation.</p>
            </div>
            <div className="feature-card fade-in" id="feature-otp">
              <div className="feature-icon">📧</div>
              <h3 className="feature-title">Email OTP Verification</h3>
              <p className="feature-desc">Every account is verified via email OTP before creation using Brevo API. No fake accounts, no spam — only verified users get alerts.</p>
            </div>
            <div className="feature-card fade-in" id="feature-oauth">
              <div className="feature-icon">🔑</div>
              <h3 className="feature-title">Google OAuth2</h3>
              <p className="feature-desc">One-click sign in with Google SSO. Spring OAuth2 Client handles the entire flow — no passwords needed.</p>
            </div>
            <div className="feature-card fade-in" id="feature-monitor">
              <div className="feature-icon">📡</div>
              <h3 className="feature-title">60-Second Monitoring</h3>
              <p className="feature-desc">Scheduled pinger hits all monitored URLs every 60 seconds using a 20-thread pool. Response time, status, and timestamps — all tracked.</p>
            </div>
            <div className="feature-card fade-in" id="feature-alerts">
              <div className="feature-icon">🔔</div>
              <h3 className="feature-title">Instant Down/Up Alerts</h3>
              <p className="feature-desc">Get an email the moment your site goes down — and another when it recovers. Powered by Brevo's transactional email API.</p>
            </div>
            <div className="feature-card featured fade-in" id="feature-self-heal">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">Self-Healing</h3>
              <p className="feature-desc">Add your own backend URL as a monitored URL. The scheduler pings it every 60 seconds, keeping your free Render instance warm forever.</p>
              <div className="feature-badge">Smart</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-container">
          <div className="section-header fade-in">
            <span className="section-tag">How It Works</span>
            <h2 className="section-title">Up and running in<br /><span className="gradient-text">three simple steps</span></h2>
          </div>
          <div className="steps-container">
            <div className="step fade-in" id="step-1">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3 className="step-title">Create an Account</h3>
                <p className="step-desc">Sign up with email + OTP verification or use Google OAuth2 for instant access. Your email is where alerts get delivered.</p>
              </div>
              <div className="step-visual">
                <div className="step-code">
                  <span className="code-method post">POST</span>
                  <span className="code-path">/auth/send-otp</span>
                </div>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step fade-in" id="step-2">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3 className="step-title">Add Your URLs</h3>
                <p className="step-desc">Add any URL you want monitored. Each user manages their own list. Add as many as you need — we ping them all.</p>
              </div>
              <div className="step-visual">
                <div className="step-code">
                  <span className="code-method post">POST</span>
                  <span className="code-path">/addurl</span>
                </div>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step fade-in" id="step-3">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3 className="step-title">Get Instant Alerts</h3>
                <p className="step-desc">Sit back. Every 60 seconds we ping your URLs. If something goes down — you'll know within a minute via email.</p>
              </div>
              <div className="step-visual">
                <div className="step-code">
                  <span className="code-method get">GET</span>
                  <span className="code-path">/geturls</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="tech-stack" id="tech-stack">
        <div className="section-container">
          <div className="section-header fade-in">
            <span className="section-tag">Tech Stack</span>
            <h2 className="section-title">Built with<br /><span className="gradient-text">production-grade tools</span></h2>
          </div>
          <div className="tech-grid fade-in">
            <div className="tech-badge" id="tech-spring">
              <span className="tech-icon">🍃</span>
              <div>
                <span className="tech-name">Spring Boot</span>
                <span className="tech-version">4.0.2</span>
              </div>
            </div>
            <div className="tech-badge" id="tech-java">
              <span className="tech-icon">☕</span>
              <div>
                <span className="tech-name">Java</span>
                <span className="tech-version">21 LTS</span>
              </div>
            </div>
            <div className="tech-badge" id="tech-postgres">
              <span className="tech-icon">🐘</span>
              <div>
                <span className="tech-name">PostgreSQL</span>
                <span className="tech-version">+ JPA</span>
              </div>
            </div>
            <div className="tech-badge" id="tech-redis">
              <span className="tech-icon">⚡</span>
              <div>
                <span className="tech-name">Redis</span>
                <span className="tech-version">Sessions</span>
              </div>
            </div>
            <div className="tech-badge" id="tech-docker">
              <span className="tech-icon">🐳</span>
              <div>
                <span className="tech-name">Docker</span>
                <span className="tech-version">Containerized</span>
              </div>
            </div>
            <div className="tech-badge" id="tech-brevo">
              <span className="tech-icon">📨</span>
              <div>
                <span className="tech-name">Brevo</span>
                <span className="tech-version">Email API</span>
              </div>
            </div>
            <div className="tech-badge" id="tech-jwt">
              <span className="tech-icon">🔒</span>
              <div>
                <span className="tech-name">JJWT</span>
                <span className="tech-version">0.12.6</span>
              </div>
            </div>
            <div className="tech-badge" id="tech-render">
              <span className="tech-icon">☁️</span>
              <div>
                <span className="tech-name">Render</span>
                <span className="tech-version">Deployed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Preview */}
      <section className="api-section" id="api">
        <div className="section-container">
          <div className="section-header fade-in">
            <span className="section-tag">API</span>
            <h2 className="section-title">Clean REST API<br /><span className="gradient-text">ready to integrate</span></h2>
            <p className="section-subtitle">Simple, well-structured endpoints. JWT-secured where it matters, public where it should be.</p>
          </div>
          <div className="api-preview fade-in">
            <div className="api-window">
              <div className="api-titlebar">
                <div className="api-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <span className="api-filename">API Endpoints</span>
              </div>
              <div className="api-content">
                <div className="api-group">
                  <div className="api-group-title">Authentication</div>
                  <div className="api-endpoint">
                    <span className="method post">POST</span>
                    <span className="endpoint-path">/uptimerobot/auth/send-otp</span>
                    <span className="endpoint-auth public">Public</span>
                  </div>
                  <div className="api-endpoint">
                    <span className="method post">POST</span>
                    <span className="endpoint-path">/uptimerobot/auth/verify-otp</span>
                    <span className="endpoint-auth public">Public</span>
                  </div>
                  <div className="api-endpoint">
                    <span className="method post">POST</span>
                    <span className="endpoint-path">/uptimerobot/auth/login</span>
                    <span className="endpoint-auth public">Public</span>
                  </div>
                </div>
                <div className="api-group">
                  <div className="api-group-title">URL Monitoring</div>
                  <div className="api-endpoint">
                    <span className="method post">POST</span>
                    <span className="endpoint-path">/uptimerobot/addurl</span>
                    <span className="endpoint-auth secured">JWT 🔒</span>
                  </div>
                  <div className="api-endpoint">
                    <span className="method get">GET</span>
                    <span className="endpoint-path">/uptimerobot/geturls</span>
                    <span className="endpoint-auth secured">JWT 🔒</span>
                  </div>
                  <div className="api-endpoint">
                    <span className="method delete">DELETE</span>
                    <span className="endpoint-path">/uptimerobot/deleteurl/{"{id}"}</span>
                    <span className="endpoint-auth secured">JWT 🔒</span>
                  </div>
                </div>
                <div className="api-group">
                  <div className="api-group-title">Public Stats</div>
                  <div className="api-endpoint">
                    <span className="method get">GET</span>
                    <span className="endpoint-path">/uptimerobot/stats</span>
                    <span className="endpoint-auth public">Public</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta">
        <div className="section-container">
          <div className="cta-card fade-in">
            <div className="cta-glow"></div>
            <h2 className="cta-title">Ready to monitor your uptime?</h2>
            <p className="cta-subtitle">Start monitoring your websites in under a minute. Free, open-source, and self-hostable.</p>
            <div className="cta-actions">
              <a href="login.html" className="btn btn-primary btn-lg">
                <span>Start Monitoring →</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <span className="logo-icon">🤖</span>
              <span className="logo-text">UptimeRobot</span>
            </div>
            <p className="footer-tagline">Open-source uptime monitoring built with Spring Boot 4 & Java 21</p>
          </div>
          <div className="footer-bottom">
            <p className="footer-credit">Built by <a href="https://github.com/va1bhava" target="_blank" rel="noopener noreferrer">Vaibhava</a></p>
            <p className="footer-copy">MIT License — feel free to use, modify and build on top.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
