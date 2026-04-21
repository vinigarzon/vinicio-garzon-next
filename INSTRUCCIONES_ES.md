# 📚 Instrucciones en Español - Vinicio Garzón Portfolio

Bienvenido. Esta es tu guía completa en español para configurar y desplegar tu nuevo sitio.

## 🎯 ¿Qué acabo de crear?

Un sitio web moderno, rápido y profesional construido con:
- **Next.js 14** - Framework React moderno
- **Tailwind CSS** - Diseño responsive
- **TypeScript** - Código seguro
- **Vercel** - Hosting gratis y ultra rápido

**Características principales:**
✅ Home con hero section atractivo
✅ Sección "Acerca de mí"
✅ 5 servicios con descripciones
✅ Galería de 6 proyectos de portfolio
✅ Blog con 5 artículos
✅ Testimoniales
✅ Estadísticas
✅ Formulario de contacto
✅ 100% responsive (móvil, tablet, desktop)
✅ SEO optimizado

## 🚀 Paso 1: Instalar Node.js

Node.js es un programa que necesitas para correr proyectos de código.

1. Ve a **https://nodejs.org/**
2. Descarga la versión **LTS** (la recomendada)
3. Instálalo (siguiente, siguiente, siguiente... ✓)
4. Abre terminal/cmd y verifica:

```bash
node --version
npm --version
```

Deberías ver números de versión. Si ves error, reinicia tu PC.

## 💾 Paso 2: Descargar el Proyecto

### Opción A: Si tienes Git instalado

```bash
git clone <URL-DEL-PROYECTO>
cd vinicio-garzon-next
```

### Opción B: Descargar ZIP manualmente

1. Descarga el archivo ZIP del proyecto
2. Descomprimelo en la carpeta que quieras
3. Abre terminal/cmd en esa carpeta

## 📦 Paso 3: Instalar Dependencias

Abre terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

Esto descargará todos los paquetes necesarios. Toma 2-3 minutos.

## ▶️ Paso 4: Correr Localmente

```bash
npm run dev
```

Verás algo como:
```
- Local: http://localhost:3000
```

**Abre tu navegador en http://localhost:3000**

¡Ves tu sitio funcionando! 🎉

Para detener el servidor: presiona **Ctrl + C** en la terminal.

## ✏️ Paso 5: Personalizar Contenido

### Cambiar Blog

Edita: `src/data/blog.json`

Cada post tiene:
```json
{
  "id": "slug-unico",
  "title": "Título del artículo",
  "date": "2025-01-20",
  "category": "Nombre de categoría",
  "excerpt": "Resumen corto",
  "content": "Contenido completo del artículo"
}
```

### Cambiar Portfolio

Edita: `src/data/portfolio.json`

Cada proyecto tiene:
```json
{
  "id": "id-unico",
  "title": "Nombre del proyecto",
  "category": "Tipo de proyecto",
  "description": "Descripción breve",
  "client": "Nombre del cliente",
  "year": 2024,
  "tags": ["tag1", "tag2"],
  "achievements": ["logro1", "logro2"]
}
```

### Cambiar Textos Principales

Edita: `src/app/page.tsx`

Busca los textos que quieras cambiar y edítalos directamente.

### Cambiar Colores

Edita: `tailwind.config.js`

```javascript
colors: {
  primary: '#1a1a1a',      // Negro (fondo)
  secondary: '#2d2d2d',    // Gris oscuro
  accent: '#00d4ff',       // Cian (resaltes)
  text: '#ffffff',         // Blanco (texto)
  'text-muted': '#a0a0a0', // Gris (texto apagado)
}
```

### Cambiar Email/Teléfono

Busca `yo@viniciogarzon.com` en el código y reemplázalo con tu email.

## 🌍 Paso 6: Desplegar en Vercel (Hosting Gratis)

### A. Crear Cuenta en GitHub

1. Ve a **https://github.com/signup**
2. Completa el registro
3. Verifica tu email

### B. Crear Repositorio

1. Ve a **https://github.com/new**
2. Nombre: `vinicio-garzon-next`
3. Visibilidad: **Public**
4. Click "Create repository"

### C. Subir Tu Código a GitHub

