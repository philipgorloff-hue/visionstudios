'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Preloader() {
  const preRef  = useRef(null);
  const countRef = useRef(null);
  const barRef   = useRef(null);

  useEffect(() => {
    const pre   = preRef.current;
    const count = countRef.current;
    const bar   = barRef.current;
    if (!pre) return;

    document.documentElement.classList.add('is-loading');

    let n = 0;
    const tick = setInterval(() => {
      n += Math.random() * 3.5 + 1.2;
      if (n >= 100) { n = 100; clearInterval(tick); done(); }
      if (count) count.textContent = Math.floor(n);
      if (bar)   bar.style.width = n + '%';
    }, 28);

    function done() {
      setTimeout(() => {
        gsap.to(pre, {
          yPercent: -100,
          duration: 0.9,
          ease: 'power3.inOut',
          onComplete: () => {
            pre.style.display = 'none';
            document.documentElement.classList.remove('is-loading');
            // Dispatch event so other components can start their intros
            window.dispatchEvent(new CustomEvent('preloader-done'));
          },
        });
      }, 200);
    }

    return () => clearInterval(tick);
  }, []);

  return (
    <div id="preloader" ref={preRef}>
      <div className="pre-logo">VISION<span>.</span>STUDIOS</div>
      <div className="pre-count" ref={countRef}>0</div>
      <div className="pre-bar-wrap">
        <div className="pre-bar" ref={barRef} />
      </div>
    </div>
  );
}
