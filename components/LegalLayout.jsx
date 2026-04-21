'use client';

import Link from 'next/link';
import Nav from '@/components/Nav';
import { useT } from '@/lib/LangContext';

export default function LegalLayout({ pageKey }) {
  const t    = useT();
  const page = t[pageKey];

  return (
    <>
      <Nav />
      <main style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: 'clamp(7rem,12vw,10rem) clamp(1.5rem,5vw,4rem) clamp(4rem,8vw,7rem)',
      }}>
        {/* Back */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          fontFamily: 'var(--font-space), sans-serif',
          fontSize: '0.75rem', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'rgba(240,235,224,0.35)', textDecoration: 'none',
          marginBottom: 'clamp(2.5rem,5vw,4rem)',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#C6FF00'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,235,224,0.35)'}
        >
          ← Vision Studios
        </Link>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-space), sans-serif',
          fontSize: 'clamp(2.5rem,6vw,5rem)',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          lineHeight: 0.95,
          color: '#F0EBE0',
          marginBottom: '1.25rem',
        }}>{page.title}</h1>

        <p style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '0.8rem',
          color: 'rgba(240,235,224,0.3)',
          marginBottom: 'clamp(3rem,6vw,5rem)',
          letterSpacing: '0.04em',
        }}>{page.updated}</p>

        {/* Sections */}
        {page.sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 'clamp(2rem,4vw,3rem)' }}>
            <h2 style={{
              fontFamily: 'var(--font-space), sans-serif',
              fontSize: 'clamp(1rem,1.4vw,1.2rem)',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: '#C6FF00',
              marginBottom: '0.9rem',
            }}>{s.h}</h2>
            {s.p.split('\n\n').map((para, j) => (
              para.startsWith('•') ? (
                // bullet list block
                <div key={j} style={{ marginBottom: '0.6rem' }}>
                  {para.split('\n').map((line, k) => (
                    <p key={k} style={{
                      fontFamily: 'var(--font-inter), sans-serif',
                      fontSize: 'clamp(0.875rem,1.1vw,0.975rem)',
                      lineHeight: 1.75,
                      color: 'rgba(240,235,224,0.6)',
                      paddingLeft: line.startsWith('•') ? '0' : '0',
                    }}>{line}</p>
                  ))}
                </div>
              ) : (
                <p key={j} style={{
                  fontFamily: 'var(--font-inter), sans-serif',
                  fontSize: 'clamp(0.875rem,1.1vw,0.975rem)',
                  lineHeight: 1.75,
                  color: 'rgba(240,235,224,0.6)',
                  marginBottom: '0.75rem',
                  whiteSpace: 'pre-line',
                }}>{para}</p>
              )
            ))}
            {i < page.sections.length - 1 && (
              <div style={{ height: '1px', background: 'rgba(240,235,224,0.06)', marginTop: 'clamp(1.5rem,3vw,2.5rem)' }} />
            )}
          </div>
        ))}
      </main>

      <footer style={{
        padding: '1.5rem clamp(1.5rem,5vw,4rem)',
        borderTop: '1px solid rgba(240,235,224,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
        fontSize: '0.7rem', color: 'rgba(240,235,224,0.2)',
        fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '0.05em',
      }}>
        <span>{t.footer.copy}</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/impressum"   style={{ color: 'rgba(240,235,224,0.2)', textDecoration: 'none' }}>{t.legalNav.impressum}</Link>
          <Link href="/datenschutz" style={{ color: 'rgba(240,235,224,0.2)', textDecoration: 'none' }}>{t.legalNav.datenschutz}</Link>
          <Link href="/agb"         style={{ color: 'rgba(240,235,224,0.2)', textDecoration: 'none' }}>{t.legalNav.agb}</Link>
        </div>
        <span>{t.footer.tagline}</span>
      </footer>
    </>
  );
}
