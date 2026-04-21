'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import Manifesto from '@/components/Manifesto';
import Services from '@/components/Services';
import Contact from '@/components/Contact';
import { useT } from '@/lib/LangContext';

const HeroScene = dynamic(() => import('@/components/HeroScene'), { ssr: false });

export default function Home() {
  const t = useT();

  return (
    <>
      <main>
        <HeroScene />
        <Manifesto />
        <Services />
        <Contact />
      </main>
      <footer style={{
        padding: '2rem clamp(1.5rem,5vw,4rem)',
        borderTop: '1px solid rgba(240,235,224,0.07)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.75rem',
        color: 'rgba(240,235,224,0.3)',
        fontFamily: 'var(--font-inter), sans-serif',
      }}>
        <span>{t.footer.copy}</span>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/impressum"   style={{ color: 'rgba(240,235,224,0.3)', textDecoration: 'none' }}>{t.legalNav.impressum}</Link>
          <Link href="/datenschutz" style={{ color: 'rgba(240,235,224,0.3)', textDecoration: 'none' }}>{t.legalNav.datenschutz}</Link>
          <Link href="/agb"         style={{ color: 'rgba(240,235,224,0.3)', textDecoration: 'none' }}>{t.legalNav.agb}</Link>
        </div>
        <span>{t.footer.tagline}</span>
      </footer>
    </>
  );
}
