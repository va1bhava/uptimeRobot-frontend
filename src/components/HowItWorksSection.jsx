import React from 'react';
import { useScrollZoomGroup, useScrollZoom } from '../hooks/useScrollZoom';

/**
 * How It Works section with zoom-in timeline animation.
 */
export default function HowItWorksSection() {
  const header = useScrollZoom({ scaleFrom: 0.88, translateY: 40 });
  const { containerRef, getItemStyle } = useScrollZoomGroup({
    scaleFrom: 0.85,
    translateY: 40,
    staggerMs: 150,
  });

  const steps = [
    {
      id: 'step-1',
      number: '01',
      title: 'Create an Account',
      desc: 'Register with OTP code verification or Google Single Sign-On. Your confirmed address is where incident logs are dispatched.',
      method: 'POST',
      methodClass: 'post',
      path: '/auth/send-otp',
    },
    {
      id: 'step-2',
      number: '02',
      title: 'Add Monitor Targets',
      desc: 'Input any web server or database API domain. Set custom labels to organize your stack nodes on the live dashboard panel.',
      method: 'POST',
      methodClass: 'post',
      path: '/addurl',
    },
    {
      id: 'step-3',
      number: '03',
      title: 'Incident Alerts',
      desc: 'No config needed. Pinger logs server metrics on canvas sparklines and tracks uptime status percentages dynamically.',
      method: 'GET',
      methodClass: 'get',
      path: '/geturls',
    },
  ];

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="section-container">
        <div className="section-header" ref={header.ref} style={header.style}>
          <span className="section-tag">Integration</span>
          <h2 className="section-title">Up and running in<br /><span className="gradient-text">three simple steps</span></h2>
        </div>
        <div className="steps-container" ref={containerRef}>
          {steps.map((step, i) => (
            <React.Fragment key={step.id}>
              {i > 0 && <div className="step-connector" style={getItemStyle(i * 2 - 1)}></div>}
              <div className="step" id={step.id} style={getItemStyle(i * 2)}>
                <div className="step-number">{step.number}</div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
                <div className="step-visual">
                  <div className="step-code">
                    <span className={`code-method ${step.methodClass}`}>{step.method}</span>
                    <span className="code-path">{step.path}</span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
