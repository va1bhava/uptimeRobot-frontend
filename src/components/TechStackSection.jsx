import React from 'react';
import { useScrollZoomGroup, useScrollZoom } from '../hooks/useScrollZoom';

/**
 * Tech Stack section with floating badges and scroll-zoom.
 */
export default function TechStackSection() {
  const header = useScrollZoom({ scaleFrom: 0.88, translateY: 40 });
  const { containerRef, getItemStyle } = useScrollZoomGroup({
    scaleFrom: 0.85,
    translateY: 35,
    staggerMs: 70,
  });

  const techs = [
    {
      id: 'tech-spring',
      name: 'Spring Boot',
      version: '4.0.2',
      iconClass: 'green',
      icon: <svg className="tech-icon-svg green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
    },
    {
      id: 'tech-java',
      name: 'Java',
      version: '21 LTS',
      icon: <svg className="tech-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M9 21h6"/></svg>,
    },
    {
      id: 'tech-postgres',
      name: 'PostgreSQL',
      version: '+ Hibernate',
      icon: <svg className="tech-icon-svg cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>,
    },
    {
      id: 'tech-redis',
      name: 'Redis Cache',
      version: 'Sessions',
      icon: <svg className="tech-icon-svg yellow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    },
    {
      id: 'tech-docker',
      name: 'Docker',
      version: 'Containerized',
      icon: <svg className="tech-icon-svg cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
    },
    {
      id: 'tech-brevo',
      name: 'Brevo API',
      version: 'Mail Broker',
      icon: <svg className="tech-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
    },
    {
      id: 'tech-jwt',
      name: 'JJWT Auth',
      version: '0.12.6',
      icon: <svg className="tech-icon-svg green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    },
    {
      id: 'tech-render',
      name: 'Render',
      version: 'Host Platform',
      icon: <svg className="tech-icon-svg yellow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
    },
  ];

  return (
    <section className="tech-stack" id="tech-stack">
      <div className="section-container">
        <div className="section-header" ref={header.ref} style={header.style}>
          <span className="section-tag">Architecture</span>
          <h2 className="section-title">Engineered with<br /><span className="gradient-text">state-of-the-art tools</span></h2>
        </div>
        <div className="tech-grid" ref={containerRef}>
          {techs.map((tech, i) => (
            <div className="tech-badge" id={tech.id} key={tech.id} style={getItemStyle(i)}>
              {tech.icon}
              <div>
                <span className="tech-name">{tech.name}</span>
                <span className="tech-version">{tech.version}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
