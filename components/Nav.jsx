'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLang, useT } from '@/lib/LangContext';

gsap.registerPlugin(ScrollTrigger);

export default function Nav() {
  const navRef             = useRef(null);
  const menuRef            = useRef(null);
  const { lang, setLang } = useLang();
  const t                  = useT();
  const pathname           = usePathname();
  const [open, setOpen]    = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    gsap.set(nav, { opacity: 0, y: -20 });
    gsap.to(nav, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.4 });
    ScrollTrigger.create({
      start: 80,
      onEnter:     () => nav.classList.add('scrolled'),
      onLeaveBack: () => nav.classList.remove('scrolled'),
    });
  }, []);

  // Animate mobile menu open/close
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    if (open) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo(el,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }
      );
      const items = el.querySelectorAll('.mob-link, .mob-lang');
      gsap.fromTo(items,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.07, delay: 0.1 }
      );
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const links = [
    { href: '/about',   label: t.nav.about   },
    { href: '/process', label: t.nav.process  },
    { href: '/contact', label: t.nav.contact  },
  ];

  return (
    <>
      <nav className="nav" ref={navRef}>
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            VISION<span>.</span>STUDIOS
          </Link>

          {/* Desktop links */}
          <ul className="nav-links">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={pathname === href ? 'nav-link active' : 'nav-link'}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop lang + hamburger */}
          <div className="nav-right">
            <div className="lang-toggle">
              <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
              <span className="lang-sep">/</span>
              <button className={`lang-btn${lang === 'de' ? ' active' : ''}`} onClick={() => setLang('de')}>DE</button>
            </div>

            <button
              className="hamburger"
              onClick={() => setOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <span className={`ham-line${open ? ' open' : ''}`} />
              <span className={`ham-line${open ? ' open' : ''}`} />
              <span className={`ham-line${open ? ' open' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      {open && (
        <div className="mob-menu" ref={menuRef}>
          <nav className="mob-links">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`mob-link${pathname === href ? ' active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {label}
                {pathname === href && <span className="mob-dot" />}
              </Link>
            ))}
          </nav>

          <div className="mob-lang">
            <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <span className="lang-sep">/</span>
            <button className={`lang-btn${lang === 'de' ? ' active' : ''}`} onClick={() => setLang('de')}>DE</button>
          </div>
        </div>
      )}
    </>
  );
}
