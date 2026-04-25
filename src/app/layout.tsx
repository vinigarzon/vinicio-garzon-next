import type { Metadata } from 'next';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

const GA_MEASUREMENT_ID = 'G-TDCBQXN246';

export const metadata: Metadata = {
  title: 'Vinicio Garzón Castrillón — Personal & Professional Profile',
  description: 'Personal and professional profile. Professional background in loyalty, rewards, and e-learning across Latin America. Currently pursuing academic studies in Sport Management at North Central College.',
  keywords: 'Vinicio Garzón Castrillón, Sport Management, North Central College, loyalty programs, e-learning, Latin America, Gurumba, Zegendia, Lincoln BizLab',
  authors: [{ name: 'Vinicio Garzón Castrillón' }],
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
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
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
