# Vinicio Garzón — Next.js

Réplica moderna del sitio viniciogarzon.com construida con Next.js 14, TypeScript y Tailwind CSS.

## Secciones incluidas (fieles al sitio live)

- Hero con "I'm Vini" + bloque "Let's Work Together"
- About Me con imagen de Naperville
- What I Do — 5 servicios con iconos reales
- Stats con counters animados al scroll
- Testimonials carousel automático
- Portfolio con 6 proyectos (imágenes reales)
- My Resume — experiencia + educación en timeline
- Technical Skills — 16 herramientas con barras animadas
- Recent Blog — 5 posts con imágenes reales
- Contact con 3 tarjetas
- Marquees de valores (texto desplazante)
- Páginas detalle de Portfolio (deliverables, gallery, testimonios, next project)
- Páginas detalle de Blog con posts relacionados

## Correr localmente

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Build para producción

```bash
npm run build
npm start
```

## Estructura

```
src/
├── app/              # Páginas (Home, Blog, Portfolio)
├── components/       # Header, Footer, Reveal, AnimatedCounter, SkillBar, Marquee, TestimonialsCarousel
├── data/             # blog.json, portfolio.json, resume.json
└── hooks/            # useScrollReveal
```

## Editar contenido

- **Blog:** `src/data/blog.json`
- **Portfolio:** `src/data/portfolio.json`
- **Experiencia/educación/skills:** `src/data/resume.json`
- **Colores:** `tailwind.config.js`

## Deploy en Vercel

1. Sube el código a GitHub
2. Importa el repo en vercel.com
3. Deploy automático

El color de acento (`#c9f31d` verde neón) y la paleta oscura están en `tailwind.config.js`.
