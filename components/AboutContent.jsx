'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useT } from '@/lib/LangContext';
import BorderGlow from '@/components/BorderGlow';

gsap.registerPlugin(ScrollTrigger);

const LiquidEther = dynamic(() => import('@/components/LiquidEther'), { ssr: false });


export default function AboutContent() {
  const t  = useT();
  const ab = t.about;

  const heroTagRef  = useRef(null);
  const heroL1Ref   = useRef(null);
  const heroL2Ref   = useRef(null);
  const heroSubRef  = useRef(null);
  const scrollRef   = useRef(null);
  const founderRefs = useRef([]);
  const valueRefs   = useRef([]);
  const pitchRef    = useRef(null);

  // ── Hero entrance
  useEffect(() => {
    const tag   = heroTagRef.current;
    const l1    = heroL1Ref.current;
    const l2    = heroL2Ref.current;
    const sub   = heroSubRef.current;
    const scr   = scrollRef.current;
    if (!tag) return;

    gsap.set([tag, sub, scr], { opacity: 0, y: 16 });
    gsap.set([l1, l2], { yPercent: 110, opacity: 1 });

    const tl = gsap.timeline({ delay: 0.5 });
    tl.to(tag, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0)
      .to(l1,  { yPercent: 0, duration: 1.1, ease: 'power4.out' }, 0.15)
      .to(l2,  { yPercent: 0, duration: 1.1, ease: 'power4.out' }, 0.28)
      .to(sub, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.55)
      .to(scr, { opacity: 1, duration: 0.5 }, 0.85);
  }, []);

  // ── Scroll reveals
  useEffect(() => {
    const founders = founderRefs.current.filter(Boolean);
    founders.forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }, delay: i * 0.12 }
      );
    });

    const values = valueRefs.current.filter(Boolean);
    values.forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' }, delay: i * 0.1 }
      );
    });

    if (pitchRef.current) {
      gsap.fromTo(pitchRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: pitchRef.current, start: 'top 80%' } }
      );
    }
  }, []);

  const sectionPad = 'clamp(80px,10vw,130px) clamp(1.5rem,5vw,4rem)';

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <LiquidEther
          colors={['#C6FF00', '#7733ff', '#00c8ff', '#ff33aa']}
          mouseForce={20}
          cursorSize={100}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        />

        {/* Text overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 'clamp(1.5rem,5vw,4rem)',
          pointerEvents: 'none',
        }}>
          <div ref={heroTagRef} style={{
            fontFamily: 'var(--font-space), sans-serif',
            fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#C6FF00', marginBottom: 'clamp(1.5rem,3vw,2rem)',
            opacity: 0,
          }}>{ab.hero.tag}</div>

          <div style={{ overflow: 'hidden', marginBottom: '-0.05em' }}>
            <div ref={heroL1Ref} style={{
              fontFamily: 'var(--font-space), sans-serif',
              fontSize: 'clamp(3.5rem,11vw,13rem)',
              fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.05em',
              color: '#F0EBE0', display: 'block',
            }}>{ab.hero.line1}</div>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div ref={heroL2Ref} style={{
              fontFamily: 'var(--font-space), sans-serif',
              fontSize: 'clamp(3.5rem,11vw,13rem)',
              fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.05em',
              color: '#C6FF00', display: 'block',
            }}>{ab.hero.line2}</div>
          </div>

          <div ref={heroSubRef} style={{
            marginTop: 'clamp(1.5rem,3vw,2.5rem)',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: 'clamp(0.85rem,1.2vw,1rem)',
            color: 'rgba(240,235,224,0.45)',
            letterSpacing: '0.04em',
            whiteSpace: 'pre-line',
            lineHeight: 1.7,
            opacity: 0,
          }}>{ab.hero.sub}</div>
        </div>

        {/* Scroll indicator */}
        <div ref={scrollRef} style={{
          position: 'absolute', bottom: '2.5rem', left: '50%',
          transform: 'translateX(-50%)', opacity: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
          zIndex: 10, pointerEvents: 'none',
        }}>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ── Founders ─────────────────────────────────────────────── */}
      <section style={{ padding: sectionPad }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--font-space), sans-serif',
            fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#C6FF00', marginBottom: 'clamp(2.5rem,5vw,4rem)',
          }}>{ab.founders.label}</div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,320px),1fr))',
            gap: '1px',
            background: 'rgba(240,235,224,0.07)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            {[
              { n: '01', first: 'Philip', last: 'Orloff',  role: 'Creative Direction\n& Development' },
              { n: '02', first: 'Jan',    last: 'Kellner', role: 'Strategy\n& Motion Design' },
            ].map(({ n, first, last, role }, i) => (
              <div
                key={i}
                ref={el => founderRefs.current[i] = el}
                style={{
                  position: 'relative', overflow: 'hidden',
                  background: '#080808',
                  padding: 'clamp(2rem,4vw,3.5rem)',
                  minHeight: 'clamp(440px,62vh,600px)',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: 0,
                }}
                onMouseMove={e => {
                  const card = e.currentTarget;
                  const r = card.getBoundingClientRect();
                  const x = (e.clientX - r.left) / r.width;
                  const y = (e.clientY - r.top)  / r.height;
                  gsap.to(card, {
                    rotationX: (y - 0.5) * -18,
                    rotationY: (x - 0.5) * 24,
                    transformPerspective: 900,
                    ease: 'power2.out', duration: 0.4,
                  });
                  const spot = card.querySelector('[data-spot]');
                  if (spot) {
                    spot.style.opacity = '1';
                    spot.style.backgroundImage =
                      `radial-gradient(440px circle at ${x*100}% ${y*100}%, rgba(198,255,0,0.1) 0%, transparent 65%)`;
                  }
                }}
                onMouseLeave={e => {
                  const card = e.currentTarget;
                  gsap.to(card, { rotationX: 0, rotationY: 0, duration: 1.1, ease: 'elastic.out(1,0.35)' });
                  const spot = card.querySelector('[data-spot]');
                  if (spot) spot.style.opacity = '0';
                }}
              >
                {/* Cursor spotlight */}
                <div data-spot="" style={{
                  position: 'absolute', inset: 0, opacity: 0,
                  transition: 'opacity 0.3s', pointerEvents: 'none', zIndex: 0,
                }} />

                {/* Giant background number */}
                <div style={{
                  position: 'absolute', right: '-0.06em', bottom: '-0.2em',
                  fontFamily: 'var(--font-space), sans-serif',
                  fontSize: 'clamp(12rem,25vw,22rem)',
                  fontWeight: 700, lineHeight: 1, letterSpacing: '-0.05em',
                  color: 'rgba(240,235,224,0.025)',
                  userSelect: 'none', pointerEvents: 'none',
                }}>{n}</div>

                {/* Index label — top */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <span style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontSize: '0.6rem', fontWeight: 700,
                    letterSpacing: '0.25em',
                    color: 'rgba(240,235,224,0.18)',
                  }}>{n}</span>
                </div>

                {/* Name + role — bottom */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontWeight: 700, letterSpacing: '-0.04em',
                    lineHeight: 0.88, marginBottom: '2rem',
                    userSelect: 'none',
                  }}>
                    <div style={{ fontSize: 'clamp(3.5rem,7vw,6rem)', color: '#F0EBE0' }}>{first}</div>
                    <div style={{ fontSize: 'clamp(3.5rem,7vw,6rem)', color: 'rgba(240,235,224,0.28)' }}>{last}</div>
                  </div>
                  <div style={{ width: '2.5rem', height: '2px', background: '#C6FF00', marginBottom: '1.1rem' }} />
                  <div style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontSize: '0.6rem', fontWeight: 700,
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: 'rgba(240,235,224,0.28)', marginBottom: '0.35rem',
                  }}>Co-Founder</div>
                  <div style={{
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontSize: 'clamp(0.85rem,1.1vw,0.95rem)',
                    color: 'rgba(240,235,224,0.4)',
                    lineHeight: 1.55, whiteSpace: 'pre-line',
                  }}>{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pitch ────────────────────────────────────────────────── */}
      <section style={{
        background: '#C6FF00',
        padding: sectionPad,
        margin: '0',
      }}>
        <div ref={pitchRef} style={{ maxWidth: '1400px', margin: '0 auto', opacity: 0 }}>
          <div style={{
            fontFamily: 'var(--font-space), sans-serif',
            fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(5,5,5,0.45)', marginBottom: 'clamp(1.5rem,3vw,2rem)',
          }}>{ab.pitch.label}</div>

          <h2 style={{
            fontFamily: 'var(--font-space), sans-serif',
            fontSize: 'clamp(2.5rem,6vw,7rem)',
            fontWeight: 700, letterSpacing: '-0.045em',
            lineHeight: 0.95, color: '#050505',
            whiteSpace: 'pre-line',
            marginBottom: 'clamp(2rem,4vw,3.5rem)',
          }}>{ab.pitch.heading}</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
            gap: 'clamp(1.5rem,4vw,3rem)',
          }}>
            {[ab.pitch.body1, ab.pitch.body2].map((body, i) => (
              <p key={i} style={{
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: 'clamp(0.95rem,1.3vw,1.1rem)',
                lineHeight: 1.65, color: 'rgba(5,5,5,0.65)',
              }}>{body}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────── */}
      <section style={{ padding: sectionPad, maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          fontFamily: 'var(--font-space), sans-serif',
          fontSize: '0.75rem', fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: '#C6FF00', marginBottom: 'clamp(2.5rem,5vw,4rem)',
        }}>What we believe</div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(1px,1.5vw,1.5px)',
          background: 'rgba(240,235,224,0.06)',
          border: '1px solid rgba(240,235,224,0.06)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          {ab.values.map((v, i) => (
            <div
              key={i}
              ref={el => valueRefs.current[i] = el}
              style={{ opacity: 0 }}
            >
              <BorderGlow
                backgroundColor="#050505"
                borderRadius={0}
                glowRadius={35}
                glowIntensity={0.85}
                edgeSensitivity={25}
                colors={['#C6FF00', '#9966ff', '#00c8ff']}
                style={{ height: '100%' }}
              >
                <div style={{ padding: 'clamp(2rem,3vw,2.5rem)' }}>
                  <div style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontSize: '0.65rem', fontWeight: 700,
                    letterSpacing: '0.12em', color: 'rgba(240,235,224,0.2)',
                    marginBottom: 'clamp(1.5rem,2.5vw,2rem)',
                  }}>{v.n}</div>
                  <div style={{
                    fontFamily: 'var(--font-space), sans-serif',
                    fontSize: 'clamp(1rem,1.4vw,1.2rem)',
                    fontWeight: 700, letterSpacing: '-0.01em',
                    color: '#F0EBE0', marginBottom: '0.9rem', lineHeight: 1.2,
                  }}>{v.title}</div>
                  <p style={{
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontSize: 'clamp(0.825rem,1vw,0.9rem)',
                    lineHeight: 1.7, color: 'rgba(240,235,224,0.4)',
                  }}>{v.body}</p>
                </div>
              </BorderGlow>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section style={{
        padding: sectionPad, maxWidth: '1400px', margin: '0 auto',
        display: 'flex', flexDirection: 'column', gap: 'clamp(1.5rem,3vw,2.5rem)',
      }}>
        <div style={{
          fontFamily: 'var(--font-space), sans-serif',
          fontSize: '0.75rem', fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(240,235,224,0.3)',
        }}>{ab.cta.label}</div>

        <div style={{
          fontFamily: 'var(--font-space), sans-serif',
          fontSize: 'clamp(3rem,8vw,9rem)',
          fontWeight: 700, letterSpacing: '-0.045em',
          lineHeight: 0.9, color: '#F0EBE0',
        }}>
          {ab.cta.heading.replace('.', '')}<span style={{ color: '#C6FF00' }}>.</span>
        </div>

        <div>
          <Link href="/contact" style={{
            fontFamily: 'var(--font-space), sans-serif',
            fontSize: '0.9rem', fontWeight: 700,
            letterSpacing: '0.06em', color: '#050505',
            background: '#C6FF00', padding: '1rem 2.5rem',
            borderRadius: '100px', textDecoration: 'none',
            display: 'inline-block',
          }}>{ab.cta.btn}</Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer style={{
        padding: '1.5rem clamp(1.5rem,5vw,4rem)',
        borderTop: '1px solid rgba(240,235,224,0.07)',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
        fontSize: '0.7rem', color: 'rgba(240,235,224,0.25)',
        fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '0.05em',
      }}>
        <span>{t.footer.copy}</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/impressum"   style={{ color: 'rgba(240,235,224,0.25)', textDecoration: 'none' }}>{t.legalNav.impressum}</Link>
          <Link href="/datenschutz" style={{ color: 'rgba(240,235,224,0.25)', textDecoration: 'none' }}>{t.legalNav.datenschutz}</Link>
          <Link href="/agb"         style={{ color: 'rgba(240,235,224,0.25)', textDecoration: 'none' }}>{t.legalNav.agb}</Link>
        </div>
        <span>{t.footer.tagline}</span>
      </footer>
    </>
  );
}
