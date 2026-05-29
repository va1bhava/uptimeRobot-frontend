import React from 'react';
import { useScrollZoom } from '../hooks/useScrollZoom';

/**
 * CTA section with zoom + glow pulse animation.
 */
export default function CtaSection() {
  const cta = useScrollZoom({ scaleFrom: 0.85, translateY: 50 });

  return (
    <section className="cta-section" id="cta">
      <div className="section-container">
        <div className="cta-card" ref={cta.ref} style={cta.style}>
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
  );
}
