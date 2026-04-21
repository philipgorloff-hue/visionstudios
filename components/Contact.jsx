'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useT } from '@/lib/LangContext';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef(null);
  const headRef    = useRef(null);
  const subRef     = useRef(null);
  const t = useT();
  const { label, words } = t.contactSection;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const triggers = [];

    const wordEls = headRef.current?.querySelectorAll('.hw');
    if (wordEls) {
      const tw = gsap.fromTo(
        [...wordEls],
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1.2,
          ease: 'power4.out',
          stagger: 0.06,
          scrollTrigger: { trigger: section, start: 'top 75%' },
        }
      );
      triggers.push(tw.scrollTrigger);
    }

    const tw2 = gsap.fromTo(subRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: subRef.current, start: 'top 85%' },
        delay: 0.3,
      }
    );
    triggers.push(tw2.scrollTrigger);

    return () => triggers.forEach(st => st?.kill());
  }, [words]);

  return (
    <section
      ref={sectionRef}
      id="contact"
      style={{
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(80px,10vw,140px) clamp(1.5rem,5vw,4rem)',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      <div style={{
        fontFamily: 'var(--font-space), sans-serif',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#C6FF00',
        marginBottom: 'clamp(1.5rem,3vw,2.5rem)',
      }}>{label}</div>

      <h2 ref={headRef} className="contact-huge">
        {words.map((word, i) => (
          <span key={i} style={{ overflow: 'hidden', display: 'block' }}>
            <span className="hw" style={{ display: 'block' }}>
              {i === words.length - 1 ? (
                <>{word}<span className="accent">.</span></>
              ) : word}
            </span>
          </span>
        ))}
      </h2>

      <div ref={subRef} style={{
        marginTop: 'clamp(3rem,6vw,5rem)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        alignItems: 'center',
        opacity: 0,
      }}>
        <a
          href="mailto:philipg.orloff@gmail.com"
          style={{
            fontFamily: 'var(--font-space), sans-serif',
            fontSize: 'clamp(1rem,2vw,1.4rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#F0EBE0',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(240,235,224,0.2)',
            paddingBottom: '0.2em',
            transition: 'color 0.25s, border-color 0.25s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#C6FF00'; e.currentTarget.style.borderColor = '#C6FF00'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#F0EBE0'; e.currentTarget.style.borderColor = 'rgba(240,235,224,0.2)'; }}
        >
          philipg.orloff@gmail.com
        </a>
        <a
          href="mailto:philipg.orloff@gmail.com"
          style={{
            fontFamily: 'var(--font-space), sans-serif',
            fontSize: '0.9rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: '#050505',
            background: '#C6FF00',
            padding: '1rem 2.5rem',
            borderRadius: '100px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'background 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#A8DB00'; e.currentTarget.style.boxShadow = '0 0 50px rgba(198,255,0,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#C6FF00'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          {t.contactSection.label} →
        </a>
      </div>
    </section>
  );
}
