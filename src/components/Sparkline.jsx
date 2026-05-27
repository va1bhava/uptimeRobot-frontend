import React, { useEffect, useRef } from 'react';

export default function Sparkline({ history = [], urlId }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  
  // Keep track of plotted points for mouse tracking
  const chartDataRef = useRef({ pts: [], data: [] });

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = 80;
    
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const data = history.filter(h => h.rt > 0).slice(-20);
    
    if (data.length < 2) {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(74,74,106,0.4)';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText('Not enough data yet — check back after a few cycles', 0, H / 2);
      chartDataRef.current = { pts: [], data: [] };
      return;
    }

    const vals = data.map(d => d.rt);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;

    const pad = { t: 10, b: 10, l: 0, r: 0 };
    const plotW = W - pad.l - pad.r;
    const plotH = H - pad.t - pad.b;

    const pts = data.map((d, i) => ({
      x: pad.l + (i / (data.length - 1)) * plotW,
      y: pad.t + plotH - ((d.rt - min) / range) * plotH
    }));

    chartDataRef.current = { pts, data };

    let animationFrameId;
    let frame = 0;
    const totalFrames = 45;

    function drawFrame(frameProgress) {
      ctx.clearRect(0, 0, W, H);
      const pointCount = Math.ceil(frameProgress * pts.length);
      if (pointCount < 2) return;

      const activePts = pts.slice(0, pointCount);

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const gy = pad.t + (plotH / 3) * i;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }

      // Area fill
      const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
      grad.addColorStop(0, 'rgba(0,229,160,0.15)');
      grad.addColorStop(1, 'rgba(0,229,160,0)');
      ctx.beginPath();
      ctx.moveTo(activePts[0].x, H - pad.b);
      activePts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(activePts[activePts.length - 1].x, H - pad.b);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      activePts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = '#00e5a0';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();

      // Last dot with glow
      const last = activePts[activePts.length - 1];
      ctx.beginPath();
      ctx.arc(last.x, last.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,229,160,0.15)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(last.x, last.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#00e5a0';
      ctx.fill();
    }

    function step() {
      frame++;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      drawFrame(eased);
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    }

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [history]);

  // Handle Tooltip Mouse Move
  const handleMouseMove = (e) => {
    const container = containerRef.current;
    const tooltip = tooltipRef.current;
    const canvas = canvasRef.current;
    if (!container || !tooltip || !canvas) return;

    const { pts, data } = chartDataRef.current;
    if (pts.length < 2) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Find closest point
    let closestIndex = 0;
    let closestDist = Infinity;
    pts.forEach((p, i) => {
      const dist = Math.abs(p.x - mouseX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    });

    if (closestDist < 30 && data[closestIndex]) {
      const pt = pts[closestIndex];
      const d = data[closestIndex];
      tooltip.innerHTML = `<div class="tt-value">${d.rt}ms</div><div class="tt-time">${formatTime(d.t)}</div>`;
      tooltip.style.left = (pt.x - 30) + 'px';
      tooltip.style.top = (pt.y - 45) + 'px';
      tooltip.classList.add('visible');
    } else {
      tooltip.classList.remove('visible');
    }
  };

  const handleMouseLeave = () => {
    if (tooltipRef.current) {
      tooltipRef.current.classList.remove('visible');
    }
  };

  const histFirst = history.length > 0 ? formatTime(history[0].t) : '';
  const histLast = history.length > 0 ? formatTime(history[history.length - 1].t) : '';

  return (
    <div className="chart-section-inner">
      <div className="chart-title">
        Response Time (ms) — last {Math.min(history.filter(h => h.rt > 0).length, 20)} readings
      </div>
      <div 
        className="sparkline-container" 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <canvas className="sparkline" ref={canvasRef}></canvas>
        <div className="chart-tooltip" ref={tooltipRef}></div>
      </div>
      <div className="chart-labels">
        <span>{histFirst}</span>
        <span>{histLast}</span>
      </div>
    </div>
  );
}
