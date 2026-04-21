'use client';

import { usePageTransition } from '@/lib/TransitionContext';

export default function TransitionLink({ href, children, className, style, ...rest }) {
  const { navigate } = usePageTransition();

  return (
    <a
      href={href}
      className={className}
      style={style}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
