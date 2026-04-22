import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    const decodedKey = decodeURIComponent(key);
    const store = getStore('blog-images');

    const blob = await store.get(decodedKey, { type: 'arrayBuffer' });
    if (!blob) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const metadata = await store.getMetadata(decodedKey);
    const contentType = (metadata?.metadata?.contentType as string) || 'image/jpeg';

    return new NextResponse(blob as ArrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
