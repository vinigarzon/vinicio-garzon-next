import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

const ok = (req: NextRequest) =>
  req.headers.get('x-admin-key') === (process.env.ADMIN_SECRET_KEY || 'vg-admin-2025');

export async function POST(req: NextRequest) {
  if (!ok(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { slug } = await req.json().catch(() => ({}));

    // Revalidate blog index + home (where blog cards show)
    revalidatePath('/blog');
    revalidatePath('/');

    // Revalidate specific post page if slug provided
    if (slug) {
      revalidatePath(`/blog/${slug}`);
    }

    return NextResponse.json({ revalidated: true, paths: ['/blog', '/', slug ? `/blog/${slug}` : null].filter(Boolean) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
