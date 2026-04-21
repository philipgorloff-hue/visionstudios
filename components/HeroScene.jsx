'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useT } from '@/lib/LangContext';

gsap.registerPlugin(ScrollTrigger);

// Top-down commercial jet — nose RIGHT, wings spread UP+DOWN like the ✈ silhouette
function PlaneIcon() {
  return (
    <svg viewBox="0 0 300 160" width="300" height="160" fill="none">

      {/* ── HORIZONTAL TAIL STABILIZERS ── */}
      <path fill="#C6FF00" opacity="0.87"
        d="M 42,76 L 6,57 L 18,54 L 54,72 Z"/>
      <path fill="#C6FF00" opacity="0.87"
        d="M 42,84 L 6,103 L 18,106 L 54,88 Z"/>

      {/* ── UPPER MAIN WING (toward y=0) ── */}
      <path fill="#C6FF00"
        d="M 212,67
           L 162,6
           L 148,6
           L 180,67
           Z"/>
      {/* Upper winglet */}
      <path fill="#C6FF00"
        d="M 162,6 L 148,6 L 144,0 L 158,0 Z"/>

      {/* ── LOWER MAIN WING (toward y=160) ── */}
      <path fill="#C6FF00"
        d="M 212,93
           L 162,154
           L 148,154
           L 180,93
           Z"/>
      {/* Lower winglet */}
      <path fill="#C6FF00"
        d="M 162,154 L 148,154 L 144,160 L 158,160 Z"/>

      {/* ── UPPER ENGINE NACELLE ── */}
      <path fill="#C6FF00"
        d="M 154,36 C 154,30 162,26 178,26 L 206,26
           C 220,26 224,30 224,36 C 224,42 220,46 206,46
           L 178,46 C 162,46 154,42 154,36 Z"/>
      <ellipse cx="159" cy="36" rx="6.5" ry="5.5" fill="rgba(255,255,255,0.44)"/>
      <circle  cx="159" cy="36" r="3"             fill="white"               opacity="0.94"/>

      {/* ── UPPER PYLON ── */}
      <rect x="180" y="46" width="12" height="21" rx="3" fill="#C6FF00" opacity="0.82"/>

      {/* ── LOWER ENGINE NACELLE ── */}
      <path fill="#C6FF00"
        d="M 154,124 C 154,118 162,114 178,114 L 206,114
           C 220,114 224,118 224,124 C 224,130 220,134 206,134
           L 178,134 C 162,134 154,130 154,124 Z"/>
      <ellipse cx="159" cy="124" rx="6.5" ry="5.5" fill="rgba(255,255,255,0.44)"/>
      <circle  cx="159" cy="124" r="3"             fill="white"               opacity="0.94"/>

      {/* ── LOWER PYLON ── */}
      <rect x="180" y="93" width="12" height="21" rx="3" fill="#C6FF00" opacity="0.82"/>

      {/* ── FUSELAGE ── */}
      <path fill="#C6FF00"
        d="M 24,80
           C 26,68 64,63 168,62 L 250,62
           C 274,61 294,70 298,80
           C 294,90 274,99 250,98 L 168,98
           C 64,97 26,92 24,80 Z"/>

      {/* ── COCKPIT GLASS ── */}
      <path fill="#050505" opacity="0.62"
        d="M 248,66 C 274,63 293,72 298,80
           C 293,88 274,97 248,94
           C 261,91 267,87 267,80
           C 267,73 261,69 248,66 Z"/>

      {/* ── NOSE TIP ── */}
      <circle cx="297" cy="80" r="3"   fill="white" opacity="0.55"/>
      <circle cx="297" cy="80" r="1.4" fill="white" opacity="0.96"/>

    </svg>
  );
}

function Rope({ ropeRef }) {
  return (
    <svg
      ref={ropeRef}
      style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:11, opacity:0 }}
    >
      <defs>
        <linearGradient id="ropeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#C6FF00" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#C6FF00" stopOpacity="0.1"/>
        </linearGradient>
      </defs>
      <line id="rope-line" stroke="url(#ropeGrad)" strokeWidth="2.5" strokeDasharray="10 7"/>
    </svg>
  );
}

const PLANE_W    = 300;   // plane SVG display width
const T_FLY_S   = 0.12;  // scroll progress: plane enters
const T_FLY_E   = 0.47;  // scroll progress: plane exits right

