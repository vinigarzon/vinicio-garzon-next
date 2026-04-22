import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, savePost } from '@/lib/blog-store';
import { sanitizeContent } from '@/lib/sanitize-html';

const ok = (req: NextRequest) => req.headers.get('x-admin-key') === (process.env.ADMIN_SECRET_KEY || 'vg-admin-2025');

export async function POST(req: NextRequest) {
  if (!ok(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const posts = await getAllPosts();
    const results = [];
    for (const post of posts) {
      const cleanContent = sanitizeContent(post.content || '');
      if (cleanContent !== post.content) {
        await savePost({ ...post, content: cleanContent, updatedAt: new Date().toISOString() });
        results.push({ slug: post.slug, cleaned: true });
      } else {
        results.push({ slug: post.slug, cleaned: false });
      }
    }
    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
