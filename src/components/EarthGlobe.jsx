import React, { useEffect, useRef, useCallback } from 'react';

/**
 * 3D-style rotating Earth globe rendered with Canvas 2D.
 * Dot-grid sphere pattern with animated ping arcs and cursor-reactive tilt.
 * Lightweight alternative to Three.js — pure math projections.
 */
export default function EarthGlobe() {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef(0);
  const pingsRef = useRef([]);

  // Generate ping arcs periodically
  useEffect(() => {
    const createPing = () => {
      const lat1 = (Math.random() - 0.5) * Math.PI * 0.8;
      const lon1 = Math.random() * Math.PI * 2;
      const lat2 = (Math.random() - 0.5) * Math.PI * 0.8;
      const lon2 = Math.random() * Math.PI * 2;
      pingsRef.current.push({
        lat1, lon1, lat2, lon2,
        progress: 0,
        speed: 0.008 + Math.random() * 0.008,
        color: Math.random() > 0.15
          ? 'rgba(16, 185, 129, ALPHA)'   // green = success
          : 'rgba(239, 68, 68, ALPHA)',     // red = failure
      });
      // Keep max 6 pings
      if (pingsRef.current.length > 6) {
        pingsRef.current.shift();
      }
    };

    createPing();
    const interval = setInterval(createPing, 2200);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Normalize to -1..1
    mouseRef.current.x = (e.clientX - cx) / (rect.width / 2);
    mouseRef.current.y = (e.clientY - cy) / (rect.height / 2);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check mobile
    const isMobile = window.innerWidth < 768;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const size = Math.min(canvas.parentElement.offsetWidth, canvas.parentElement.offsetHeight, isMobile ? 300 : 580);
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);

    // Generate dot grid on the sphere surface
    const DOT_COUNT = isMobile ? 600 : 1200;
    const dots = [];
    // Fibonacci sphere distribution for even coverage
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < DOT_COUNT; i++) {
      const y = 1 - (i / (DOT_COUNT - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      dots.push({
        lat: Math.asin(y),
        lon: theta,
        size: 0.8 + Math.random() * 0.7,
        baseOpacity: 0.15 + Math.random() * 0.35,
      });
    }

    const animate = () => {
      const w = parseInt(canvas.style.width);
      const h = parseInt(canvas.style.height);
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.38;

      ctx.clearRect(0, 0, w, h);

      // Outer glow rings
      const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.6);
      glowGrad.addColorStop(0, 'rgba(168, 85, 247, 0.04)');
      glowGrad.addColorStop(0.4, 'rgba(99, 102, 241, 0.02)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      // Atmosphere ring
      const atmosGrad = ctx.createRadialGradient(cx, cy, radius * 0.95, cx, cy, radius * 1.15);
      atmosGrad.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
      atmosGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.04)');
      atmosGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = atmosGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Mouse tilt
      const tiltX = mouseRef.current.y * 0.15;
      const tiltY = mouseRef.current.x * 0.3;

      rotationRef.current += 0.003;
      const rotation = rotationRef.current;

      // Project and draw dots
      dots.forEach((dot) => {
        const lon = dot.lon + rotation;

        // 3D sphere to 2D projection with rotation
        let x3d = Math.cos(dot.lat) * Math.cos(lon);
        let y3d = Math.sin(dot.lat);
        let z3d = Math.cos(dot.lat) * Math.sin(lon);

        // Apply tilt
        const cosT = Math.cos(tiltX);
        const sinT = Math.sin(tiltX);
        const y3dTilt = y3d * cosT - z3d * sinT;
        const z3dTilt = y3d * sinT + z3d * cosT;
        y3d = y3dTilt;
        z3d = z3dTilt;

        const cosP = Math.cos(tiltY);
        const sinP = Math.sin(tiltY);
        const x3dTilt = x3d * cosP + z3d * sinP;
        const z3dTilt2 = -x3d * sinP + z3d * cosP;
        x3d = x3dTilt;
        z3d = z3dTilt2;

        // Only draw front-facing dots
        if (z3d < -0.05) return;

        const screenX = cx + x3d * radius;
        const screenY = cy - y3d * radius;

        // Depth-based size and opacity
        const depthFactor = (z3d + 1) / 2;
        const size = dot.size * (0.5 + depthFactor * 0.8);
        const opacity = dot.baseOpacity * depthFactor;

        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 130, 220, ${opacity})`;
        ctx.fill();
      });

      // Draw ping arcs
      pingsRef.current.forEach((ping) => {
        ping.progress += ping.speed;
        if (ping.progress > 1.5) return;

        const drawProgress = Math.min(ping.progress, 1);

        // Project start and end points
        const projectPoint = (lat, lon) => {
          const lonR = lon + rotation;
          let x3 = Math.cos(lat) * Math.cos(lonR);
          let y3 = Math.sin(lat);
          let z3 = Math.cos(lat) * Math.sin(lonR);

          // Tilt
          const ct = Math.cos(tiltX), st = Math.sin(tiltX);
          const yt = y3 * ct - z3 * st;
          const zt = y3 * st + z3 * ct;
          y3 = yt; z3 = zt;

          const cp = Math.cos(tiltY), sp = Math.sin(tiltY);
          const xt = x3 * cp + z3 * sp;
          const zt2 = -x3 * sp + z3 * cp;
          x3 = xt; z3 = zt2;

          return { x: cx + x3 * radius, y: cy - y3 * radius, z: z3 };
        };

        const p1 = projectPoint(ping.lat1, ping.lon1);
        const p2 = projectPoint(ping.lat2, ping.lon2);

        // Only draw if at least one endpoint is visible
        if (p1.z < -0.1 && p2.z < -0.1) return;

        // Arc midpoint lifted above surface
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const dist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
        const liftY = midY - dist * 0.3;

        const alpha = drawProgress < 1 ? 0.6 : Math.max(0, 1 - (ping.progress - 1) * 2) * 0.6;
        const colorStr = ping.color.replace('ALPHA', alpha.toFixed(2));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(midX, liftY, p1.x + (p2.x - p1.x) * drawProgress, p1.y + (p2.y - p1.y) * drawProgress + (liftY - midY) * Math.sin(drawProgress * Math.PI));
        ctx.strokeStyle = colorStr;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Ping dot at the arc head
        if (drawProgress < 1) {
          const headX = p1.x + (p2.x - p1.x) * drawProgress;
          const headY = p1.y + (p2.y - p1.y) * drawProgress + (liftY - midY) * Math.sin(drawProgress * Math.PI);
          ctx.beginPath();
          ctx.arc(headX, headY, 3, 0, Math.PI * 2);
          ctx.fillStyle = colorStr;
          ctx.fill();

          // Glow around head
          ctx.beginPath();
          ctx.arc(headX, headY, 8, 0, Math.PI * 2);
          ctx.fillStyle = ping.color.replace('ALPHA', (alpha * 0.3).toFixed(2));
          ctx.fill();
        }

        // Endpoint dots
        [p1, p2].forEach((p) => {
          if (p.z > -0.1) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = ping.color.replace('ALPHA', '0.7');
            ctx.fill();
          }
        });
      });

      // Cleanup finished pings
      pingsRef.current = pingsRef.current.filter(p => p.progress < 1.5);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [handleMouseMove]);

  return (
    <div className="earth-globe-container">
      <div className="earth-glow-ring earth-glow-ring--1"></div>
      <div className="earth-glow-ring earth-glow-ring--2"></div>
      <canvas ref={canvasRef} className="earth-canvas" />
    </div>
  );
}
