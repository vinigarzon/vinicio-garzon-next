import { NextRequest, NextResponse } from 'next/server';
import { savePost, generateId, calcReadTime, BlogPost } from '@/lib/blog-store';
import staticData from '@/data/blog.json';

const ok = (req: NextRequest) => req.headers.get('x-admin-key') === (process.env.ADMIN_SECRET_KEY || 'vg-admin-2025');

export async function POST(req: NextRequest) {
  if (!ok(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const seeded: string[] = [];
  for (const p of staticData.posts as any[]) {
    const post: BlogPost = {
      id: p.id || generateId(), title: p.title, slug: p.slug,
      author: p.author || 'Vinicio Garzón Castrillón', date: p.date,
      image: p.image || '', fullImage: p.fullImage || p.image || '',
      category: p.category || 'General', tags: p.tags || [],
      excerpt: p.excerpt || '', content: p.content || '',
      status: 'published', readTime: p.readTime || calcReadTime(p.content || ''),
      seoTitle: '', seoDescription: '', createdAt: p.date, updatedAt: p.date,
    };
    await savePost(post);
    seeded.push(p.slug);
  }
  return NextResponse.json({ seeded });
}
