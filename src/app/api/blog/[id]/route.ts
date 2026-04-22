import { NextRequest, NextResponse } from 'next/server';
import { getPostById, savePost, deletePost, calcReadTime } from '@/lib/blog-store';

const ok = (req: NextRequest) => req.headers.get('x-admin-key') === (process.env.ADMIN_SECRET_KEY || 'vg-admin-2025');

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
  const updated = { ...existing, ...b, id, readTime: calcReadTime(b.content || existing.content), updatedAt: new Date().toISOString() };
  await savePost(updated);
  return NextResponse.json({ post: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!ok(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await deletePost(id);
  return NextResponse.json({ success: true });
}
