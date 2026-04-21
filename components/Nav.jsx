'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLang, useT } from '@/lib/LangContext';

gsap.registerPlugin(ScrollTrigger);

export default function Nav() {
  const navRef             = useRef(null);
  const { lang, setLang } = useLang();
  const t                  = useT();
  const pathname           = usePathname();

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    gsap.set(nav, { opacity: 0, y: -20 });
    gsap.to(nav, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.4 });
    ScrollTrigger.create({
      start: 80,
      onEnter:    () => nav.classList.add('scrolled'),
      onLeaveBack:() => nav.classList.remove('scrolled'),
    });
  }, []);

  const links = [
    { href: '/about',   label: t.nav.about   },
    { href: '/process', label: t.nav.process  },
    { href: '/contact', label: t.nav.contact  },
  ];

  return (
    <nav className="nav" ref={navRef}>
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          VISION<span>.</span>STUDIOS
        </Link>

        <ul className="nav-links">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link href={href} className={active ? 'nav-link active' : 'nav-link'}>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="lang-toggle">
          <button
            className={`lang-btn${lang === 'en' ? ' active' : ''}`}
            onClick={() => setLang('en')}
          >EN</button>
          <span className="lang-sep">/</span>
          <button
            className={`lang-btn${lang === 'de' ? ' active' : ''}`}
            onClick={() => setLang('de')}
          >DE</button>
        </div>
      </div>
    </nav>
  );
}
