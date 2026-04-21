'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

export default function Reveal({ children, delay = 0, className = '', as = 'div' }: RevealProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const Tag = as as any;

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