export default function HeroScene() {
  const t = useT();
  const outerRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const tagRef   = useRef(null);
  const planeRef = useRef(null);
  const nextRef  = useRef(null);
  const ropeRef  = useRef(null);

  useEffect(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;

    const L1 = [...line1Ref.current.querySelectorAll('.ltr')];
    const L2 = [...line2Ref.current.querySelectorAll('.ltr')];

    // ── Measure everything BEFORE any GSAP transforms ─────────────────────
    const b1   = line1Ref.current.getBoundingClientRect();
    const b2   = line2Ref.current.getBoundingClientRect();
    const midY = (b1.bottom + b2.top) / 2 - 80; // 80 = fuselage center y in 160px svg

    // Center x of each letter — used to sync explosion with plane nose
    const lx1 = L1.map(el => { const r = el.getBoundingClientRect(); return r.left + r.width / 2; });
    const lx2 = L2.map(el => { const r = el.getBoundingClientRect(); return r.left + r.width / 2; });

    // Random explosion vectors
    const r1 = L1.map(() => ({
      y:   -(H * (0.55 + Math.random() * 0.60)),
      x:   (Math.random() - 0.5) * 460,
      rot: (Math.random() - 0.5) * 340,
      s:   0.03 + Math.random() * 0.16,
    }));
    const r2 = L2.map(() => ({
      y:   H * (0.55 + Math.random() * 0.60),
      x:   (Math.random() - 0.5) * 460,
      rot: (Math.random() - 0.5) * 340,
      s:   0.03 + Math.random() * 0.16,
    }));

    // ── Initial GSAP states ────────────────────────────────────────────────
    gsap.set([...L1, ...L2], { opacity: 0, y: 80 });
    gsap.set(tagRef.current,   { opacity: 0 });
    gsap.set(planeRef.current, { opacity: 0, x: -(PLANE_W + 20), y: midY, scale: 1, rotation: 0 });
    gsap.set(nextRef.current,  { y: H });

    // ── Entrance (time-based) ──────────────────────────────────────────────
    const enter = gsap.timeline({ delay: 0.3 });
    enter
      .to(L1, { opacity: 1, y: 0, stagger: 0.05, duration: 1.0, ease: 'power4.out' })
      .to(L2, { opacity: 1, y: 0, stagger: 0.05, duration: 1.0, ease: 'power4.out' }, '-=0.65')
      .to(tagRef.current, { opacity: 1, duration: 0.55, ease: 'power2.out' }, '-=0.3');

    // ── Scroll-driven timeline ─────────────────────────────────────────────
    const planeStart = -(PLANE_W + 20); // -300 — left edge starts fully off-screen
    const planeEnd   = W + 20;          // left edge exits fully off-screen right

    // When does the plane's NOSE reach letter at screen x=lx?
    // Nose = left edge + PLANE_W → left edge when nose at lx = lx - PLANE_W
    const noseTrigger = (lx) => {
      const leftEdgeAtNose = lx - PLANE_W;
      const frac = Math.max(0, Math.min(1, (leftEdgeAtNose - planeStart) / (planeEnd - planeStart)));
      return T_FLY_S + frac * (T_FLY_E - T_FLY_S) + 0.013; // +0.013 = wake delay
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: outerRef.current,
        start:   'top top',
        end:     'bottom bottom',
        scrub:   1.5,
        onUpdate(self) {
          const rope = ropeRef.current;
          if (!rope || !planeRef.current || !nextRef.current) return;
          const pR = planeRef.current.getBoundingClientRect();
          const nR = nextRef.current.getBoundingClientRect();
          const line = rope.querySelector('#rope-line');
          if (!line) return;
          line.setAttribute('x1', pR.left + pR.width  / 2);
          line.setAttribute('y1', pR.top  + pR.height);
          line.setAttribute('x2', nR.left + nR.width  / 2);
          line.setAttribute('y2', nR.top);
        },
      }
    });

    // — Letters scale up (tension) while plane approaches
    tl.to([...L1, ...L2], { scale: 1.05, duration: 0.12, ease: 'power1.in' }, 0);
    tl.to(tagRef.current,  { opacity: 0, y: -35, duration: 0.09 }, 0.05);

    // — Plane enters, flies right
    tl.to(planeRef.current, { opacity: 1, duration: 0.025 }, T_FLY_S);
    tl.to(planeRef.current, { x: planeEnd, y: midY, duration: T_FLY_E - T_FLY_S, ease: 'power1.inOut' }, T_FLY_S);

    // — Letters fall EXACTLY as plane nose reaches each one
    L1.forEach((el, i) => {
      const v  = r1[i];
      const t0 = noseTrigger(lx1[i]);
      tl.to(el, {
        y: v.y, x: v.x, rotation: v.rot, scale: v.s,
        opacity: 0, filter: 'blur(8px)',
        duration: 0.26, ease: 'power3.in',
      }, t0);
    });
    L2.forEach((el, i) => {
      const v  = r2[i];
      const t0 = noseTrigger(lx2[i]);
      tl.to(el, {
        y: v.y, x: v.x, rotation: v.rot, scale: v.s,
        opacity: 0, filter: 'blur(8px)',
        duration: 0.26, ease: 'power3.in',
      }, t0);
    });

    // — Plane exits right, fades, teleports tiny to bottom center
    tl.to(planeRef.current, { opacity: 0, duration: 0.04 }, T_FLY_E);
    tl.set(planeRef.current, {
      x: W * 0.5 - PLANE_W / 2,
      y: H * 0.72,
      scale: 0.055,
      rotation: -90,
    }, 0.51);
    tl.to(planeRef.current, { opacity: 1, duration: 0.04 }, 0.53);

    // — Plane climbs from bottom, growing massive
    tl.to(planeRef.current, {
      x: W * 0.5 - PLANE_W / 2,
      y: -H * 0.25,
      scale: 2.8,
      duration: 0.45, ease: 'power2.out',
    }, 0.55);

    // — Rope + next section rise with the plane
    tl.to(ropeRef.current,  { opacity: 1, duration: 0.04 }, 0.57);
    tl.to(nextRef.current,  { y: 0, duration: 0.40, ease: 'power2.out' }, 0.60);
    tl.to(ropeRef.current,  { opacity: 0, duration: 0.06 }, 0.72);
    tl.to(planeRef.current, { opacity: 0, duration: 0.06 }, 0.74);

    return () => {
      enter.kill();
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  const mkLetters = (word) =>
    [...word].map((ch, i) => (
      <span key={i} className="ltr" style={{
        display: 'inline-block',
        willChange: 'transform, opacity',
        transformOrigin: '50% 50%',
      }}>
        {ch}
      </span>
    ));

  return (
    <div ref={outerRef} style={{ height: '600vh', position: 'relative' }}>
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        background: '#050505', overflow: 'hidden',
      }}>

        {/* Text */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '0 clamp(1.5rem, 5vw, 4rem)',
        }}>
          <div ref={line1Ref} style={{
            fontFamily: 'var(--font-space), sans-serif',
            fontSize: 'clamp(5rem, 16vw, 18rem)',
            fontWeight: 700, lineHeight: 0.88, letterSpacing: '-0.05em',
            color: '#F0EBE0', userSelect: 'none',
            mixBlendMode: 'difference',
          }}>
            {mkLetters('VISION')}
          </div>
          <div ref={line2Ref} style={{
            fontFamily: 'var(--font-space), sans-serif',
            fontSize: 'clamp(5rem, 16vw, 18rem)',
            fontWeight: 700, lineHeight: 0.88, letterSpacing: '-0.05em',
            color: '#C6FF00', userSelect: 'none',
          }}>
            {mkLetters('STUDIOS')}
          </div>
          <div ref={tagRef} style={{
            marginTop: 'clamp(1.5rem, 3vw, 2.5rem)',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: 'clamp(0.85rem, 1.3vw, 1.1rem)',
            fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'rgba(240,235,224,0.42)', opacity: 0,
          }}>
            {t.hero?.scroll || 'Scroll to begin'}
          </div>
        </div>

        {/* Airplane */}
        <div
          ref={planeRef}
          style={{
            position: 'absolute', top: 0, left: 0, zIndex: 20,
            transformOrigin: '50% 50%',
            filter:
              'drop-shadow(0 0 14px #C6FF00) ' +
              'drop-shadow(0 0 45px rgba(198,255,0,0.45)) ' +
              'drop-shadow(-20px 0 8px rgba(198,255,0,0.2))',
          }}
        >
          <PlaneIcon />
        </div>

        {/* Tow rope */}
        <Rope ropeRef={ropeRef} />

        {/* Next section */}
        <div
          ref={nextRef}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 10, background: '#050505',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '0 clamp(1.5rem, 5vw, 4rem)',
          }}
        >
          <div style={{
            fontFamily: 'var(--font-space), sans-serif',
            fontSize: '0.72rem', fontWeight: 700,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: '#C6FF00', marginBottom: 'clamp(1.2rem, 2.5vw, 2rem)',
          }}>
            Motion · 3D · Interactive
          </div>
          <div style={{
            fontFamily: 'var(--font-space), sans-serif',
            fontSize: 'clamp(2.8rem, 8vw, 9rem)',
            fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.045em',
            color: '#F0EBE0', marginBottom: 'clamp(1.5rem, 3vw, 2.8rem)',
          }}>
            We build what<br/>
            <span style={{ color: '#C6FF00' }}>others only</span><br/>
            imagine.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/contact" style={{
              fontFamily: 'var(--font-space), sans-serif',
              fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.06em',
              color: '#050505', background: '#C6FF00',
              padding: '1rem 2.5rem', borderRadius: '100px',
              textDecoration: 'none', display: 'inline-block',
            }}>
              {t.nav?.talk || "Let's talk"} →
            </Link>
            <Link href="/about" style={{
              fontFamily: 'var(--font-space), sans-serif',
              fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em',
              color: 'rgba(240,235,224,0.45)', textDecoration: 'none',
            }}>
              {t.nav?.about || 'About us'}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
