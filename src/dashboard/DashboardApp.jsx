import React, { useState, useEffect, useRef } from 'react';
import Sparkline from '../components/Sparkline';
import '../styles/dashboard.css';

const API = '';

function useAnimatedCounter(targetValue, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = value;
    if (startValue === targetValue) return;

    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
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

export default function DashboardApp() {
  const email = localStorage.getItem('ur_email') || '';
  const avatarLetter = email ? email.charAt(0).toUpperCase() : '?';

  // State lists & metrics
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedText, setLastRefreshedText] = useState('Loading...');

  // Collapsible charts
  const [expandedChartIds, setExpandedChartIds] = useState(new Set());

  // Counters
  const [stats, setStats] = useState({ total: 0, up: 0, down: 0, avg: 0 });
  const animatedTotal = useAnimatedCounter(stats.total);
  const animatedUp = useAnimatedCounter(stats.up);
  const animatedDown = useAnimatedCounter(stats.down);
  const animatedAvg = useAnimatedCounter(stats.avg);

  // Status flashes for status change animation
  const [statusFlashes, setStatusFlashes] = useState({});
  const prevStatusesRef = useRef({});

  // Auto-refresh timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Delete confirmations
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const deleteTimerRef = useRef(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Show Toast helper
  const showToast = (msg, type = 'success') => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev.slice(-3), { id, msg, type }]); // cap at 4 toasts
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  };

  // Local storage history utilities
  const getHistory = (urlId) => {
    try {
      return JSON.parse(localStorage.getItem('ur_hist_' + urlId) || '[]');
    } catch {
      return [];
    }
  };

  const pushHistory = (urlId, rt, status) => {
    const hist = getHistory(urlId);
    hist.push({ t: Date.now(), rt, status });
    if (hist.length > 30) {
      hist.splice(0, hist.length - 30);
    }
    localStorage.setItem('ur_hist_' + urlId, JSON.stringify(hist));
  };

  // API wrapper with refresh token logic
  const apiFetch = async (path, opts = {}) => {
    let token = localStorage.getItem('ur_token');
    if (!token) {
      forceLogout();
      return null;
    }

    const headers = {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    };

    try {
      let res = await fetch(API + path, {
        ...opts,
        credentials: 'include',
        headers
      });

      if (res.status === 401) {
        // Try token exchange refresh
        const refreshRes = await fetch(`${API}/uptimerobot/auth/refresh`, {
          method: 'POST',
          credentials: 'include'
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('ur_token', data.token);
          
          // Retry original request with new token
          const retriedHeaders = {
            ...headers,
            'Authorization': 'Bearer ' + data.token
          };
          res = await fetch(API + path, {
            ...opts,
            credentials: 'include',
            headers: retriedHeaders
          });
        } else {
          forceLogout();
          return null;
        }
      }
      return res;
    } catch (err) {
      console.error('Fetch error:', err);
      return null;
    }
  };

  const forceLogout = () => {
    localStorage.removeItem('ur_token');
    localStorage.removeItem('ur_email');
    window.location.href = 'login.html';
  };

  const logout = async () => {
    const token = localStorage.getItem('ur_token');
    try {
      await fetch(`${API}/uptimerobot/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Authorization': 'Bearer ' + token }
      });
    } catch (e) {
      // Still log out locally
    }
    forceLogout();
  };

  // Load URLs and update stats
  const loadUrls = async (isManual = false) => {
    setIsRefreshing(true);
    const res = await apiFetch('/uptimerobot/geturls');
    setIsRefreshing(false);
    setLoading(false);

    if (!res) return;
    if (!res.ok) {
      showToast('Failed to load URLs', 'error');
      return;
    }

    const data = await res.json();
    setUrls(data);

    // Push history for each URL and check for status flash animations
    const newFlashes = {};
    data.forEach(url => {
      const status = url.lastStatus || url.LastStatus;
      if (status) {
        pushHistory(url.id, url.responseTime, status);
      }

      // Check if status changed
      const prevStatus = prevStatusesRef.current[url.id];
      if (prevStatus && prevStatus !== status) {
        if (status === 'UP') {
          newFlashes[url.id] = 'flash-up';
        } else if (status === 'DOWN') {
          newFlashes[url.id] = 'flash-down';
        }
      }
      prevStatusesRef.current[url.id] = status;
    });

    if (Object.keys(newFlashes).length > 0) {
      setStatusFlashes(prev => ({ ...prev, ...newFlashes }));
      // Clear flashes after animation completes
      setTimeout(() => {
        setStatusFlashes(prev => {
          const next = { ...prev };
          Object.keys(newFlashes).forEach(id => delete next[id]);
          return next;
        });
      }, 600);
    }

    // Update stats counters
    const total = data.length;
    const up = data.filter(u => (u.lastStatus || u.LastStatus) === 'UP').length;
    const down = data.filter(u => ['DOWN', 'SERVER_ERROR', 'CLIENT_ERROR'].includes(u.lastStatus || u.LastStatus)).length;
    const rts = data.map(u => u.responseTime).filter(r => r > 0);
    const avg = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0;

    setStats({ total, up, down, avg });
    
    const now = new Date();
    setLastRefreshedText('Last refreshed at ' + now.toLocaleTimeString());
    setElapsedSeconds(0); // reset top progress bar

    if (isManual) {
      showToast('Refreshed!', 'success');
    }
  };

  // Add URL monitoring
  const addUrl = async (e) => {
    if (e) e.preventDefault();
    const url = newUrl.trim();
    if (!url) return showToast('Please enter a URL', 'error');
    if (!url.startsWith('http')) return showToast('URL must start with http:// or https://', 'error');

    setIsAdding(true);
    const res = await apiFetch('/uptimerobot/addurl', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
    setIsAdding(false);

    if (res && res.ok) {
      setNewUrl('');
      showToast('URL added successfully!', 'success');
      loadUrls();
    } else {
      showToast('Failed to add URL', 'error');
    }
  };

  // Delete URL
  const deleteUrl = async (urlId) => {
    const res = await apiFetch('/uptimerobot/deleteurl/' + urlId, { method: 'DELETE' });
    if (res && res.ok) {
      localStorage.removeItem('ur_hist_' + urlId);
      
      // Remove from active collapsed charts set
      setExpandedChartIds(prev => {
        const next = new Set(prev);
        next.delete(urlId);
        return next;
      });

      delete prevStatusesRef.current[urlId];
      showToast('URL removed', 'success');
      loadUrls();
    } else {
      showToast('Failed to delete', 'error');
    }
  };

  // Check URL params for token on mount (Google OAuth login flow redirect)
  useEffect(() => {
    document.body.className = 'dashboard-body';
    
    const params = new URLSearchParams(window.location.search);
    if (params.has('token')) {
      localStorage.setItem('ur_token', params.get('token'));
      window.history.replaceState({}, '', 'dashboard.html');
    }

    if (!localStorage.getItem('ur_token') && !params.has('token')) {
      window.location.href = 'login.html';
      return;
    }

    // Initial load
    loadUrls();

    // Setup 60s progress bar interval
    const progressTimer = setInterval(() => {
      setElapsedSeconds(prev => {
        if (prev >= 59) {
          loadUrls();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(deleteTimerRef.current);
      document.body.className = '';
    };
  }, []);

  const toggleChart = (urlId) => {
    setExpandedChartIds(prev => {
      const next = new Set(prev);
      if (next.has(urlId)) {
        next.delete(urlId);
      } else {
        next.add(urlId);
      }
      return next;
    });
  };

  const handleDeleteClick = (e, urlId) => {
    e.stopPropagation();
    if (confirmingDeleteId === urlId) {
      clearTimeout(deleteTimerRef.current);
      setConfirmingDeleteId(null);
      deleteUrl(urlId);
    } else {
      setConfirmingDeleteId(urlId);
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = setTimeout(() => {
        setConfirmingDeleteId(null);
      }, 3000);
    }
  };

  // Status mapping to classes
  const statusClass = (s) => {
    if (!s) return 'unknown';
    if (s === 'UP') return 'up';
    if (s === 'DOWN' || s === 'SERVER_ERROR' || s === 'CLIENT_ERROR') return 'down';
    return 'warn';
  };

  return (
    <>
      {/* Top refresh progress bar */}
      <div 
        className="refresh-progress" 
        style={{ 
          width: `${(elapsedSeconds / 60) * 100}%`,
          transition: elapsedSeconds === 0 ? 'none' : 'width 1s linear'
        }}
      ></div>

      {/* Navigation */}
      <nav>
        <div className="nav-logo">
          <div className="nav-logo-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18L18.36 7.5 12 10.82 5.64 7.5 12 4.18zM5 9.06l6 3.32v6.34l-6-3.32V9.06zm8 9.66V12.38l6-3.32v6.34l-6 3.32z" />
            </svg>
          </div>
          <div className="nav-logo-text">Uptime<span>Robot</span></div>
        </div>
        <div className="nav-right">
          <div className="nav-avatar">{avatarLetter}</div>
          <div className="nav-email" title={email}>{email}</div>
          <button type="button" className="btn-logout" onClick={logout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <div className="page-subtitle">{lastRefreshedText}</div>
          </div>
          <button 
            type="button" 
            className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`}
            onClick={() => loadUrls(true)}
            disabled={isRefreshing}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-icon purple">📊</div>
            <div className="stat-label">Total Monitored</div>
            <div className="stat-value purple">{animatedTotal}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <div className="stat-label">Currently Up</div>
            <div className="stat-value green">{animatedUp}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">✕</div>
            <div className="stat-label">Currently Down</div>
            <div className="stat-value red">{animatedDown}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon cyan">⚡</div>
            <div className="stat-label">Avg Response</div>
            <div className="stat-value cyan">{animatedAvg > 0 ? `${animatedAvg}ms` : '—'}</div>
          </div>
        </div>

        {/* Add URL Section */}
        <form className="add-section" onSubmit={addUrl}>
          <div className="add-input-wrapper">
            <input 
              type="url" 
              className="add-input" 
              placeholder="https://example.com — add a URL to monitor" 
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="btn-add" 
            disabled={isAdding}
          >
            {isAdding ? 'Adding...' : '+ Add URL'}
          </button>
        </form>

        {/* URL Card List */}
        <div className="url-list">
          {loading ? (
            <>
              <div style={{ height: '84px' }} className="skeleton"></div>
              <div style={{ height: '84px' }} className="skeleton"></div>
              <div style={{ height: '84px' }} className="skeleton"></div>
            </>
          ) : urls.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📡</div>
              <h3>No URLs monitored yet</h3>
              <p>Add your first URL above to start monitoring its uptime and performance.</p>
            </div>
          ) : (
            urls.map((url, idx) => {
              const status = url.lastStatus || url.LastStatus || 'UNKNOWN';
              const rt = url.responseTime;
              const lastChecked = url.lastchecked 
                ? new Date(url.lastchecked.replace(' ', 'T')).toLocaleTimeString() 
                : 'Never';
              const isExpanded = expandedChartIds.has(url.id);
              const history = getHistory(url.id);

              return (
                <div 
                  key={url.id} 
                  className={`url-card ${statusFlashes[url.id] || ''}`}
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  <div className="url-card-header" onClick={() => toggleChart(url.id)}>
                    <div className={`status-dot ${statusClass(status)}`}></div>
                    <div className="url-info">
                      <div className="url-name" title={url.url}>{url.url}</div>
                      <div className="url-meta">
                        <div className="url-meta-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          <span>{rt > 0 ? `${rt}ms` : '—'}</span>
                        </div>
                        <div className="url-meta-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          <span>{lastChecked}</span>
                        </div>
                        <div className="url-meta-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                          <span>{history.length} pts</span>
                        </div>
                      </div>
                    </div>
                    <div className={`status-badge ${status}`}>{status}</div>
                    
                    <svg className={`expand-icon ${isExpanded ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                    
                    <button 
                      type="button" 
                      className={`btn-delete ${confirmingDeleteId === url.id ? 'confirming' : ''}`} 
                      onClick={(e) => handleDeleteClick(e, url.id)}
                    >
                      {confirmingDeleteId === url.id ? 'Confirm?' : '✕'}
                    </button>
                  </div>

                  <div className={`chart-section ${isExpanded ? 'open' : ''}`}>
                    {isExpanded && (
                      <Sparkline history={history} urlId={url.id} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Toast Overlay Container */}
      <div className="toast-container" id="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span className="toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
            <span>{toast.msg}</span>
            <div className="toast-progress"></div>
          </div>
        ))}
      </div>
    </>
  );
}
