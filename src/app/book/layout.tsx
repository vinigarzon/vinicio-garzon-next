import type { Metadata } from 'next';

// Módulo privado: se comparte por link directo y no debe indexarse nunca.
// El header X-Robots-Tag en next.config.js refuerza esto a nivel de respuesta.
export const metadata: Metadata = {
  title: 'Book a meeting — Vinicio Garzón',
  description: 'Private scheduling page.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
