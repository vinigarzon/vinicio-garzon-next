export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  date: string;
  image: string;
  fullImage: string;
  category: string;
  tags: string[];
  excerpt: string;
  content: string;
  status: 'published' | 'draft' | 'scheduled';
  scheduledAt?: string;
  readTime?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

async function getStore() {
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('blog-posts');
    await store.list(); // throws outside Netlify
    return store;
  } catch {
    return null;
  }
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const store = await getStore();
  if (store) {
    const { blobs } = await store.list();
    const posts = await Promise.all(blobs.map(b => store.get(b.key, { type: 'json' }) as Promise<BlogPost>));
    return posts.filter(Boolean).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  const { default: d } = await import('@/data/blog.json');
  return (d.posts as any[]).map(p => ({ ...p, tags: p.tags || [], status: 'published' as const, createdAt: p.date, updatedAt: p.date }));
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const all = await getAllPosts();
  const now = new Date();
  return all.filter(p => p.status === 'published' || (p.status === 'scheduled' && p.scheduledAt && new Date(p.scheduledAt) <= now));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return (await getPublishedPosts()).find(p => p.slug === slug) ?? null;
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const store = await getStore();
  if (store) { try { return await store.get(id, { type: 'json' }) as BlogPost; } catch { return null; } }
  return (await getAllPosts()).find(p => p.id === id) ?? null;
}

export async function savePost(post: BlogPost): Promise<void> {
  const store = await getStore();
  if (store) await store.setJSON(post.id, post);
}

export async function deletePost(id: string): Promise<void> {
  const store = await getStore();
  if (store) await store.delete(id);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function generateSlug(title: string): string {
  return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

export function calcReadTime(html: string): string {
  const words = html.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}
