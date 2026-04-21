'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useT } from '@/lib/LangContext';

const HOLD_MS     = 2400;
const CIRC        = 2 * Math.PI * 62; // SVG ring circumference

export default function ContactClient() {
  const canvasRef  = useRef(null);
  const ringRef    = useRef(null);    // SVG progress circle
  const glowRef    = useRef(null);    // glow ring behind
  const btnRef     = useRef(null);
  const labelRef   = useRef(null);
  const flashRef   = useRef(null);
  const contentRef = useRef(null);
  const emailRef   = useRef(null);
  const phoneRef   = useRef(null);

  const progressRef = useRef(0);
  const holdStart   = useRef(null);
  const holdRaf     = useRef(null);
  const phaseRef    = useRef('idle'); // 'idle' | 'holding' | 'reveal'

  const [phase, setPhase] = useState('idle');
  const t  = useT();
  const cp = t.contactPage;

  // ── Canvas: particles + scan line ───────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, raf, time = 0;

    const N = 140;
    const pts = Array.from({ length: N }, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.4 + 0.5,
      a:  Math.random() * 0.35 + 0.08,
    }));

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      raf = requestAnimationFrame(draw);
      const ph   = phaseRef.current;
      const prog = progressRef.current;
      const hold = ph === 'holding';

      if (ph === 'reveal') {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, W, H);
        cancelAnimationFrame(raf);
        return;
      }
      ctx.fillStyle = 'rgba(5,5,5,0.18)';
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;

      pts.forEach(p => {
        if (hold) {
          const dx = cx - p.x, dy = cy - p.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d > 90) {
            p.vx += (dx / d) * 0.12 * prog;
            p.vy += (dy / d) * 0.12 * prog;
          }
          // speed cap
          const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (spd > 3.5) { p.vx *= 3.5 / spd; p.vy *= 3.5 / spd; }
        } else {
          // drift back to normal speed
          p.vx *= 0.98;
          p.vy *= 0.98;
          if (Math.abs(p.vx) < 0.1) p.vx += (Math.random() - 0.5) * 0.04;
          if (Math.abs(p.vy) < 0.1) p.vy += (Math.random() - 0.5) * 0.04;
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        const alpha = hold ? p.a * (0.3 + prog * 0.7) : p.a * 0.28;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(198,255,0,${alpha})`;
        ctx.fill();
      });

      time += 0.016;
    }

    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  // ── SVG ring updater (called from RAF, no React re-render) ───────────────
  const updateRing = (p) => {
    if (ringRef.current) {
      const dash = p * CIRC;
      ringRef.current.setAttribute('stroke-dasharray', `${dash} ${CIRC}`);
      const glow = Math.min(p * 22, 18);
      ringRef.current.style.filter = `drop-shadow(0 0 ${glow}px rgba(198,255,0,0.9))`;
    }
    if (glowRef.current) {
      glowRef.current.style.opacity = String(p * 0.25);
    }
    if (btnRef.current) {
      const s = 1 + p * 0.06;
      btnRef.current.style.transform = `scale(${s})`;
      btnRef.current.style.borderColor = `rgba(198,255,0,${0.35 + p * 0.65})`;
      btnRef.current.style.boxShadow   = `0 0 ${p * 40}px rgba(198,255,0,${p * 0.35})`;
    }
    if (labelRef.current) {
      const pct = Math.round(p * 100);
      labelRef.current.textContent = p > 0.02
        ? pct < 100 ? `${pct}%` : 'CONNECTED'
        : 'Hold to connect';
    }
  };

  // ── Hold start ───────────────────────────────────────────────────────────
  const startHold = (e) => {
    e.preventDefault();
    if (phaseRef.current !== 'idle') return;
    phaseRef.current = 'holding';
    setPhase('holding');
    holdStart.current = performance.now();

    const tick = () => {
      const p = Math.min((performance.now() - holdStart.current) / HOLD_MS, 1);
      progressRef.current = p;
      updateRing(p);

      if (p >= 1) {
        complete();
        return;
      }
      holdRaf.current = requestAnimationFrame(tick);
    };
    holdRaf.current = requestAnimationFrame(tick);
  };

  // ── Hold release (before complete) ───────────────────────────────────────
  const endHold = (e) => {
    e.preventDefault();
    if (phaseRef.current !== 'holding') return;
    cancelAnimationFrame(holdRaf.current);
    phaseRef.current = 'idle';
    setPhase('idle');

    // Drain ring back to 0
    const start = progressRef.current;
    const startTime = performance.now();
    const drainMs   = start * 600;

    const drain = () => {
      const elapsed = performance.now() - startTime;
      const p = Math.max(0, start - (elapsed / drainMs) * start);
      progressRef.current = p;
      updateRing(p);
      if (p > 0) requestAnimationFrame(drain);
    };
    requestAnimationFrame(drain);
  };

  // ── Complete ─────────────────────────────────────────────────────────────
  const complete = () => {
    cancelAnimationFrame(holdRaf.current);

    // Soft radial glow expands then fades — no flicker
    if (flashRef.current) {
      gsap.fromTo(flashRef.current,
        { opacity: 0, scale: 0.6 },
        {
          opacity: 1, scale: 1, duration: 0.55, ease: 'power2.out',
          onComplete: () => {
            gsap.to(flashRef.current, {
              opacity: 0, duration: 0.55, ease: 'power2.in',
              onComplete: () => {
                phaseRef.current = 'reveal';
                setPhase('reveal');
              },
            });
          },
        }
      );
    } else {
      phaseRef.current = 'reveal';
      setPhase('reveal');
    }
  };

  // ── Reveal animation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'reveal' || !contentRef.current) return;
    const items = contentRef.current.querySelectorAll('[data-r]');
    gsap.fromTo([...items],
      { opacity: 0, y: 50, skewY: 2 },
      { opacity: 1, y: 0, skewY: 0, duration: 0.9, stagger: 0.11, ease: 'power4.out', delay: 0.25 }
    );
  }, [phase]);

  // ── Magnetic hover ───────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'reveal') return;
    [emailRef, phoneRef].forEach(ref => {
      const el = ref.current;
      if (!el) return;
      const move  = e => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.24, y: (e.clientY - r.top - r.height / 2) * 0.24, duration: 0.4, ease: 'power2.out' });
      };
      const leave = () => gsap.to(el, { x: 0, y: 0, duration: 1.0, ease: 'elastic.out(1,0.4)' });
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', leave);
    });
  }, [phase]);

  return (
    <>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse-out {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .ring-pulse { animation: pulse-out 1.4s ease-out infinite; }
      `}</style>

      {/* Canvas */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, display: 'block' }} />

      {/* Soft glow overlay — expands and fades, no flicker */}
      <div ref={flashRef} style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'radial-gradient(ellipse at center, rgba(198,255,0,0.28) 0%, rgba(198,255,0,0.06) 55%, transparent 80%)',
        pointerEvents: 'none', opacity: 0,
      }} />

      {/* ── Idle / Holding screen */}
      {phase !== 'reveal' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '0',
          userSelect: 'none',
        }}>
          {/* Heading */}
          <div style={{
            fontFamily: 'var(--font-space), sans-serif',
            fontSize: 'clamp(2rem,5.5vw,5rem)',
            fontWeight: 700, letterSpacing: '-0.04em',
            color: '#F0EBE0', textAlign: 'center',
            marginBottom: 'clamp(2.5rem,5vw,4rem)',
            pointerEvents: 'none',
          }}>MAKE CONTACT.</div>

          {/* Button + ring */}
          <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>

            {/* Animated pulse rings (only when holding) */}
            {phase === 'holding' && (
              <>
                <div className="ring-pulse" style={{
                  position: 'absolute', inset: -10,
                  borderRadius: '50%',
                  border: '1px solid rgba(198,255,0,0.5)',
                  pointerEvents: 'none',
                }} />
                <div className="ring-pulse" style={{
                  position: 'absolute', inset: -10,
                  borderRadius: '50%',
                  border: '1px solid rgba(198,255,0,0.35)',
                  pointerEvents: 'none',
                  animationDelay: '0.7s',
                }} />
              </>
            )}

            {/* SVG progress ring */}
            <svg
              width="160" height="160"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
            >
              {/* Track */}
              <circle cx="80" cy="80" r="62"
                fill="none"
                stroke="rgba(198,255,0,0.10)"
                strokeWidth="2"
              />
              {/* Glow fill */}
              <circle ref={glowRef} cx="80" cy="80" r="62"
                fill="rgba(198,255,0,0)"
                stroke="rgba(198,255,0,0.6)"
                strokeWidth="28"
                opacity="0"
                style={{ pointerEvents: 'none' }}
              />
              {/* Progress arc */}
              <circle ref={ringRef} cx="80" cy="80" r="62"
                fill="none"
                stroke="#C6FF00"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`0 ${CIRC}`}
                transform="rotate(-90 80 80)"
                style={{ transition: 'none' }}
              />
            </svg>

            {/* Button */}
            <button
              ref={btnRef}
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onContextMenu={e => e.preventDefault()}
              style={{
                position: 'absolute', inset: 12,
                borderRadius: '50%',
                border: '1.5px solid rgba(198,255,0,0.35)',
                background: 'rgba(5,5,5,0.85)',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '0.4rem',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                touchAction: 'none',
                WebkitUserSelect: 'none',
                transition: 'border-color 0.1s, box-shadow 0.1s',
              }}
            >
              {/* Signal icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C6FF00" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 8.5C4.5 4.5 9 2.5 12 2.5C15 2.5 19.5 4.5 23 8.5" opacity="0.35"/>
                <path d="M4 12C6.5 9 9 7.5 12 7.5C15 7.5 17.5 9 20 12" opacity="0.6"/>
                <path d="M7.5 15.5C9 13.5 10.5 12.5 12 12.5C13.5 12.5 15 13.5 16.5 15.5"/>
                <circle cx="12" cy="19.5" r="1.2" fill="#C6FF00"/>
              </svg>
            </button>
          </div>

          {/* Label */}
          <div
            ref={labelRef}
            style={{
              marginTop: 'clamp(1.5rem,3vw,2rem)',
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '0.75rem', letterSpacing: '0.12em',
              color: 'rgba(240,235,224,0.4)',
              textTransform: 'uppercase',
              minWidth: '10ch', textAlign: 'center',
              pointerEvents: 'none',
            }}
          >Hold to connect</div>
        </div>
      )}

      {/* ── Revealed contact info */}
      {phase === 'reveal' && (
        <main ref={contentRef} style={{
          position: 'relative', zIndex: 5,
          minHeight: '100vh',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 'clamp(6rem,12vw,10rem) clamp(1.5rem,6vw,5rem) clamp(3rem,6vw,5rem)',
        }}>
          <div data-r style={{ opacity: 0,
            fontFamily: 'var(--font-space), sans-serif',
            fontSize: '0.72rem', fontWeight: 700,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: '#C6FF00', marginBottom: 'clamp(1.5rem,3vw,2.5rem)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C6FF00', display: 'inline-block', animation: 'blink 1.2s step-start infinite' }} />
            {cp.label}
          </div>

          <div data-r style={{ opacity: 0,
            marginBottom: 'clamp(2.5rem,5vw,4.5rem)',
            fontFamily: 'var(--font-space), sans-serif',
            fontSize: 'clamp(4rem,12vw,14rem)',
            fontWeight: 700, lineHeight: 0.88, letterSpacing: '-0.05em',
          }}>
            <span style={{ color: '#F0EBE0' }}>{cp.line1}</span><br />
            <span style={{ color: '#C6FF00' }}>{cp.line2}</span>
          </div>

          <div data-r style={{ opacity: 0, width: '100%', height: '1px', background: 'rgba(240,235,224,0.08)', marginBottom: 'clamp(2.5rem,5vw,4rem)' }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(2.5rem,7vw,8rem)', alignItems: 'flex-start' }}>
            <div data-r style={{ opacity: 0 }}>
              <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.3)', marginBottom: '0.9rem' }}>{cp.phoneLabel}</div>
              <div ref={phoneRef} style={{ display: 'inline-flex', alignItems: 'center', gap: '1.25rem' }}>
                <a href="tel:+41786669218" style={{ fontFamily: 'var(--font-space), sans-serif', fontSize: 'clamp(1.6rem,3.8vw,3.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#F0EBE0', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#C6FF00'}
                  onMouseLeave={e => e.currentTarget.style.color = '#F0EBE0'}
                >+41 78 666 92 18</a>
                <a href="https://wa.me/41786669218" target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#C6FF00', color: '#050505', fontFamily: 'var(--font-space), sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.5rem 1rem', borderRadius: '100px', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'box-shadow 0.25s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(198,255,0,0.45)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              </div>
            </div>

            <div data-r style={{ opacity: 0 }}>
              <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(240,235,224,0.3)', marginBottom: '0.9rem' }}>{cp.emailLabel}</div>
              <a ref={emailRef} href="mailto:philipg.orloff@gmail.com"
                style={{ display: 'inline-block', fontFamily: 'var(--font-space), sans-serif', fontSize: 'clamp(1.6rem,3.8vw,3.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: '#F0EBE0', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#C6FF00'}
                onMouseLeave={e => e.currentTarget.style.color = '#F0EBE0'}
              >philipg.orloff@gmail.com</a>
            </div>
          </div>

          <div data-r style={{ opacity: 0, marginTop: 'clamp(4rem,10vw,8rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
            <p style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 'clamp(0.82rem,1.1vw,0.95rem)', color: 'rgba(240,235,224,0.28)', lineHeight: 1.7, maxWidth: '340px', whiteSpace: 'pre-line' }}>{cp.location}</p>
            <a href="mailto:philipg.orloff@gmail.com"
              style={{ fontFamily: 'var(--font-space), sans-serif', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.06em', color: '#050505', background: '#C6FF00', padding: '1rem 2.5rem', borderRadius: '100px', textDecoration: 'none', transition: 'box-shadow 0.3s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 60px rgba(198,255,0,0.35)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >{cp.cta}</a>
          </div>

          <footer style={{ marginTop: 'clamp(3rem,6vw,5rem)', paddingTop: '1.5rem', borderTop: '1px solid rgba(240,235,224,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.7rem', color: 'rgba(240,235,224,0.2)', fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '0.05em' }}>
            <span>{t.footer.copy}</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link href="/impressum"   style={{ color: 'rgba(240,235,224,0.2)', textDecoration: 'none' }}>{t.legalNav.impressum}</Link>
              <Link href="/datenschutz" style={{ color: 'rgba(240,235,224,0.2)', textDecoration: 'none' }}>{t.legalNav.datenschutz}</Link>
              <Link href="/agb"         style={{ color: 'rgba(240,235,224,0.2)', textDecoration: 'none' }}>{t.legalNav.agb}</Link>
            </div>
            <span>{cp.footerLine}</span>
          </footer>
        </main>
      )}
    </>
  );
}
