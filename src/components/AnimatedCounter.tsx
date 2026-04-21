'use client';

import { useScrollReveal, useCounter } from '@/hooks/useScrollReveal';

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  label: string;
  duration?: number;
}

export default function AnimatedCounter({ target, suffix = '', label, duration = 2000 }: AnimatedCounterProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const count = useCounter(target, duration, isVisible);

  return (
    <div ref={ref} className="text-center">
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-accent leading-none tabular-nums">
          {count}
        </span>
        {suffix && (
          <span className="text-4xl md:text-5xl font-display font-bold text-accent">
            {suffix}
          </span>
        )}
      </div>
      <p className="text-text-muted uppercase tracking-widest text-xs md:text-sm mt-4 font-medium">
        {label}
      </p>
    </div>
  );
}
