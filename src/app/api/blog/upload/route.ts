import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

const ok = (req: NextRequest) =>
  req.headers.get('x-admin-key') === (process.env.ADMIN_SECRET_KEY || 'vg-admin-2025');

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  if (!ok(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Validate file type
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Only images allowed (jpg, png, webp, gif, svg)' }, { status: 400 });
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
    const key = `${Date.now()}-${safeName}`;

    // Read file as buffer and upload to Netlify Blobs
    const buffer = await file.arrayBuffer();
    const store = getStore('blog-images');
    await store.set(key, buffer, {
      metadata: { contentType: file.type, originalName: file.name },
    });

    // Return the URL that will serve this image via our /api/image endpoint
    const url = `/api/image/${encodeURIComponent(key)}`;
    return NextResponse.json({ url, key, size: file.size, type: file.type });
  } catch (e: any) {
    console.error('Upload error:', e);
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 });
  }
}
