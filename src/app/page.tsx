'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import portfolio from '@/data/portfolio.json';
import blog from '@/data/blog.json';
import resume from '@/data/resume.json';
import Reveal from '@/components/Reveal';
import Marquee from '@/components/Marquee';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';

const AnimatedCounter = dynamic(() => import('@/components/AnimatedCounter'), { ssr: false });
const SkillBar = dynamic(() => import('@/components/SkillBar'), { ssr: false });

export default function Home() {
  const projects = portfolio.portfolio;
  const recentPosts = blog.posts.slice(0, 5);

  return (
    <div className="w-full">
      {/* HERO */}
      <section id="home" className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        <div className="hero-glow bg-accent w-[500px] h-[500px] top-0 -left-40" />
        <div className="hero-glow bg-accent w-[400px] h-[400px] bottom-0 -right-20" />
        <div className="noise-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <Reveal>
                <p className="section-label">Personal & Professional Profile</p>
              </Reveal>

              <Reveal delay={100}>
                <h1 className="mb-6">
                  Vinicio <span className="text-accent">Garzón</span>
                </h1>
              </Reveal>

              <Reveal delay={200}>
                <p className="text-xl md:text-2xl text-text-muted max-w-2xl mb-10 leading-relaxed">
                  Professional background in loyalty, rewards, and e-learning across Latin America. Currently pursuing academic studies in Sport Management at North Central College.
                </p>
              </Reveal>

              <Reveal delay={300}>
                <div className="flex flex-wrap gap-4 mb-12">
                  <a href="#about-me" className="btn-primary">
                    Learn More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                  <a href="#portfolio" className="btn-outline">
                    Explore Selected Work
                  </a>
                </div>
              </Reveal>
            </div>

            <div className="md:col-span-4">
              <Reveal delay={400}>
                <div className="card bg-secondary-light border border-border p-8">
                  <h3 className="text-2xl font-display font-bold mb-4">
                    <span className="text-accent">Current</span> Focus
                  </h3>
                  <p className="text-text-muted text-sm mb-6 leading-relaxed">
                    Active academic path in Sport Management, alongside ongoing professional projects in Latin America and the United States.
                  </p>
                  <p className="text-text-muted text-xs uppercase tracking-widest mb-2">
                    Contact
                  </p>
                  <a
                    href="mailto:yo@viniciogarzon.com"
                    className="text-text hover:text-accent transition text-base font-medium block break-all"
                  >
                    yo@viniciogarzon.com
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-text-muted flex justify-center p-1.5">
            <div className="w-1 h-2 bg-accent rounded-full" />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about-me" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-primary border-t border-border">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <p className="section-label">About</p>
          </Reveal>

          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7">
              <Reveal delay={100}>
                <h2 className="mb-8">
                  A professional background in <span className="text-accent">loyalty</span>, <span className="text-accent">rewards</span>, and <span className="text-accent">e-learning</span>.
                </h2>
              </Reveal>

              <Reveal delay={200}>
                <p className="text-text-muted text-lg leading-relaxed mb-6">
                  Over two decades of experience in Latin America, with work focused on loyalty programs, customer engagement, educational platforms, and organizational growth initiatives.
                </p>
              </Reveal>

              <Reveal delay={300}>
                <p className="text-text-muted text-lg leading-relaxed mb-6">
                  The professional trajectory includes founding companies in loyalty and e-learning, as well as operational roles in national sales management. Areas of experience include strategy, data-informed decision making, and training programs for entrepreneurs and small organizations.
                </p>
              </Reveal>

              <Reveal delay={400}>
                <p className="text-accent text-xl font-display font-semibold">
                  Currently based in Naperville, USA.
                </p>
              </Reveal>
            </div>

            <div className="md:col-span-5">
              <Reveal delay={200}>
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                  <img
                    src="https://www.viniciogarzon.com/wp-content/uploads/2025/01/naperville.jpg"
                    alt="Vinicio Garzón in Naperville"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-xs uppercase tracking-widest text-accent mb-2">Based in</p>
                    <p className="text-2xl font-display font-bold">Naperville, USA</p>
                    <p className="text-sm text-text-muted mt-1">Latin America · United States</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* AREAS OF EXPERIENCE */}
      <section id="what-i-do" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-secondary relative overflow-hidden">
        <div className="hero-glow bg-accent w-[400px] h-[400px] top-0 right-0 opacity-[0.15]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Reveal>
              <p className="section-label justify-center">Areas of Experience</p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="max-w-4xl mx-auto mb-6">
                Professional work in <span className="text-accent">loyalty</span>, education, and organizational growth.
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-text-muted text-lg max-w-3xl mx-auto leading-relaxed">
                Overview of the main areas where the professional experience has been developed, with a focus on applied work across Latin America.
              </p>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resume.services.map((service, idx) => (
              <Reveal key={service.number} delay={idx * 80}>
                <div className="card group h-full hover:bg-secondary-light">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-xl bg-primary border border-border p-3 group-hover:border-accent transition">
                      <img src={service.icon} alt={service.title} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-5xl font-display font-bold text-accent/20 group-hover:text-accent/60 transition">
                      {service.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-bold mb-3">{service.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{service.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-primary border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {resume.stats.map((stat, idx) => (
              <Reveal key={idx} delay={idx * 100}>
                <AnimatedCounter
                  target={stat.number}
                  suffix={stat.suffix}
                  label={stat.label}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* REFERENCES */}
      <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-secondary relative overflow-hidden">
        <div className="hero-glow bg-accent w-[500px] h-[500px] bottom-0 left-1/4 opacity-[0.1]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Reveal>
              <p className="section-label justify-center">References</p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="max-w-3xl mx-auto">
                Notes from <span className="text-accent">colleagues</span> and collaborators.
              </h2>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <TestimonialsCarousel testimonials={resume.testimonials} />
          </Reveal>
        </div>
      </section>

      {/* SELECTED PROJECTS */}
      <section id="portfolio" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <Reveal>
                <p className="section-label">Selected Projects</p>
              </Reveal>
              <Reveal delay={100}>
                <h2 className="max-w-2xl">
                  Work in <span className="text-accent">loyalty</span>, learning, and development.
                </h2>
              </Reveal>
            </div>
            <Reveal delay={200}>
              <Link href="/portfolio" className="btn-outline shrink-0">
                View All Projects
              </Link>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <Reveal key={project.id} delay={(idx % 3) * 80}>
                <Link href={`/portfolio/${project.id}`} className="block group">
                  <div className="portfolio-card">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="portfolio-card-image"
                    />
                    <div className="portfolio-card-overlay">
                      <p className="text-xs uppercase tracking-widest text-accent mb-2">
                        {project.category}
                      </p>
                      <h3 className="text-2xl font-display font-bold mb-3">{project.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-text">
                        View Project
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xl font-display font-bold group-hover:text-accent transition">
                      {project.title}
                    </h3>
                    <p className="text-text-muted text-sm uppercase tracking-wider mt-1">
                      {project.category}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* RESUME */}
      <section id="my-resume" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Reveal>
              <p className="section-label justify-center">Academic & Professional Background</p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="max-w-4xl mx-auto">
                Experience, <span className="text-accent">education</span>, and current studies.
              </h2>
            </Reveal>
          </div>

          {/* Current Studies */}
          <div className="mb-20">
            <Reveal>
              <h3 className="text-2xl font-display font-bold mb-10 flex items-center gap-3">
                <span className="w-10 h-px bg-accent" />
                Current Studies
              </h3>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-6">
              {resume.currentStudies.map((item, idx) => (
                <Reveal key={item.number} delay={idx * 100}>
                  <div className="card border-accent/40">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <p className="text-accent text-sm font-medium uppercase tracking-wider">
                        {item.period}
                      </p>
                    </div>
                    <h4 className="text-xl font-display font-bold mb-1">{item.title}</h4>
                    <p className="text-text-muted text-sm mb-3 font-medium">{item.institution}</p>
                    <p className="text-text-muted text-sm leading-relaxed">{item.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Experience */}
            <div>
              <Reveal>
                <h3 className="text-2xl font-display font-bold mb-10 flex items-center gap-3">
                  <span className="w-10 h-px bg-accent" />
                  Professional Experience
                </h3>
              </Reveal>

              <div className="relative pl-8 border-l border-border space-y-10">
                {resume.experience.map((exp, idx) => (
                  <Reveal key={exp.number} delay={idx * 100}>
                    <div className="relative">
                      <span className="timeline-dot" />
                      <p className="text-accent text-sm font-medium mb-2 uppercase tracking-wider">
                        {exp.period}
                      </p>
                      <h4 className="text-xl font-display font-bold mb-1">{exp.title}</h4>
                      <p className="text-text-muted text-sm mb-3 font-medium">{exp.company}</p>
                      <p className="text-text-muted text-sm leading-relaxed">{exp.description}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Completed Degrees */}
            <div>
              <Reveal>
                <h3 className="text-2xl font-display font-bold mb-10 flex items-center gap-3">
                  <span className="w-10 h-px bg-accent" />
                  Completed Degrees
                </h3>
              </Reveal>

              <div className="relative pl-8 border-l border-border space-y-10">
                {resume.education.map((edu, idx) => (
                  <Reveal key={edu.number} delay={idx * 100}>
                    <div className="relative">
                      <span className="timeline-dot" />
                      <p className="text-accent text-sm font-medium mb-2 uppercase tracking-wider">
                        {edu.period}
                      </p>
                      <h4 className="text-xl font-display font-bold mb-1">{edu.title}</h4>
                      <p className="text-text-muted text-sm mb-3 font-medium">{edu.institution}</p>
                      <p className="text-text-muted text-sm leading-relaxed">{edu.description}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Training */}
          {resume.additionalTraining && resume.additionalTraining.length > 0 && (
            <div className="mt-20">
              <Reveal>
                <h3 className="text-2xl font-display font-bold mb-10 flex items-center gap-3">
                  <span className="w-10 h-px bg-accent" />
                  Additional Academic Training
                </h3>
              </Reveal>

              <div className="grid md:grid-cols-2 gap-6">
                {resume.additionalTraining.map((item, idx) => (
                  <Reveal key={item.number} delay={idx * 100}>
                    <div className="card">
                      <p className="text-accent text-sm font-medium mb-2 uppercase tracking-wider">
                        {item.period}
                      </p>
                      <h4 className="text-xl font-display font-bold mb-1">{item.title}</h4>
                      <p className="text-text-muted text-sm mb-3 font-medium">{item.institution}</p>
                      <p className="text-text-muted text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* TECHNICAL PROFICIENCY */}
      <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-primary relative overflow-hidden">
        <div className="hero-glow bg-accent w-[400px] h-[400px] top-20 right-0 opacity-[0.1]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Reveal>
              <p className="section-label justify-center">Tools</p>
            </Reveal>
            <Reveal delay={100}>
              <h2>
                Technical <span className="text-accent">Proficiency</span>
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 md:gap-8">
            {resume.skills.map((skill, idx) => (
              <Reveal key={skill.name} delay={(idx % 8) * 50}>
                <SkillBar
                  name={skill.name}
                  percentage={skill.percentage}
                  icon={skill.icon}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WRITINGS */}
      <section id="blog" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <Reveal>
                <p className="section-label">Writings</p>
              </Reveal>
              <Reveal delay={100}>
                <h2 className="max-w-2xl">
                  Notes and <span className="text-accent">observations</span>.
                </h2>
              </Reveal>
            </div>
            <Reveal delay={200}>
              <Link href="/blog" className="btn-outline shrink-0">
                View All Articles
              </Link>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.slice(0, 3).map((post, idx) => (
              <Reveal key={post.id} delay={idx * 100}>
                <Link href={`/blog/${post.slug}`} className="block group">
                  <article className="card h-full overflow-hidden p-0">
                    <div className="aspect-[16/10] overflow-hidden bg-primary">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium uppercase tracking-wider">
                          {post.category}
                        </span>
                        <span className="text-xs text-text-dim">
                          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-lg font-display font-bold mb-3 group-hover:text-accent transition line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-text-muted text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                      <span className="text-accent text-sm font-medium flex items-center gap-1">
                        Read More
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </article>
                </Link>
              </Reveal>
            ))}
          </div>

          {recentPosts.length > 3 && (
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {recentPosts.slice(3, 5).map((post, idx) => (
                <Reveal key={post.id} delay={idx * 100}>
                  <Link href={`/blog/${post.slug}`} className="block group">
                    <article className="card h-full overflow-hidden p-0 flex flex-col sm:flex-row">
                      <div className="sm:w-2/5 aspect-[16/10] sm:aspect-auto overflow-hidden bg-primary">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-6 sm:w-3/5">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium uppercase tracking-wider">
                            {post.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-display font-bold mb-3 group-hover:text-accent transition line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-text-muted text-sm line-clamp-2">{post.excerpt}</p>
                      </div>
                    </article>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-primary relative overflow-hidden">
        <div className="hero-glow bg-accent w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.1]" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <Reveal>
            <p className="section-label justify-center">Contact</p>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="mb-8">
              For academic, professional, or <span className="text-accent">project-related</span> inquiries.
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-12">
              This page serves as a personal and professional reference. For direct contact, please use the information below.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Reveal delay={300}>
              <div className="card text-center h-full">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-display font-bold mb-2">Email</h3>
                <a href="mailto:yo@viniciogarzon.com" className="text-text-muted hover:text-accent transition text-sm break-all">
                  yo@viniciogarzon.com
                </a>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="card text-center h-full">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <h3 className="text-lg font-display font-bold mb-2">Current Studies</h3>
                <p className="text-text-muted text-sm">North Central College</p>
              </div>
            </Reveal>

            <Reveal delay={500}>
              <div className="card text-center h-full">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-display font-bold mb-2">Location</h3>
                <p className="text-text-muted text-sm">Naperville, USA</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* MARQUEE / VALUES */}
      <Marquee items={resume.values} />
      <Marquee items={resume.values} reverse />
    </div>
  );
}
