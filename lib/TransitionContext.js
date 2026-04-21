'use client';

import { createContext, useContext, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from 'gsap';

const TransitionContext = createContext({ navigate: () => {} });

export function TransitionProvider({ children }) {
  const overlayRef   = useRef(null);
  const router       = useRouter();
  const pathname     = usePathname();
  const pathnameRef  = useRef(pathname);   // always-current pathname for navigate()

  // Keep pathnameRef in sync
  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

  // New page mounted — animate overlay out
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.to(el, {
      opacity: 0, duration: 0.35, ease: 'power2.out', delay: 0.05,
      onComplete: () => { el.style.pointerEvents = 'none'; },
    });
  }, [pathname]);

  const navigate = (href) => {
    // Same page — do nothing
    if (href === pathnameRef.current) return;

    const el = overlayRef.current;
    if (!el) { router.push(href); return; }

    el.style.pointerEvents = 'all';
    gsap.killTweensOf(el);
    // Start overlay fade AND navigate at the same time —
    // page loads under the overlay while it's coming in
    gsap.to(el, { opacity: 1, duration: 0.15, ease: 'power2.in' });
    router.push(href);
  };

  return (
    <TransitionContext.Provider value={{ navigate }}>
      <div
        ref={overlayRef}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#050505',
          opacity: 0, pointerEvents: 'none',
        }}
      />
      {children}
    </TransitionContext.Provider>
  );
}

export function usePageTransition() {
  return useContext(TransitionContext);
}
