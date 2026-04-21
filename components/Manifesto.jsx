'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useT } from '@/lib/LangContext';

gsap.registerPlugin(ScrollTrigger);

export default function Manifesto() {
  const sectionRef = useRef(null);
  const lineRefs   = useRef([]);
  const t = useT();
  const { label, lines, sub } = t.manifesto;

  useEffect(() => {
    const section = sectionRef.current;
    const els     = lineRefs.current.filter(Boolean);
    if (!section || !els.length) return;

    const triggers = [];

    els.forEach((line, i) => {
      const inner = line.querySelector('.clip-inner');
      gsap.fromTo(inner,
        { yPercent: 105 },
        {
          yPercent: 0,
          duration: 1.1,
          ease: 'power4.out',
          delay: i * 0.08,
          scrollTrigger: {
            trigger: line,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    const dimEls = els.filter((_, i) => lines[i]?.dim);
    dimEls.forEach(line => {
      gsap.fromTo(line,
        { color: 'rgba(240,235,224,0.12)' },
        {
          color: '#F0EBE0',
          ease: 'none',
          scrollTrigger: {
            trigger: line,
            start: 'top 70%',
            end:   'top 35%',
            scrub: true,
          },
        }
      );
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [lines]);

  return (
    <section
      ref={sectionRef}
      className="vs-section"
      id="about"
      style={{ paddingTop: 'clamp(100px,14vw,180px)', paddingBottom: 'clamp(100px,14vw,180px)' }}
    >
      <div style={{
        fontFamily: 'var(--font-space), sans-serif',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#C6FF00',
        marginBottom: 'clamp(2.5rem,5vw,4rem)',
      }}>
        {label}
      </div>

      {lines.map((line, i) => (
        <div
          key={i}
          ref={el => lineRefs.current[i] = el}
          className={`manifesto-line${line.dim ? ' dim' : ''}`}
        >
          <span className="clip-wrap">
            <span className="clip-inner">{line.text}</span>
          </span>
        </div>
      ))}

      <div style={{
        marginTop: 'clamp(3rem,6vw,6rem)',
        maxWidth: '520px',
        fontSize: 'clamp(0.9rem,1.2vw,1.05rem)',
        lineHeight: 1.65,
        color: 'rgba(240,235,224,0.45)',
        fontFamily: 'var(--font-inter), sans-serif',
      }}>
        {sub}
      </div>
    </section>
  );
}
