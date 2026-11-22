'use client';
// Yengil konfetti: kutubxonasiz, 1,4 soniya. "Harakatni kamaytirish" yoqilgan bo'lsa ishlamaydi.
export function confetti() {
  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas');
  c.setAttribute('aria-hidden', 'true');
  c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(c);
  const dpr = window.devicePixelRatio || 1;
  c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  const g = c.getContext('2d'); g.scale(dpr, dpr);
  const colors = ['#2F4BC7', '#B4470F', '#FFB27A', '#1F8A5B', '#8EA2FF', '#F2C94C'];
  const parts = Array.from({ length: 120 }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 120, y: innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 11 - 4,
    w: 6 + Math.random() * 6, h: 4 + Math.random() * 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
    col: colors[(Math.random() * colors.length) | 0]
  }));
  const t0 = performance.now();
  (function frame(t) {
    const k = (t - t0) / 1400;
    g.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      g.save(); g.globalAlpha = Math.max(0, 1 - k); g.translate(p.x, p.y); g.rotate(p.r);
      g.fillStyle = p.col; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore();
    }
    if (k < 1) requestAnimationFrame(frame); else c.remove();
  })(t0);
}
