'use client';

import { useEffect, useRef } from 'react';

export default function Cursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const spotRef = useRef(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    const spot = spotRef.current;
    if (!dot || !ring || !spot) return;

    let mx = window.innerWidth  / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let raf;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left  = mx + 'px';
      dot.style.top   = my + 'px';
      spot.style.left = mx + 'px';
      spot.style.top  = my + 'px';
    };

    const onDown = () => document.body.classList.add('cursor-down');
    const onUp   = () => document.body.classList.remove('cursor-down');

    const onEnter = () => document.body.classList.add('cursor-hover');
    const onLeave = () => document.body.classList.remove('cursor-hover');

    function loop() {
      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      raf = requestAnimationFrame(loop);
    }
    loop();

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup',   onUp);

    const addHover = () => {
      document.querySelectorAll('a,button,[data-hover]').forEach(el => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };
    // Run after a tick so dynamic elements exist
    const t = setTimeout(addHover, 500);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
      clearTimeout(t);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot"       ref={dotRef}  />
      <div className="cursor-ring"      ref={ringRef} />
      <div className="cursor-spotlight" ref={spotRef} />
    </>
  );
}
