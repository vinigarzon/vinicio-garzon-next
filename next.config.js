/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.viniciogarzon.com',
      },
      {
        protocol: 'https',
        hostname: 'viniciogarzon.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,

  // Módulo privado de reservas (/book): se comparte por link directo y nunca
  // debe aparecer en buscadores. El metadata robots de /book/layout.tsx cubre el
  // HTML; esto lo refuerza a nivel de cabecera HTTP, también en las APIs.
  async headers() {
    return [
      {
        source: '/book/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
      {
        source: '/book',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
      {
        source: '/api/book/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

module.exports = nextConfig;
