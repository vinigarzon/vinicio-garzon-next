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
      // Presentación de clase (ART 205, NCC) servida como estático desde public/hcb.
      // Se comparte por link directo; fuera de buscadores.
      {
        source: '/hcb/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
      // Página temporal del concurso de calabazas (oct-nov 2026), estática en public/pumpkin.
      // Destino del anuncio de Meta; fuera de buscadores.
      {
        source: '/pumpkin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
    ];
  },

  // /hcb -> public/hcb/index.html (rutas relativas de css/js/img intactas).
  async redirects() {
    return [
      { source: '/hcb', destination: '/hcb/index.html', permanent: false },
      { source: '/pumpkin', destination: '/pumpkin/index.html', permanent: false },
    ];
  },
};

module.exports = nextConfig;
