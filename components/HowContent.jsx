'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useT } from '@/lib/LangContext';

gsap.registerPlugin(ScrollTrigger);

const HowScene = dynamic(() => import('@/components/HowScene'), { ssr: false });

// Which ring threshold triggers which step (matches RING_T in HowScene)
const STEP_T = [0.08, 0.26, 0.44, 0.62, 0.79, 0.95];

export default function HowContent() {
  const t  = useT();
  const hw = t.howWeWork;

  const outerRef    = useRef(null);
  const progressRef = useRef(0);
  const prevStepRef = useRef(-1);  // ref-based prev step — no React closure issues

  // Only used for badge + counter JSX — does NOT affect panel layout
  const [activeStep, setActiveStep] = useState(-1);

  // Hero refs
  const heroWrapRef = useRef(null);
  const heroTagRef  = useRef(null);
  const heroL1Ref   = useRef(null);
  const heroL2Ref   = useRef(null);
  const heroSubRef  = useRef(null);

  // Step panel refs
  const panelRefs = useRef([]);

  // ── Hero entrance animation
  useEffect(() => {
    gsap.set([heroTagRef.current, heroSubRef.current], { opacity: 0, y: 14 });
    gsap.set([heroL1Ref.current, heroL2Ref.current], { yPercent: 108 });

    const tl = gsap.timeline({ delay: 0.4 });
    tl.to(heroTagRef.current, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0)
      .to(heroL1Ref.current,  { yPercent: 0, duration: 1.05, ease: 'power4.out' }, 0.12)
      .to(heroL2Ref.current,  { yPercent: 0, duration: 1.05, ease: 'power4.out' }, 0.24)
      .to(heroSubRef.current, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, 0.5);
  }, []);

  // ── ScrollTrigger — drives thread progress + step transitions
  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    const st = ScrollTrigger.create({
      trigger: outer,
      start: 'top top',
      end:   'bottom bottom',
      scrub: 0.9,
      onUpdate: (self) => {
        progressRef.current = self.progress;

        // Which step is active?
        let newStep = -1;
        for (let i = STEP_T.length - 1; i >= 0; i--) {
          if (self.progress >= STEP_T[i] - 0.04) { newStep = i; break; }
        }

        if (newStep === prevStepRef.current) return;
        const prev = prevStepRef.current;
        const forward = newStep > prev;
        prevStepRef.current = newStep;

        // Hero: fade out when first step activates; fade back in when scrolling to top
        if (heroWrapRef.current) {
          gsap.killTweensOf(heroWrapRef.current);
          if (prev === -1 && newStep >= 0) {
            gsap.to(heroWrapRef.current, { opacity: 0, duration: 0.3, ease: 'power3.in' });
          } else if (newStep === -1) {
            gsap.to(heroWrapRef.current, { opacity: 1, duration: 0.5, ease: 'power3.out' });
          }
        }

        // Animate out previous step panel (direction-aware)
        if (prev >= 0 && panelRefs.current[prev]) {
          gsap.killTweensOf(panelRefs.current[prev]);
          gsap.to(panelRefs.current[prev], {
            opacity: 0, x: forward ? -30 : 30, duration: 0.35, ease: 'power3.in',
          });
        }

        // Animate in new step panel (direction-aware)
        if (newStep >= 0 && panelRefs.current[newStep]) {
          gsap.killTweensOf(panelRefs.current[newStep]);
          gsap.fromTo(panelRefs.current[newStep],
            { opacity: 0, x: forward ? 50 : -50 },
            { opacity: 1, x: 0, duration: 0.55, ease: 'power3.out', delay: 0.05 }
          );
        }

        // Update state only for badge + counter — panels are already positioned absolutely
        setActiveStep(newStep);
      },
    });

    return () => st.kill();
  }, []);

  return (
    <>
      {/* ── 680vh scroll container ──────────────────────────── */}
      <div ref={outerRef} style={{ height: '680vh', position: 'relative' }}>

        {/* Sticky viewport */}
        <div style={{
          position: 'sticky', top: 0, height: '100vh',
          overflow: 'hidden', background: '#050505',
        }}>
          {/* Three.js canvas — full bleed */}
          <HowScene progressRef={progressRef} />

          {/* Dark gradient left half */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(to right, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.5) 52%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          {/* ── Left content column ─────────────────────────── */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0, left: 0,
            zIndex: 10,
            display: 'flex', alignItems: 'center',
            padding: 'clamp(1.5rem, 5vw, 4rem)',
            width: '55%',
          }}>
            {/*
              Relative container — hero is normal flow (gives height to this div),
              step panels are position:absolute overlaying it.
              Flex parent (alignItems:center) vertically centers this container.
            */}
            <div style={{ position: 'relative', width: '100%' }}>

              {/* HERO — always in DOM; GSAP fades it out when steps begin */}
              <div ref={heroWrapRef}>
                <div ref={heroTagRef} style={{
                  fontFamily: 'var(--font-space), sans-serif',
                  fontSize: '0.75rem', fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: '#C6FF00', marginBottom: 'clamp(1.2rem,2.5vw,1.8rem)',
                  opacity: 0,
                }}>{hw.hero.tag}</div>

                <div style={{ overflow: 'hidden' }}>
                  <div ref={heroL1Ref} style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontSize: 'clamp(3rem,9vw,10.5rem)',
                    fontWeight: 700, lineHeight: 0.88, letterSpacing: '-0.05em',
                    color: '#F0EBE0',
                  }}>{hw.hero.line1}</div>
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div ref={heroL2Ref} style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontSize: 'clamp(3rem,9vw,10.5rem)',
                    fontWeight: 700, lineHeight: 0.88, letterSpacing: '-0.05em',
                    color: '#C6FF00',
                  }}>{hw.hero.line2}</div>
                </div>

                <div ref={heroSubRef} style={{
                  marginTop: 'clamp(1.5rem,3vw,2.5rem)',
                  fontFamily: 'var(--font-inter), sans-serif',
                  fontSize: 'clamp(0.85rem,1.2vw,1rem)',
                  color: 'rgba(240,235,224,0.4)',
                  letterSpacing: '0.04em',
                  opacity: 0,
                }}>{hw.hero.sub}</div>
              </div>

              {/* STEP PANELS — all always in DOM, absolutely positioned over the hero area.
                  Only GSAP opacity+x changes — no React conditional display/position. */}
              {hw.steps.map((s, i) => (
                <div
                  key={i}
                  ref={el => panelRefs.current[i] = el}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%',
                    opacity: 0,
                    pointerEvents: 'none',
                  }}
                >
                  {/* Step number */}
                  <div style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontSize: '0.7rem', fontWeight: 700,
                    letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: '#C6FF00', marginBottom: 'clamp(1.2rem,2.5vw,2rem)',
                  }}>{s.n} / {hw.steps.length.toString().padStart(2,'0')}</div>

                  {/* Title */}
                  <h2 style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontSize: 'clamp(2rem,5.5vw,6rem)',
                    fontWeight: 700, letterSpacing: '-0.04em',
                    lineHeight: 0.92, color: '#F0EBE0',
                    marginBottom: 'clamp(0.75rem,1.5vw,1.25rem)',
                  }}>{s.title}</h2>

                  {/* Sub-label */}
                  <div style={{
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontSize: '0.7rem', fontWeight: 700,
                    letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: 'rgba(240,235,224,0.35)',
                    marginBottom: 'clamp(1.5rem,2.5vw,2rem)',
                  }}>{s.sub}</div>

                  {/* Body */}
                  <p style={{
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontSize: 'clamp(0.9rem,1.25vw,1.05rem)',
                    lineHeight: 1.75,
                    color: 'rgba(240,235,224,0.55)',
                    maxWidth: '420px',
                  }}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll nudge — hero state only */}
          {activeStep < 0 && (
            <div style={{
              position: 'absolute', bottom: '2.5rem', left: 'clamp(1.5rem,5vw,4rem)',
              zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <div className="scroll-line" />
            </div>
          )}

          {/* Step counter bottom-right */}
          {activeStep >= 0 && (
            <div style={{
              position: 'absolute', bottom: '2.5rem', right: 'clamp(1.5rem,4vw,3rem)',
              zIndex: 15, display: 'flex', gap: '0.5rem', alignItems: 'center',
            }}>
              {hw.steps.map((_, i) => (
                <div key={i} style={{
                  width: i === activeStep ? '24px' : '6px',
                  height: '4px',
                  borderRadius: '2px',
                  background: i === activeStep ? '#C6FF00' : 'rgba(240,235,224,0.2)',
                  transition: 'width 0.4s cubic-bezier(.16,1,.3,1), background 0.3s',
                }} />
              ))}
            </div>
          )}

          {/* Badge — "At every step, free to walk away" */}
          {activeStep === 3 && (
            <div style={{
              position: 'absolute', top: '50%', right: 'clamp(1.5rem,4vw,3rem)',
              transform: 'translateY(-50%)',
              zIndex: 15,
              fontFamily: 'var(--font-space), sans-serif',
              fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#050505', background: '#C6FF00',
              padding: '0.6rem 1.2rem', borderRadius: '100px',
            }}>{hw.badge}</div>
          )}
        </div>
      </div>

      {/* ── CTA section below ─────────────────────────────── */}
      <section style={{
        background: '#050505',
        padding: 'clamp(80px,10vw,130px) clamp(1.5rem,5vw,4rem)',
        borderTop: '1px solid rgba(240,235,224,0.07)',
        display: 'flex', flexDirection: 'column', gap: 'clamp(1.5rem,3vw,2.5rem)',
        maxWidth: '1400px', margin: '0 auto',
      }}>
        <div style={{
          fontFamily: 'var(--font-space), sans-serif',
          fontSize: '0.75rem', fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(240,235,224,0.3)',
        }}>{t.about?.cta?.label || 'Ready?'}</div>

        <div style={{
          fontFamily: 'var(--font-space), sans-serif',
          fontSize: 'clamp(3rem,8vw,9rem)',
          fontWeight: 700, letterSpacing: '-0.045em',
          lineHeight: 0.9, color: '#F0EBE0',
        }}>
          Start today<span style={{ color: '#C6FF00' }}>.</span>
        </div>

        <Link href="/contact" style={{
          fontFamily: 'var(--font-space), sans-serif',
          fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.06em',
          color: '#050505', background: '#C6FF00',
          padding: '1rem 2.5rem', borderRadius: '100px',
          textDecoration: 'none', display: 'inline-block',
          alignSelf: 'flex-start',
        }}>
          {t.nav.talk} →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '1.5rem clamp(1.5rem,5vw,4rem)',
        borderTop: '1px solid rgba(240,235,224,0.06)',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
        fontSize: '0.7rem', color: 'rgba(240,235,224,0.22)',
        fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '0.05em',
      }}>
        <span>{t.footer.copy}</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/impressum"   style={{ color: 'rgba(240,235,224,0.22)', textDecoration: 'none' }}>{t.legalNav.impressum}</Link>
          <Link href="/datenschutz" style={{ color: 'rgba(240,235,224,0.22)', textDecoration: 'none' }}>{t.legalNav.datenschutz}</Link>
          <Link href="/agb"         style={{ color: 'rgba(240,235,224,0.22)', textDecoration: 'none' }}>{t.legalNav.agb}</Link>
        </div>
        <span>{t.footer.tagline}</span>
      </footer>
    </>
  );
}
