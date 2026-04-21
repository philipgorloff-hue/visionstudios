'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useT } from '@/lib/LangContext';

gsap.registerPlugin(ScrollTrigger);

export default function Services() {
  const sectionRef = useRef(null);
  const headRef    = useRef(null);
  const rowRefs    = useRef([]);
  const t = useT();
  const { label, title, cta, items } = t.services;

  useEffect(() => {
    const triggers = [];

    const t0 = gsap.fromTo(headRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: headRef.current, start: 'top 88%' } }
    );
    triggers.push(t0.scrollTrigger);

    rowRefs.current.filter(Boolean).forEach((row, i) => {
      const tw = gsap.fromTo(row,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          delay: i * 0.07,
          scrollTrigger: { trigger: row, start: 'top 90%' } }
      );
      triggers.push(tw.scrollTrigger);
    });

    return () => triggers.forEach(st => st?.kill());
  }, []);

  return (
    <section ref={sectionRef} className="vs-section" id="services">

      {/* Header row */}
      <div ref={headRef} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: 'clamp(3rem,6vw,5rem)', flexWrap: 'wrap', gap: '1rem',
        opacity: 0,
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-space), sans-serif',
            fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#C6FF00', marginBottom: '0.6rem',
          }}>{label}</div>
          <h2 style={{
            fontFamily: 'var(--font-space), sans-serif',
            fontSize: 'clamp(2.2rem,4.5vw,4rem)',
            fontWeight: 700, letterSpacing: '-0.04em', color: '#F0EBE0', lineHeight: 1,
          }}>{title}</h2>
        </div>
        <Link href="/contact" style={{
          fontFamily: 'var(--font-space), sans-serif',
          fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em',
          color: '#050505', background: '#C6FF00',
          padding: '0.65rem 1.6rem', borderRadius: '100px',
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}>{cta}</Link>
      </div>

      {/* Service rows */}
      <div style={{ borderTop: '1px solid rgba(240,235,224,0.08)' }}>
        {items.map((svc, i) => (
          <a
            key={i}
            ref={el => rowRefs.current[i] = el}
            href="/contact"
            className="svc-row"
            style={{ opacity: 0 }}
          >
            <span className="svc-row-num">{svc.num}</span>
            <span className="svc-row-name">{svc.name}</span>
            <span className="svc-row-cat">{svc.cat}</span>
            <span className="svc-row-arr">→</span>
          </a>
        ))}
      </div>
    </section>
  );
}
