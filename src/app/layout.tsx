import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vinicio Garzón - Expert in Loyalty, Rewards & E-Learning',
  description: 'Expert in loyalty, rewards, and e-learning, driving growth and connections across Latin America.',
  keywords: 'loyalty programs, rewards, e-learning, growth, Latin America, Vinicio Garzón',
  authors: [{ name: 'Vinicio Garzón' }],
  openGraph: {
    title: "I'm Vini - Vinicio Garzón",
    description: 'Expert in loyalty, rewards, and e-learning, driving growth and connections.',
    url: 'https://www.viniciogarzon.com',
    siteName: 'Vinicio Garzón',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "I'm Vini - Vinicio Garzón",
    description: 'Expert in loyalty, rewards, and e-learning.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-primary text-text overflow-x-hidden">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
