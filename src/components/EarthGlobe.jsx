import React, { useEffect, useRef, useCallback } from 'react';

// ─── Simplified continent detection with coastal waviness ───
function isLand(latDeg, lonDeg) {
  const lon = ((lonDeg % 360) + 540) % 360 - 180;
  const lat = latDeg;
  const w = Math.sin(lat * 0.2) * 2.5 + Math.cos(lon * 0.15) * 2 + Math.sin(lat * 0.3 + lon * 0.1) * 1.5;

  // NORTH AMERICA
  if (lat > 55 && lat < 72 && lon > -170 + w && lon < -140 + w) return true;
  if (lat > 55 && lat < 75 && lon > -140 + w && lon < -60 + w) return true;
  if (lat > 45 && lat <= 55 && lon > -80 + w && lon < -55 + w) return true;
  if (lat > 30 && lat <= 55 && lon > -130 + w && lon < -70 + w) return true;
  if (lat > 25 && lat <= 45 && lon > -85 + w && lon < -65 + w) return true;
  if (lat > 15 && lat <= 32 && lon > -118 + w && lon < -87 + w) return true;
  if (lat > 7 && lat <= 18 && lon > -92 + w && lon < -77 + w) return true;
  if (lat > 18 && lat < 24 && lon > -85 + w && lon < -68 + w) return true;

  // SOUTH AMERICA
  if (lat > 0 && lat < 13 && lon > -80 + w && lon < -60 + w) return true;
  if (lat > -10 && lat <= 5 && lon > -70 + w && lon < -35 + w) return true;
  if (lat > -25 && lat <= -10 && lon > -60 + w && lon < -35 + w) return true;
  if (lat > -25 && lat <= 0 && lon > -82 + w && lon < -58 + w) return true;
  if (lat > -40 && lat <= -25 && lon > -72 + w && lon < -50 + w) return true;
  if (lat > -55 && lat <= -40 && lon > -76 + w && lon < -63 + w) return true;

  // EUROPE
  if (lat > 36 && lat < 44 && lon > -10 + w && lon < 4 + w) return true;
  if (lat > 43 && lat < 51 && lon > -5 + w && lon < 8 + w) return true;
  if (lat > 47 && lat < 55 && lon > 5 + w && lon < 25 + w) return true;
  if (lat > 37 && lat < 47 && lon > 7 + w && lon < 18 + w) return true;
  if (lat > 35 && lat < 45 && lon > 18 + w && lon < 42 + w) return true;
  if (lat > 55 && lat < 72 && lon > 5 + w && lon < 32 + w) return true;
  if (lat > 50 && lat < 60 && lon > -10 + w && lon < 3 + w) return true;
  if (lat > 45 && lat < 60 && lon > 22 + w && lon < 45 + w) return true;
  if (lat > 55 && lat < 65 && lon > 20 + w && lon < 32 + w) return true;

  // AFRICA
  if (lat > 20 && lat < 37 && lon > -17 + w && lon < 35 + w) return true;
  if (lat > 4 && lat <= 20 && lon > -17 + w && lon < 15 + w) return true;
  if (lat > -5 && lat <= 15 && lon > 8 + w && lon < 35 + w) return true;
  if (lat > -12 && lat < 18 && lon > 28 + w && lon < 52 + w) return true;
  if (lat > -35 && lat <= -5 && lon > 12 + w && lon < 42 + w) return true;
  if (lat > -26 && lat < -12 && lon > 43 + w && lon < 50 + w) return true;

  // ASIA
  if (lat > 55 && lat < 78 && lon > 40 + w && lon < 180) return true;
  if (lat > 50 && lat < 68 && lon > 120 + w && lon < 170) return true;
  if (lat > 38 && lat <= 55 && lon > 50 + w && lon < 90 + w) return true;
  if (lat > 22 && lat <= 48 && lon > 75 + w && lon < 135 + w) return true;
  if (lat > 42 && lat < 52 && lon > 87 + w && lon < 120 + w) return true;
  if (lat > 33 && lat < 43 && lon > 124 + w && lon < 130 + w) return true;
  if (lat > 30 && lat < 46 && lon > 129 + w && lon < 146) return true;
  if (lat > 6 && lat < 35 && lon > 68 + w && lon < 90 + w) return true;
  if (lat > 12 && lat < 42 && lon > 35 + w && lon < 60 + w) return true;
  if (lat > 25 && lat < 40 && lon > 44 + w && lon < 75 + w) return true;
  if (lat > 5 && lat < 28 && lon > 92 + w && lon < 110 + w) return true;
  if (lat > 0 && lat < 20 && lon > 100 + w && lon < 127 + w) return true;
  if (lat > -10 && lat < 5 && lon > 95 + w && lon < 141) return true;
  if (lat > 22 && lat < 26 && lon > 120 + w && lon < 122) return true;

  // AUSTRALIA / OCEANIA
  if (lat > -40 && lat < -11 && lon > 113 + w && lon < 154 + w) return true;
  if (lat > -47 && lat < -34 && lon > 166 + w && lon < 178) return true;
  if (lat > -10 && lat < 0 && lon > 140 + w && lon < 155) return true;

  // GREENLAND
  if (lat > 60 && lat < 84 && lon > -55 + w && lon < -20 + w) return true;

  // ICELAND
  if (lat > 63 && lat < 67 && lon > -25 + w && lon < -13 + w) return true;

  return false;
}

