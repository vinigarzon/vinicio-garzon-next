'use client';

import Link from 'next/link';
import portfolio from '@/data/portfolio.json';
import Reveal from '@/components/Reveal';

export default function PortfolioPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-primary overflow-hidden">
        <div className="hero-glow bg-accent w-[500px] h-[500px] -top-20 -right-20 opacity-[0.15]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <Reveal>
            <p className="section-label">My Works</p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mb-6">
              Growth Through <span className="text-accent">Loyalty</span> & Learning
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-xl text-text-muted max-w-3xl leading-relaxed">
              A showcase of successful loyalty programs, e-learning platforms, and growth partnerships across Latin America.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.portfolio.map((project, idx) => (
              <Reveal key={project.id} delay={(idx % 3) * 80}>
                <Link href={`/portfolio/${project.id}`} className="block group">
                  <div className="portfolio-card">
                    <img src={project.thumbnail} alt={project.title} className="portfolio-card-image" />
                    <div className="portfolio-card-overlay">
                      <p className="text-xs uppercase tracking-widest text-accent mb-2">{project.category}</p>
                      <h3 className="text-2xl font-display font-bold mb-3">{project.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-text">
                        View Project
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-display font-bold group-hover:text-accent transition">
                        {project.title}
                      </h3>
                      <p className="text-text-muted text-sm uppercase tracking-wider mt-1">{project.category}</p>
                    </div>
                    <span className="text-text-dim text-xs">{project.year}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-secondary border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <h2 className="mb-6">
              Ready to Create Your <span className="text-accent">Success Story</span>?
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-text-muted text-lg mb-10 max-w-2xl mx-auto">
              Let's discuss how we can build a loyalty program or growth strategy that drives real results.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <a href="mailto:yo@viniciogarzon.com" className="btn-primary">
              Start a Project
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
