import React, { useState, useEffect, useRef } from 'react';

/**
 * Live terminal mock ping window.
 * Self-contained state — ping simulation runs independently.
 */
const TerminalWindow = React.memo(function TerminalWindow() {
  const [terminalLogs, setTerminalLogs] = useState([
    { id: 1, type: 'info', text: 'Initializing UptimeRobot Daemon...' },
    { id: 2, type: 'success', text: 'Redis cache connected (session store).' },
    { id: 3, type: 'info', text: '20-thread scheduler pool booted.' }
  ]);
  const terminalBodyRef = useRef(null);
  const counterRef = useRef(3);

  // Terminal simulation ping loops
  useEffect(() => {
    const urls = [
      'https://github.com',
      'https://api.render.com',
      'https://vercel.com',
      'https://hacker-earth.com',
      'https://spring.io'
    ];

    const interval = setInterval(() => {
      const randomUrl = urls[Math.floor(Math.random() * urls.length)];
      const isOk = Math.random() > 0.12;
      const respTime = Math.floor(Math.random() * 180) + 42;
      const timeStr = new Date().toLocaleTimeString();
      const newLog = {
        id: ++counterRef.current,
        time: timeStr,
        text: `GET ${randomUrl} -> ${isOk ? '200 OK' : '504 Gateway Timeout'} (${respTime}ms)`,
        type: isOk ? 'success' : 'warn'
      };
      setTerminalLogs(prev => [...prev.slice(-7), newLog]);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // Auto scroll terminal
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  return (
    <div className="terminal-wrapper">
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
  );
});

export default TerminalWindow;
