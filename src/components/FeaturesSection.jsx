import React from 'react';
import { useScrollZoomGroup, useScrollZoom } from '../hooks/useScrollZoom';

/**
 * Features section with scroll-driven zoom animations on each card.
 */
export default function FeaturesSection() {
  const header = useScrollZoom({ scaleFrom: 0.88, translateY: 40 });
  const { containerRef, getItemStyle } = useScrollZoomGroup({
    scaleFrom: 0.8,
    translateY: 50,
    staggerMs: 100,
  });

  const features = [
    {
      id: 'feature-jwt',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      ),
      iconClass: '',
      title: 'JWT Authorization',
      desc: 'Secure stateless session management with JJWT 0.12.6. Fast token authorization and validation with automated Redis session caching backend.',
    },
    {
      id: 'feature-otp',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      ),
      iconClass: 'cyan',
      title: 'Email OTP Verification',
      desc: 'Mandatory secure sign-up checks verifying accounts via transactional emails powered by Brevo. Zero fake or spam registrations.',
    },
    {
      id: 'feature-oauth',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
      ),
      iconClass: '',
      title: 'Google OAuth2',
      desc: 'One-click single sign-on using Google. Seamless secure Spring Security Integration routing you straight to your active cockpit dashboard.',
    },
    {
      id: 'feature-monitor',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12M12 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
      ),
      iconClass: 'cyan',
      title: '60-Second Monitoring',
      desc: 'Active schedulers check service endpoints continuously using optimized multithreaded pools. Tracks response latency metric curves.',
    },
    {
      id: 'feature-alerts',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      ),
      iconClass: 'green',
      title: 'Instant Down Alerts',
      desc: 'Receives instant transactional email notifications the exact moment a service falls offline, and another the moment it boots back up.',
    },
    {
      id: 'feature-self-heal',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
      ),
      iconClass: 'green',
      title: 'Anti-Sleep Pinger',
      desc: 'Add your hosted backend\'s URL. The scheduler pings it continuously every minute, keeping your cloud instances awake forever.',
      featured: true,
    },
  ];

  return (
    <section className="features" id="features">
      <div className="section-container">
        <div className="section-header" ref={header.ref} style={header.style}>
          <span className="section-tag">Features</span>
          <h2 className="section-title">Everything you need for<br /><span className="gradient-text">reliable service monitoring</span></h2>
          <p className="section-subtitle">Built from scratch with production-grade security, real-time pings, and transactional notifications.</p>
        </div>
        <div className="features-grid" ref={containerRef}>
          {features.map((feat, i) => (
            <div
              key={feat.id}
              className={`feature-card ${feat.featured ? 'featured' : ''}`}
              id={feat.id}
              style={getItemStyle(i)}
            >
              <div className={`feature-icon-wrapper ${feat.iconClass}`}>
                {feat.icon}
              </div>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-desc">{feat.desc}</p>
              {feat.featured && <div className="feature-badge">Automated</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
