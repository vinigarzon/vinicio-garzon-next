'use client';

interface MarqueeProps {
  items: string[];
  reverse?: boolean;
}

export default function Marquee({ items, reverse = false }: MarqueeProps) {
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden py-8 bg-primary border-y border-border">
      <div
        className={`flex gap-16 whitespace-nowrap ${
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        }`}
      >
        {doubled.map((item, idx) => (
          <div key={idx} className="flex items-center gap-16 flex-shrink-0">
            <span className="text-5xl md:text-7xl font-display font-bold text-text uppercase tracking-tight">
              {item}
            </span>
            <span className="text-4xl md:text-6xl text-accent">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
