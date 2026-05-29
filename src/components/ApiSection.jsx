import React from 'react';
import { useScrollZoom } from '../hooks/useScrollZoom';

/**
 * API preview section with code window.
 */
export default function ApiSection() {
  const header = useScrollZoom({ scaleFrom: 0.88, translateY: 40 });
  const preview = useScrollZoom({ scaleFrom: 0.85, translateY: 50, delay: 150 });

  return (
    <section className="api-section" id="api">
      <div className="section-container">
        <div className="section-header" ref={header.ref} style={header.style}>
          <span className="section-tag">API Docs</span>
          <h2 className="section-title">Clean REST endpoints<br /><span className="gradient-text">for external scripting</span></h2>
          <p className="section-subtitle">Simple, stateless request headers. JSON bodies secured with standard auth tokens.</p>
        </div>
        <div className="api-preview" ref={preview.ref} style={preview.style}>
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
                <ApiEndpoint method="POST" path="/uptimerobot/auth/send-otp" auth="Public" />
                <ApiEndpoint method="POST" path="/uptimerobot/auth/verify-otp" auth="Public" />
                <ApiEndpoint method="POST" path="/uptimerobot/auth/login" auth="Public" />
              </div>
              <div className="api-group">
                <div className="api-group-title">Target Registry Controller</div>
                <ApiEndpoint method="POST" path="/uptimerobot/addurl" auth="JWT" />
                <ApiEndpoint method="GET" path="/uptimerobot/geturls" auth="JWT" />
                <ApiEndpoint method="DELETE" path={'/uptimerobot/deleteurl/{id}'} auth="JWT" />
              </div>
              <div className="api-group">
                <div className="api-group-title">System Metrics Controller</div>
                <ApiEndpoint method="GET" path="/uptimerobot/stats" auth="Public" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ApiEndpoint({ method, path, auth }) {
  const methodClass = method.toLowerCase();
  const authClass = auth === 'JWT' ? 'secured' : 'public';

  return (
    <div className="api-endpoint">
      <span className={`method ${methodClass}`}>{method}</span>
      <span className="endpoint-path">{path}</span>
      <span className={`endpoint-auth ${authClass}`}>{auth}</span>
    </div>
  );
}
