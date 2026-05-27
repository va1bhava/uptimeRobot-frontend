import React, { useState, useEffect, useRef } from 'react';
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

  // Terminal Logs State
  const [terminalLogs, setTerminalLogs] = useState([
    { id: 1, type: 'info', text: 'Initializing UptimeRobot Daemon...' },
    { id: 2, type: 'success', text: 'Redis cache connected (session store).' },
    { id: 3, type: 'info', text: '20-thread scheduler pool booted.' }
  ]);
  const terminalBodyRef = useRef(null);

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
    document.body.className = 'landing-body';
    fetchStats();
    const statsInterval = setInterval(fetchStats, 60000);

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

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

  // Terminal simulation ping loops
  useEffect(() => {
    const urls = [
      'https://github.com',
      'https://api.render.com',
      'https://vercel.com',
      'https://hacker-earth.com',
      'https://spring.io'
    ];
    let counter = 3;
    const interval = setInterval(() => {
      const randomUrl = urls[Math.floor(Math.random() * urls.length)];
      const isOk = Math.random() > 0.12;
      const respTime = Math.floor(Math.random() * 180) + 42;
      const timeStr = new Date().toLocaleTimeString();
      const newLog = {
        id: ++counter,
        time: timeStr,
        text: `GET ${randomUrl} -> ${isOk ? '200 OK' : '504 Gateway Timeout'} (${respTime}ms)`,
        type: isOk ? 'success' : 'warn'
      };
      setTerminalLogs(prev => [...prev.slice(-7), newLog]);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // Auto scroll terminal logs inside the terminal container
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Icons Helper Components
  const ActivityIcon = () => (
    <svg className="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );

  return (
    <>
      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="nav-container">
          <a href="#" className="nav-logo">
            <ActivityIcon />
            <span className="logo-text">UptimeRobot</span>
          </a>
          <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`} id="nav-links">
            <a href="#features" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>How It Works</a>
            <a href="#tech-stack" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Tech Stack</a>
            <a href="#api" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>API</a>
            <a href="login.html" className="nav-cta">Console Dashboard</a>
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
      <section className="hero" id="hero">
        <div className="hero-glow"></div>
        <div className="hero-grid-bg"></div>
        <div className="hero-content">
          <div className="hero-badge fade-in">
            <span className="pulse-dot"></span>
            Real-time checking active
          </div>
          <h1 className="hero-title fade-in">
            Never miss a<br />
            <span className="gradient-text">second of downtime</span>
          </h1>
          <p className="hero-subtitle fade-in">
            Open-source uptime monitoring backend built with Spring Boot 4 & Java 21.
            Monitor your nodes every 60 seconds. Get instant notifications when services degrade or recover.
          </p>
          <div className="hero-actions fade-in">
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
          <div className="terminal-wrapper fade-in">
            <div className="terminal-window">
              <div className="terminal-header">
                <div className="terminal-dots">
                  <span className="red"></span>
                  <span className="yellow"></span>
                  <span className="green"></span>
                </div>
                <div className="terminal-title">uptimerobotd@live.ping</div>
              </div>
              <div className="terminal-body" ref={terminalBodyRef}>
                {terminalLogs.map(log => (
                  <div key={log.id} className="terminal-line">
                    {log.time && <span className="term-time">[{log.time}]</span>}
                    <span className="term-prefix">$</span>
                    <span className={
                      log.type === 'success' ? 'term-success' :
                      log.type === 'warn' ? 'term-warn' :
                      log.type === 'info' ? 'term-info' : ''
                    }>
                      {log.text}
                    </span>
                  </div>
                ))}
                <div className="terminal-line">
                  <span className="term-prefix">$</span>
                  <span className="term-cursor"></span>
                </div>
              </div>
            </div>
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
            <div className="stat-label">Nodes Healthy</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-card">
            <div className="stat-number stat-down" id="stat-down">{animatedDown}</div>
            <div className="stat-label">Nodes Offline</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-card">
            <div className="stat-number stat-interval">60<span className="stat-unit">s</span></div>
            <div className="stat-label">Check Interval</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="section-container">
          <div className="section-header fade-in">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Everything you need for<br /><span className="gradient-text">reliable service monitoring</span></h2>
            <p className="section-subtitle">Built from scratch with production-grade security, real-time pings, and transactional notifications.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card fade-in" id="feature-jwt">
              <div className="feature-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3 className="feature-title">JWT Authorization</h3>
              <p className="feature-desc">Secure stateless session management with JJWT 0.12.6. Fast token authorization and validation with automated Redis session caching backend.</p>
            </div>
            <div className="feature-card fade-in" id="feature-otp">
              <div className="feature-icon-wrapper cyan">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h3 className="feature-title">Email OTP Verification</h3>
              <p className="feature-desc">Mandatory secure sign-up checks verifying accounts via transactional emails powered by Brevo. Zero fake or spam registrations.</p>
            </div>
            <div className="feature-card fade-in" id="feature-oauth">
              <div className="feature-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
              </div>
              <h3 className="feature-title">Google OAuth2</h3>
              <p className="feature-desc">One-click single sign-on using Google. Seamless secure Spring Security Integration routing you straight to your active cockpit dashboard.</p>
            </div>
            <div className="feature-card fade-in" id="feature-monitor">
              <div className="feature-icon-wrapper cyan">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12M12 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
              </div>
              <h3 className="feature-title">60-Second Monitoring</h3>
              <p className="feature-desc">Active schedulers check service endpoints continuously using optimized multithreaded pools. Tracks response latency metric curves.</p>
            </div>
            <div className="feature-card fade-in" id="feature-alerts">
              <div className="feature-icon-wrapper green">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <h3 className="feature-title">Instant Down Alerts</h3>
              <p className="feature-desc">Receives instant transactional email notifications the exact moment a service falls offline, and another the moment it boots back up.</p>
            </div>
            <div className="feature-card featured fade-in" id="feature-self-heal">
              <div className="feature-icon-wrapper green">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              </div>
              <h3 className="feature-title">Anti-Sleep Pinger</h3>
              <p className="feature-desc">Add your hosted backend's URL. The scheduler pings it continuously every minute, keeping your cloud instances awake forever.</p>
              <div className="feature-badge">Automated</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-container">
          <div className="section-header fade-in">
            <span className="section-tag">Integration</span>
            <h2 className="section-title">Up and running in<br /><span className="gradient-text">three simple steps</span></h2>
          </div>
          <div className="steps-container">
            <div className="step fade-in" id="step-1">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3 className="step-title">Create an Account</h3>
                <p className="step-desc">Register with OTP code verification or Google Single Sign-On. Your confirmed address is where incident logs are dispatched.</p>
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
                <h3 className="step-title">Add Monitor Targets</h3>
                <p className="step-desc">Input any web server or database API domain. Set custom labels to organize your stack nodes on the live dashboard panel.</p>
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
                <h3 className="step-title">Incident Alerts</h3>
                <p className="step-desc">No config needed. Pinger logs server metrics on canvas sparklines and tracks uptime status percentages dynamically.</p>
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
            <span className="section-tag">Architecture</span>
            <h2 className="section-title">Engineered with<br /><span className="gradient-text">state-of-the-art tools</span></h2>
          </div>
          <div className="tech-grid fade-in">
            <div className="tech-badge" id="tech-spring">
              <svg className="tech-icon-svg green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <div>
                <span className="tech-name">Spring Boot</span>
                <span className="tech-version">4.0.2</span>
              </div>
            </div>
            <div className="tech-badge" id="tech-java">
              <svg className="tech-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M9 21h6"/></svg>
              <div>
                <span className="tech-name">Java</span>
                <span className="tech-version">21 LTS</span>
              </div>
            </div>
            <div className="tech-badge" id="tech-postgres">
              <svg className="tech-icon-svg cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>
              <div>
                <span className="tech-name">PostgreSQL</span>
                <span className="tech-version">+ Hibernate</span>
              </div>
            </div>
            <div className="tech-badge" id="tech-redis">
              <svg className="tech-icon-svg yellow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <div>
                <span className="tech-name">Redis Cache</span>
                <span className="tech-version">Sessions</span>
              </div>
            </div>
            <div className="tech-badge" id="tech-docker">
              <svg className="tech-icon-svg cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
              <div>
                <span className="tech-name">Docker</span>
                <span className="tech-version">Containerized</span>
              </div>
            </div>
            <div className="tech-badge" id="tech-brevo">
              <svg className="tech-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              <div>
                <span className="tech-name">Brevo API</span>
                <span className="tech-version">Mail Broker</span>
              </div>
            </div>
            <div className="tech-badge" id="tech-jwt">
              <svg className="tech-icon-svg green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <div>
                <span className="tech-name">JJWT Auth</span>
                <span className="tech-version">0.12.6</span>
              </div>
            </div>
            <div className="tech-badge" id="tech-render">
              <svg className="tech-icon-svg yellow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <div>
                <span className="tech-name">Render</span>
                <span className="tech-version">Host Platform</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Preview */}
      <section className="api-section" id="api">
        <div className="section-container">
          <div className="section-header fade-in">
            <span className="section-tag">API Docs</span>
            <h2 className="section-title">Clean REST endpoints<br /><span className="gradient-text">for external scripting</span></h2>
            <p className="section-subtitle">Simple, stateless request headers. JSON bodies secured with standard auth tokens.</p>
          </div>
          <div className="api-preview fade-in">
            <div className="api-window">
              <div className="api-titlebar">
                <div className="api-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <span className="api-filename">Endpoints Schema</span>
              </div>
              <div className="api-content">
                <div className="api-group">
                  <div className="api-group-title">Authentication Controller</div>
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
                  <div className="api-group-title">Target Registry Controller</div>
                  <div className="api-endpoint">
                    <span className="method post">POST</span>
                    <span className="endpoint-path">/uptimerobot/addurl</span>
                    <span className="endpoint-auth secured">JWT</span>
                  </div>
                  <div className="api-endpoint">
                    <span className="method get">GET</span>
                    <span className="endpoint-path">/uptimerobot/geturls</span>
                    <span className="endpoint-auth secured">JWT</span>
                  </div>
                  <div className="api-endpoint">
                    <span className="method delete">DELETE</span>
                    <span className="endpoint-path">/uptimerobot/deleteurl/{"{id}"}</span>
                    <span className="endpoint-auth secured">JWT</span>
                  </div>
                </div>
                <div className="api-group">
                  <div className="api-group-title">System Metrics Controller</div>
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
            <h2 className="cta-title">Ready to secure your pings?</h2>
            <p className="cta-subtitle">Deploy monitoring slots in seconds. Free, open-source, and developer-focused.</p>
            <div className="cta-actions">
              <a href="login.html" className="btn btn-primary btn-lg">
                <span>Start Monitoring Nodes</span>
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
              <ActivityIcon />
              <span className="logo-text">UptimeRobot</span>
            </div>
            <p className="footer-tagline">Open-source node monitoring stack built on Spring & React.</p>
          </div>
          <div className="footer-bottom">
            <p className="footer-credit">Maintained by <a href="https://github.com/va1bhava" target="_blank" rel="noopener noreferrer">Vaibhava</a></p>
            <p className="footer-copy">MIT License — feel free to self-host and clone.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
