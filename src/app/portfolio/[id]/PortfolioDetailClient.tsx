'use client';

import Link from 'next/link';
import portfolio from '@/data/portfolio.json';
import { notFound } from 'next/navigation';
import Reveal from '@/components/Reveal';

export default function PortfolioDetailClient({ id }: { id: string }) {
  const projectIdx = portfolio.portfolio.findIndex(p => p.id === id);

  if (projectIdx === -1) notFound();

  const project = portfolio.portfolio[projectIdx];
  const nextProject = portfolio.portfolio[(projectIdx + 1) % portfolio.portfolio.length];
  const otherProjects = portfolio.portfolio.filter(p => p.id !== id);

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-primary overflow-hidden">
        <div className="hero-glow bg-accent w-[500px] h-[500px] -top-20 right-0 opacity-[0.1]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <Link href="/#portfolio" className="text-text-muted hover:text-accent text-sm mb-8 inline-flex items-center gap-2 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Portfolio
          </Link>

          <Reveal>
            <p className="section-label">{project.category}</p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mb-6">{project.title}</h1>
          </Reveal>
          <Reveal delay={200}>
            <div className="flex flex-wrap gap-2 mb-8">
              {project.tags.map(tag => (
                <span key={tag} className="text-xs bg-secondary-light border border-border text-text-muted px-4 py-2 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={300}>
            <p className="text-xl text-text-muted max-w-3xl leading-relaxed">{project.fullDescription}</p>
          </Reveal>
        </div>
      </section>

      {/* Hero image */}
      <section className="px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-secondary-light">
              <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Project info grid */}
      <section className="py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <Reveal>
              <div>
                <h4 className="text-xs uppercase tracking-widest text-accent mb-3 font-semibold">Deliverables</h4>
                <ul className="space-y-2">
                  {project.deliverables.map((d, i) => (
                    <li key={i} className="text-text-muted text-sm">{d}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div>
                <h4 className="text-xs uppercase tracking-widest text-accent mb-3 font-semibold">Key Achievements</h4>
                <ul className="space-y-2">
                  {project.achievements.map((a, i) => (
                    <li key={i} className="text-text-muted text-sm">{a}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div>
                <h4 className="text-xs uppercase tracking-widest text-accent mb-3 font-semibold">Client</h4>
                <p className="text-text text-lg font-display font-semibold">{project.client}</p>
              </div>
            </Reveal>
            <Reveal delay={300}>
              <div>
                <h4 className="text-xs uppercase tracking-widest text-accent mb-3 font-semibold">Year</h4>
                <p className="text-text text-lg font-display font-semibold">{project.year}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What I Do for this project */}
      {project.services && project.services.length > 0 && (
        <section className="py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-secondary border-y border-border">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <p className="section-label">Scope of Work</p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="max-w-3xl mb-16">
                Areas of <span className="text-accent">involvement</span> in this project.
              </h2>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6">
              {project.services.map((service, idx) => (
                <Reveal key={idx} delay={idx * 100}>
                  <div className="card h-full">
                    <div className="number-badge mb-5">{idx + 1}</div>
                    <h3 className="text-xl font-display font-bold mb-3">{service.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{service.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {project.gallery && project.gallery.length > 0 && (
        <section className="py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-primary">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <p className="section-label">Visuals</p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mb-16">Project <span className="text-accent">Gallery</span></h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.gallery.map((img, idx) => (
                <Reveal key={idx} delay={(idx % 2) * 100}>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-secondary-light border border-border hover:border-accent transition">
                    <img src={img} alt={`${project.title} visual ${idx + 1}`} className="w-full h-full object-contain p-8" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {project.testimonials && project.testimonials.length > 0 && (
        <section className="py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-secondary">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {project.testimonials.map((t, idx) => (
                <Reveal key={idx} delay={idx * 100}>
                  <div className="card h-full">
                    <svg className="w-10 h-10 text-accent opacity-40 mb-4" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
                    </svg>
                    <p className="text-text-muted italic leading-relaxed mb-6">"{t.quote}"</p>
                    <div className="pt-4 border-t border-border">
                      <p className="text-accent font-display font-semibold">{t.author}</p>
                      {t.role && <p className="text-text-dim text-sm">{t.role}</p>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Next project */}
      <section className="py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-primary border-t border-border">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="text-xs uppercase tracking-widest text-text-muted mb-4">Next Project</p>
          </Reveal>
          <Link href={`/portfolio/${nextProject.id}`} className="group block">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <Reveal delay={100}>
                  <h2 className="group-hover:text-accent transition mb-3">
                    {nextProject.title}
                  </h2>
                </Reveal>
                <Reveal delay={200}>
                  <p className="text-text-muted text-lg uppercase tracking-wider">{nextProject.category}</p>
                </Reveal>
              </div>
              <Reveal delay={300}>
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-secondary-light shrink-0 group-hover:scale-105 transition">
                  <img src={nextProject.thumbnail} alt={nextProject.title} className="w-full h-full object-cover" />
                </div>
              </Reveal>
            </div>
          </Link>
        </div>
      </section>

      {/* Other works */}
      <section className="py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="section-label">Other Works</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mb-16">More <span className="text-accent">Projects</span></h2>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {otherProjects.slice(0, 5).map((p, idx) => (
              <Reveal key={p.id} delay={idx * 80}>
                <Link href={`/portfolio/${p.id}`} className="block group">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-primary border border-border group-hover:border-accent transition mb-3">
                    <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <h4 className="font-display font-bold text-sm group-hover:text-accent transition">{p.title}</h4>
                  <p className="text-text-muted text-xs uppercase tracking-wider mt-1">{p.category}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}