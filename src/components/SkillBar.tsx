'use client';

import { useScrollReveal, useCounter } from '@/hooks/useScrollReveal';

interface SkillBarProps {
  name: string;
  percentage: number;
  icon: string;
}

export default function SkillBar({ name, percentage, icon }: SkillBarProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const count = useCounter(percentage, 1500, isVisible);

  return (
    <div ref={ref} className="flex flex-col items-center gap-3 group">
      <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-2xl bg-secondary-light border border-border hover:border-accent transition-all duration-300 p-4">
        <img
          src={icon}
          alt={name}
          className="w-full h-full object-contain filter brightness-100 group-hover:brightness-125 transition"
        />
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-2xl md:text-3xl font-display font-bold text-accent tabular-nums">
          {count}
        </span>
        <span className="text-lg font-display font-bold text-accent">%</span>
      </div>
      <p className="text-text-muted text-xs md:text-sm uppercase tracking-wider text-center font-medium">
        {name}
      </p>
    </div>
  );
}