// Major cities for intercontinental ping arcs
const CITIES = [
  { lat: 40.7, lon: -74 },    // New York
  { lat: 51.5, lon: -0.1 },   // London
  { lat: 35.7, lon: 139.7 },  // Tokyo
  { lat: -33.9, lon: 151.2 }, // Sydney
  { lat: -23.5, lon: -46.6 }, // São Paulo
  { lat: 19.1, lon: 72.9 },   // Mumbai
  { lat: 37.8, lon: -122.4 }, // San Francisco
  { lat: 1.3, lon: 103.8 },   // Singapore
  { lat: 55.7, lon: 37.6 },   // Moscow
  { lat: 48.9, lon: 2.35 },   // Paris
];

/**
 * Full-screen realistic rotating Earth globe with continent detection,
 * starfield, atmospheric glow, and intercontinental ping arcs.
 */
export default function EarthGlobe() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef(0);
  const dataRef = useRef(null);
  const pingsRef = useRef([]);

  // Generate globe data once
  const initData = useCallback(() => {
    if (dataRef.current) return;

    const isMobile = window.innerWidth < 768;
    const DOT_COUNT = isMobile ? 2500 : 5000;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const dots = [];

    for (let i = 0; i < DOT_COUNT; i++) {
      const y = 1 - (i / (DOT_COUNT - 1)) * 2;
      const theta = goldenAngle * i;
      const latRad = Math.asin(y);
      const latDeg = latRad * 180 / Math.PI;
      const lonDeg = ((theta * 180 / Math.PI) % 360) - 180;
      const land = isLand(latDeg, lonDeg);

      dots.push({
        latRad,
        lon: theta,
        land,
        size: land ? (1.1 + Math.random() * 0.5) : (0.4 + Math.random() * 0.2),
        baseOpacity: land ? (0.4 + Math.random() * 0.4) : (0.06 + Math.random() * 0.06),
      });
    }

    // Stars
    const stars = [];
    for (let i = 0; i < 400; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.015 + 0.003,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    dataRef.current = { dots, stars };
  }, []);

  // Ping generation
  useEffect(() => {
    const createPing = () => {
      const c1 = CITIES[Math.floor(Math.random() * CITIES.length)];
      let c2 = c1;
      while (c2 === c1) c2 = CITIES[Math.floor(Math.random() * CITIES.length)];

      pingsRef.current.push({
        lat1: c1.lat * Math.PI / 180,
        lon1: c1.lon * Math.PI / 180,
        lat2: c2.lat * Math.PI / 180,
        lon2: c2.lon * Math.PI / 180,
        progress: 0,
        speed: 0.006 + Math.random() * 0.006,
        isSuccess: Math.random() > 0.12,
      });
      if (pingsRef.current.length > 5) pingsRef.current.shift();
    };

    createPing();
    const iv = setInterval(createPing, 2500);
    return () => clearInterval(iv);
  }, []);

  // Mouse tracking for tilt
  useEffect(() => {
    const handler = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    initData();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // 3D projection helper
    const project = (latRad, lonRad, rotation, tiltX, tiltY, cx, cy, radius) => {
      const lon = lonRad + rotation;
      let x3 = Math.cos(latRad) * Math.cos(lon);
      let y3 = Math.sin(latRad);
      let z3 = Math.cos(latRad) * Math.sin(lon);

      // Tilt X
      const ct = Math.cos(tiltX), st = Math.sin(tiltX);
      let yt = y3 * ct - z3 * st;
      let zt = y3 * st + z3 * ct;
      y3 = yt; z3 = zt;

      // Tilt Y
      const cp = Math.cos(tiltY), sp = Math.sin(tiltY);
      let xt = x3 * cp + z3 * sp;
      let zt2 = -x3 * sp + z3 * cp;
      x3 = xt; z3 = zt2;

      return { x: cx + x3 * radius, y: cy - y3 * radius, z: z3 };
    };

    let time = 0;

    const animate = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const cx = W * 0.5;
      const cy = H * 0.52;
      const radius = Math.min(W, H) * 0.42;

      ctx.clearRect(0, 0, W, H);

      time += 0.016;
      rotRef.current += 0.0015;
      const rotation = rotRef.current;
      const tiltX = mouseRef.current.y * 0.12;
      const tiltY = mouseRef.current.x * 0.2;

      const data = dataRef.current;
      if (!data) { animRef.current = requestAnimationFrame(animate); return; }

      // ─── Stars ───
      data.stars.forEach((s) => {
        const twinkle = Math.sin(time * s.twinkleSpeed * 60 + s.twinkleOffset) * 0.3 + 0.7;
        const alpha = s.opacity * twinkle;
        ctx.fillStyle = `rgba(220, 230, 255, ${alpha.toFixed(2)})`;
        ctx.fillRect(s.x * W, s.y * H, s.size, s.size);
      });

      // ─── Atmosphere outer glow ───
      const atmosGrad = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.35);
      atmosGrad.addColorStop(0, 'rgba(80, 140, 255, 0.08)');
      atmosGrad.addColorStop(0.3, 'rgba(100, 120, 255, 0.05)');
      atmosGrad.addColorStop(0.6, 'rgba(140, 80, 255, 0.02)');
      atmosGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = atmosGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // ─── Sphere body ───
      const bodyGrad = ctx.createRadialGradient(
        cx - radius * 0.25, cy - radius * 0.25, radius * 0.1,
        cx, cy, radius
      );
      bodyGrad.addColorStop(0, 'rgba(12, 28, 65, 0.85)');
      bodyGrad.addColorStop(0.5, 'rgba(8, 18, 45, 0.8)');
      bodyGrad.addColorStop(0.85, 'rgba(5, 10, 30, 0.75)');
      bodyGrad.addColorStop(1, 'rgba(3, 6, 18, 0.6)');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // ─── Globe dots ───
      data.dots.forEach((dot) => {
        const p = project(dot.latRad, dot.lon, rotation, tiltX, tiltY, cx, cy, radius);
        if (p.z < -0.05) return;

        const depth = (p.z + 1) / 2;
        const size = dot.size * (0.4 + depth * 0.8);
        const alpha = dot.baseOpacity * depth;

        if (dot.land) {
          // Land: teal-green with latitude variation
          const latFactor = Math.abs(dot.latRad) / (Math.PI / 2);
          const r = Math.round(40 + latFactor * 120);
          const g = Math.round(210 - latFactor * 60);
          const b = Math.round(160 - latFactor * 40);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
        } else {
          // Ocean: very faint blue
          ctx.fillStyle = `rgba(30, 60, 130, ${(alpha * 0.3).toFixed(2)})`;
        }

        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      });

      // ─── Atmosphere rim highlight ───
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const rimGrad = ctx.createRadialGradient(cx, cy, radius * 0.88, cx, cy, radius * 1.02);
      rimGrad.addColorStop(0, 'transparent');
      rimGrad.addColorStop(0.7, 'rgba(80, 160, 255, 0.06)');
      rimGrad.addColorStop(0.9, 'rgba(100, 180, 255, 0.12)');
      rimGrad.addColorStop(1, 'rgba(120, 200, 255, 0.04)');
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.02, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ─── Ping arcs ───
      pingsRef.current.forEach((ping) => {
        ping.progress += ping.speed;
        if (ping.progress > 1.5) return;
        const draw = Math.min(ping.progress, 1);

        const p1 = project(ping.lat1, ping.lon1, rotation, tiltX, tiltY, cx, cy, radius);
        const p2 = project(ping.lat2, ping.lon2, rotation, tiltX, tiltY, cx, cy, radius);
        if (p1.z < -0.2 && p2.z < -0.2) return;

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const dist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
        const liftY = midY - dist * 0.35;

        const alpha = draw < 1 ? 0.6 : Math.max(0, 1 - (ping.progress - 1) * 2) * 0.6;
        const color = ping.isSuccess ? `rgba(16, 185, 129, ${alpha.toFixed(2)})` : `rgba(239, 68, 68, ${alpha.toFixed(2)})`;

        // Arc path
        const headX = p1.x + (p2.x - p1.x) * draw;
        const headY = p1.y + (p2.y - p1.y) * draw + (liftY - midY) * Math.sin(draw * Math.PI);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(midX, liftY, headX, headY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Head glow
        if (draw < 1) {
          ctx.beginPath();
          ctx.arc(headX, headY, 3, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(headX, headY, 8, 0, Math.PI * 2);
          ctx.fillStyle = ping.isSuccess
            ? `rgba(16, 185, 129, ${(alpha * 0.25).toFixed(2)})`
            : `rgba(239, 68, 68, ${(alpha * 0.25).toFixed(2)})`;
          ctx.fill();
        }

        // Endpoint dots
        [p1, p2].forEach((p) => {
          if (p.z > -0.15) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = ping.isSuccess ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)';
            ctx.fill();
          }
        });
      });

      pingsRef.current = pingsRef.current.filter(p => p.progress < 1.5);

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [initData]);

  return <canvas ref={canvasRef} className="earth-canvas" />;
}
