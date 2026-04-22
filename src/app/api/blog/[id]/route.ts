import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getPostById, savePost, deletePost, calcReadTime } from '@/lib/blog-store';
import { sanitizeContent } from '@/lib/sanitize-html';

const ok = (req: NextRequest) => req.headers.get('x-admin-key') === (process.env.ADMIN_SECRET_KEY || 'vg-admin-2025');

const revalidate = (slug?: string) => {
  try {
    revalidatePath('/');
    revalidatePath('/blog');
    if (slug) revalidatePath(`/blog/${slug}`);
  } catch {}
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!ok(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const post = await getPostById(id);
  return post ? NextResponse.json({ post }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!ok(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const existing = await getPostById(id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const b = await req.json();
  const updated = {
    ...existing, ...b, id,
    content: sanitizeContent(b.content || existing.content),
    readTime: calcReadTime(b.content || existing.content),
    updatedAt: new Date().toISOString()
  };
  await savePost(updated);
  revalidate(updated.slug);
  return NextResponse.json({ post: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!ok(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const existing = await getPostById(id);
  await deletePost(id);
  revalidate(existing?.slug);
  return NextResponse.json({ success: true });
}
