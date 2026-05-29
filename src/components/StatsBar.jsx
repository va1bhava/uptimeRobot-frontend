import React, { useState, useEffect } from 'react';
import useAnimatedCounter from '../hooks/useAnimatedCounter';
import { useScrollZoom } from '../hooks/useScrollZoom';

const API_BACKEND = 'https://uptimerobot-xvf5.onrender.com';

/**
 * Live stats bar with animated counters.
 * Counter re-renders are isolated to this component only.
 */
const StatsBar = React.memo(function StatsBar() {
  const [rawStats, setRawStats] = useState({ totalUrls: 0, urlsUp: 0, urlsDown: 0 });

  const animatedTotal = useAnimatedCounter(rawStats.totalUrls);
  const animatedUp = useAnimatedCounter(rawStats.urlsUp);
  const animatedDown = useAnimatedCounter(rawStats.urlsDown);

  const { ref, style } = useScrollZoom({ scaleFrom: 0.88, translateY: 30, delay: 200 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BACKEND}/uptimerobot/stats`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
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

    fetchStats();
    const statsInterval = setInterval(fetchStats, 60000);
    return () => clearInterval(statsInterval);
  }, []);

  return (
    <div className="stats-bar" id="stats-bar" ref={ref} style={style}>
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
  );
});

export default StatsBar;