En tu terminal, en la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Primer commit: Portfolio de Vinicio Garzón"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/vinicio-garzon-next.git
git push -u origin main
```

Reemplaza `TU-USUARIO` con tu usuario real de GitHub.

### D. Conectar con Vercel

1. Ve a **https://vercel.com/signup**
2. Click "Continue with GitHub"
3. Autoriza Vercel
4. Click "Add New → Project"
5. Selecciona `vinicio-garzon-next`
6. Click "Import"
7. Click "Deploy"

¡Espera 1-2 minutos!

Tu sitio estará en vivo en:
```
https://vinicio-garzon-next.vercel.app
```

### E. Conectar Tu Dominio (viniciogarzon.com)

1. En Vercel, ve a Settings → Domains
2. Ingresa: `viniciogarzon.com`
3. Vercel te dará 4 nameservers
4. Ve a tu proveedor de dominio (donde compraste el dominio)
5. Busca "Nameservers" en los settings
6. Reemplaza con los de Vercel
7. Guarda

**Espera 24-48 horas** a que se propague.

## 🔄 Actualizar el Sitio

Cada vez que quieras hacer cambios:

```bash
# Edita los archivos
# Por ejemplo: src/data/blog.json

# Luego simplemente haz:
git add .
git commit -m "Descripción del cambio"
git push
```

¡Vercel se redesplegará automáticamente en segundos! No haces nada más.

## 🛠️ Comandos Útiles

```bash
# Correr localmente
npm run dev

# Build para producción
npm run build

# Correr versión de producción
npm start

# Revisar código
npm run lint
```

## 📱 Estructura del Proyecto

```
vinicio-garzon-next/
├── src/
│   ├── app/              # Páginas principales
│   ├── components/       # Componentes reutilizables
│   ├── data/            # Datos (blog.json, portfolio.json)
│   └── app/globals.css  # Estilos globales
├── public/              # Imágenes
├── package.json         # Dependencias
└── README.md            # Este archivo
```

## ❓ Preguntas Frecuentes

**P: ¿Necesito pagar por algo?**
R: No. Next.js es gratis, Vercel es gratis (plan básico), GitHub es gratis.

**P: ¿Qué pasa si cambio algo y se rompe?**
R: Puedes volver a una versión anterior en Vercel en un click.

**P: ¿Puedo cambiar los colores?**
R: Sí, edita `tailwind.config.js` y ¡listo!

**P: ¿Cuánto tarda el deploy?**
R: 1-2 minutos. Vercel es muy rápido.

**P: ¿Puedo usar mi propio dominio?**
R: Sí, conecta tu dominio en Vercel Settings → Domains.

**P: ¿Qué pasa si Vercel cierra?**
R: Puedes mover tu código a cualquier otro hosting en 5 minutos.

## 🆘 Solución de Problemas

### "npm: command not found"
→ Node.js no está instalado. Descárgalo en https://nodejs.org/

### "Port 3000 already in use"
→ Otro programa usa el puerto 3000. Usa: `npm run dev -- -p 3001`

### "Module not found"
→ Ejecuta: `npm install`

### La imagen no carga
→ Las imágenes usan placeholders. Para imágenes reales, guárdalas en `public/` y usa rutas relativas.

### Git no funciona
→ Instala Git en https://git-scm.com/

## 📞 Próximos Pasos

1. ✅ Instala Node.js
2. ✅ Descarga el proyecto
3. ✅ Ejecuta `npm install`
4. ✅ Ejecuta `npm run dev`
5. ✅ Personaliza blog y portfolio
6. ✅ Crea GitHub
7. ✅ Sube código a GitHub
8. ✅ Conecta con Vercel
9. ✅ Conecta tu dominio

## 📚 Recursos

- **Next.js**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **GitHub**: https://docs.github.com
- **Vercel**: https://vercel.com/docs

## ✨ ¿Necesitas Más Ayuda?

Si tienes preguntas específicas:
1. Revisa el README.md
2. Revisa DEPLOYMENT.md
3. Busca en Google (la mayoría de problemas ya están resueltos)

**¡Tu nuevo sitio está listo! 🚀**

Cualquier duda, pregunta sin problemas. ¡Mucho éxito!
