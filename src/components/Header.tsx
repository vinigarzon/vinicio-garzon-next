'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { label: 'Home', href: '/#home' },
  { label: 'About', href: '/#about-me' },
  { label: 'Experience', href: '/#what-i-do' },
  { label: 'Projects', href: '/#portfolio' },
  { label: 'Resume', href: '/#my-resume' },
  { label: 'Writings', href: '/#blog' },
  { label: 'Contact', href: '/#contact' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-primary/95 backdrop-blur-md border-b border-border py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-display font-bold text-text group-hover:text-accent transition">
            I'm <span className="text-accent">Vini</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex gap-8 items-center">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-text-muted hover:text-accent transition text-sm font-medium"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <a
            href="mailto:yo@viniciogarzon.com"
            className="px-6 py-2.5 bg-accent text-primary rounded-full font-semibold text-sm hover:bg-accent-dark transition-all hover:scale-105"
          >
            Contact
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-text p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-primary border-t border-border">
          <div className="px-4 py-6 space-y-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block text-text-muted hover:text-accent transition py-2"
              >
                {item.label}
              </Link>
            ))}
            <a
              href="mailto:yo@viniciogarzon.com"
              className="mt-4 block px-6 py-3 bg-accent text-primary rounded-full font-semibold text-center"
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
