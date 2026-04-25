import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

// Map de imágenes viejas a nuevas (URLs locales)
const URL_MAP: Record<string, string> = {
  // Blog post featured images
  'gamification-latinoamerica2025.png': '/images/blog/gamification-latinoamerica2025.png',
  'evolution-loyalty-latinoamerica.png': '/images/blog/evolution-loyalty-latinoamerica.png',
  'never-stop.png': '/images/blog/never-stop.png',
  'DANIEL_NOBOA_AZIN_SE_CONVIERTE_EN_EL_PRESIDENTE_MAS_JOVEN_DE_LA_HISTORIA_REPUBLICANA_DEL_PAIS23_DE_NOVIEMBRE_DE_2023._53351317681-1024x562-1.jpg': '/images/blog/daniel-noboa-ecuador.jpg',
  // Naperville (home page)
  'naperville.jpg': '/images/naperville.jpg',
  'naperville.png': '/images/naperville.jpg',
  // Portfolio
  '2x1fans.png': '/images/portfolio/2x1fans.png',
  'directv.png': '/images/portfolio/directv.png',
  'laptop.png': '/images/portfolio/laptop.png',
  'tv-control.png': '/images/portfolio/tv-control.png',
};

function fixImageUrl(url: string): string {
  if (!url) return url;
  // Si la URL apunta a viniciogarzon.com/wp-content, reemplazar
  if (url.includes('viniciogarzon.com/wp-content') || url.includes('wp-content/uploads')) {
    // Extraer el filename del final de la URL
    const filename = url.split('/').pop()?.split('?')[0] || '';
    if (filename && URL_MAP[filename]) {
      return URL_MAP[filename];
    }
    // Si no está en el map exacto, buscar coincidencia parcial
    for (const [key, value] of Object.entries(URL_MAP)) {
      if (url.includes(key) || filename.includes(key.replace('.png', '').replace('.jpg', ''))) {
        return value;
      }
    }
  }
  return url;
}

function fixContentHtml(html: string): string {
  if (!html) return html;
  // Reemplazar todas las URLs de viniciogarzon.com/wp-content en el HTML
  return html.replace(
    /https?:\/\/(?:www\.)?viniciogarzon\.com\/wp-content\/uploads\/[^\s"'<>]+/g,
    (match) => fixImageUrl(match)
  );
}

export async function GET(req: NextRequest) {
  // Verify admin key
  const adminKey = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key');
  if (adminKey !== process.env.ADMIN_SECRET_KEY && adminKey !== 'vg-admin-2025') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('blog-posts');
    const { blobs } = await store.list();

    const diagnosis: any[] = [];
    for (const b of blobs) {
      const post = await store.get(b.key, { type: 'json' }) as any;
      if (!post) continue;

      // Encontrar todas las URLs externas en el contenido
      const externalUrls = (post.content || '').match(
        /https?:\/\/(?:www\.)?viniciogarzon\.com\/wp-content\/uploads\/[^\s"'<>]+/g
      ) || [];

      diagnosis.push({
        id: post.id,
        slug: post.slug,
        title: post.title,
        image: post.image,
        fullImage: post.fullImage,
        imageIsBroken: (post.image || '').includes('viniciogarzon.com/wp-content'),
        fullImageIsBroken: (post.fullImage || '').includes('viniciogarzon.com/wp-content'),
        externalUrlsInContent: externalUrls,
      });
    }

    return NextResponse.json({
      totalPosts: blobs.length,
      diagnosis,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to diagnose' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Verify admin key
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_SECRET_KEY && adminKey !== 'vg-admin-2025') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('blog-posts');
    const { blobs } = await store.list();

    const results: any[] = [];
    let totalFixed = 0;

    for (const b of blobs) {
      const post = await store.get(b.key, { type: 'json' }) as any;
      if (!post) continue;

      const oldImage = post.image;
      const oldFullImage = post.fullImage;
      const oldContent = post.content;

      const newImage = fixImageUrl(post.image);
      const newFullImage = fixImageUrl(post.fullImage);
      const newContent = fixContentHtml(post.content);

      const changed =
        oldImage !== newImage ||
        oldFullImage !== newFullImage ||
        oldContent !== newContent;

      if (changed) {
        post.image = newImage;
        post.fullImage = newFullImage;
        post.content = newContent;
        post.updatedAt = new Date().toISOString();
        await store.setJSON(post.id, post);
        totalFixed++;
        results.push({
          id: post.id,
          slug: post.slug,
          imageChanged: oldImage !== newImage,
          contentChanged: oldContent !== newContent,
          oldImage,
          newImage,
        });
      } else {
        results.push({ id: post.id, slug: post.slug, skipped: true });
      }
    }

    // Forzar revalidación de todas las páginas
    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath('/blog/[slug]', 'page');

    return NextResponse.json({
      success: true,
      totalPosts: blobs.length,
      totalFixed,
      results,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to fix images' },
      { status: 500 }
    );
  }
}
