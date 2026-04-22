import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, getPublishedPosts, savePost, generateId, generateSlug, calcReadTime, BlogPost } from '@/lib/blog-store';

const ok = (req: NextRequest) => req.headers.get('x-admin-key') === (process.env.ADMIN_SECRET_KEY || 'vg-admin-2025');

export async function GET(req: NextRequest) {
  const all = new URL(req.url).searchParams.get('all') === 'true';
  try { return NextResponse.json({ posts: all && ok(req) ? await getAllPosts() : await getPublishedPosts() }); }
  catch { return NextResponse.json({ error: 'Error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  if (!ok(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json();
  const now = new Date().toISOString();
  const post: BlogPost = {
    id: b.id || generateId(), title: b.title || 'Untitled',
    slug: b.slug || generateSlug(b.title || 'untitled'),
    author: b.author || 'Vinicio Garzón Castrillón',
    date: b.date || now.split('T')[0], image: b.image || '', fullImage: b.fullImage || b.image || '',
    category: b.category || 'General', tags: Array.isArray(b.tags) ? b.tags : [],
    excerpt: b.excerpt || '', content: b.content || '', status: b.status || 'draft',
    scheduledAt: b.scheduledAt, readTime: calcReadTime(b.content || ''),
    seoTitle: b.seoTitle || '', seoDescription: b.seoDescription || '',
    createdAt: b.createdAt || now, updatedAt: now,
  };
  await savePost(post);
  return NextResponse.json({ post });
}
