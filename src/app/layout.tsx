import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vinicio Garzón Castrillón — Personal & Professional Profile',
  description: 'Personal and professional profile. Professional background in loyalty, rewards, and e-learning across Latin America. Currently pursuing academic studies in Sport Management at North Central College.',
  keywords: 'Vinicio Garzón Castrillón, Sport Management, North Central College, loyalty programs, e-learning, Latin America, Gurumba, Zegendia, Lincoln BizLab',
  authors: [{ name: 'Vinicio Garzón Castrillón' }],
  openGraph: {
    title: 'Vinicio Garzón Castrillón — Personal & Professional Profile',
    description: 'Personal and professional profile. Background in loyalty, rewards, and e-learning. Current academic studies in Sport Management.',
    url: 'https://www.viniciogarzon.com',
    siteName: 'Vinicio Garzón Castrillón',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vinicio Garzón Castrillón — Personal & Professional Profile',
    description: 'Professional background in loyalty, rewards, and e-learning. Current academic studies in Sport Management.',
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
