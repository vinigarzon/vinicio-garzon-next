'use client';

import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Home', href: '/#home' },
  { label: 'About me', href: '/#about-me' },
  { label: 'What I Do', href: '/#what-i-do' },
  { label: 'Portfolio', href: '/#portfolio' },
  { label: 'My Resume', href: '/#my-resume' },
  { label: 'Blog', href: '/#blog' },
  { label: 'Contact Me', href: '/#contact' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary border-t border-border relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-block mb-5">
              <span className="text-4xl font-display font-bold">
                I'm <span className="text-accent">Vini</span>
              </span>
            </Link>
            <p className="text-text-muted text-base max-w-sm leading-relaxed mb-6">
              Expert in loyalty, rewards, and e-learning driving growth and connections across Latin America.
            </p>
            <a
              href="mailto:yo@viniciogarzon.com"
              className="inline-flex items-center gap-2 text-text hover:text-accent transition font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              yo@viniciogarzon.com
            </a>
          </div>

          {/* Navigation */}
          <div className="md:col-span-4">
            <h4 className="text-text font-display font-semibold text-sm uppercase tracking-widest mb-5">
              Navigation
            </h4>
            <ul className="grid grid-cols-2 gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-muted hover:text-accent transition text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="md:col-span-3">
            <h4 className="text-text font-display font-semibold text-sm uppercase tracking-widest mb-5">
              Let's Connect
            </h4>
            <p className="text-text-muted text-sm mb-5 leading-relaxed">
              Serving all of Latin America
            </p>
            <a
              href="mailto:yo@viniciogarzon.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-primary rounded-full font-semibold text-sm hover:bg-accent-dark transition-all hover:scale-105"
            >
              Get in Touch
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-sm">
            © {currentYear} Vinicio Garzón. All rights reserved.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-text-muted hover:text-accent text-sm flex items-center gap-2 transition"
          >
            Scroll to top
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Big text accent */}
      <div className="opacity-[0.03] text-center overflow-hidden">
        <p className="text-[20vw] md:text-[15vw] font-display font-bold leading-none text-accent select-none whitespace-nowrap">
          VINICIO
        </p>
      </div>
    </footer>
  );
}
