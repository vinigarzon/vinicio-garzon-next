import Link from 'next/link';
import { notFound } from 'next/navigation';
import Reveal from '@/components/Reveal';
import { getPublishedPosts, getPostBySlug } from '@/lib/blog-store';

export const revalidate = 60;

export async function generateStaticParams() {
  try { return (await getPublishedPosts()).map(p => ({ slug: p.slug })); }
  catch { return []; }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const all = await getPublishedPosts();
  const related = all.filter(p => p.slug !== slug).slice(0, 3);

  return (
    <div className="w-full">
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-primary overflow-hidden">
        <div className="hero-glow bg-accent w-[500px] h-[500px] -top-20 right-0 opacity-[0.1]" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <Link href="/blog" className="text-text-muted hover:text-accent text-sm mb-8 inline-flex items-center gap-2 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Back to Writings
          </Link>
          <Reveal>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium uppercase tracking-wider">{post.category}</span>
              <span className="text-xs text-text-dim">{new Date(post.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</span>
              {post.readTime && <span className="text-xs text-text-dim">· {post.readTime}</span>}
            </div>
          </Reveal>
          <Reveal delay={100}><h1 className="mb-6">{post.title}</h1></Reveal>
          <Reveal delay={200}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center font-display font-bold text-primary text-lg">V</div>
              <div><p className="text-text font-medium">{post.author}</p><p className="text-text-muted text-sm">Personal & Professional Profile</p></div>
            </div>
          </Reveal>
        </div>
      </section>

      {post.image && (
        <section className="px-4 sm:px-6 lg:px-8 bg-primary">
          <div className="max-w-5xl mx-auto">
            <Reveal><div className="aspect-[16/9] rounded-2xl overflow-hidden bg-secondary-light"><img src={post.fullImage||post.image} alt={post.title} className="w-full h-full object-cover"/></div></Reveal>
          </div>
        </section>
      )}

      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-3xl mx-auto">
          <Reveal><article className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }}/></Reveal>
          {post.tags && post.tags.length > 0 && (
            <Reveal><div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border">{post.tags.map(t=><span key={t} className="text-xs bg-secondary text-text-muted px-3 py-1 rounded-full border border-border">#{t}</span>)}</div></Reveal>
          )}
          <Reveal>
            <div className="mt-16 pt-12 border-t border-border text-center">
              <h3 className="text-2xl font-display font-bold mb-4">Continue <span className="text-accent">Reading</span></h3>
              <p className="text-text-muted mb-8 max-w-xl mx-auto">Explore additional writings on related topics.</p>
              <Link href="/blog" className="btn-outline inline-block">View All Articles</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-secondary border-t border-border">
          <div className="max-w-7xl mx-auto">
            <Reveal><p className="section-label">Keep Reading</p></Reveal>
            <Reveal delay={100}><h2 className="mb-16">Related <span className="text-accent">Articles</span></h2></Reveal>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i*100}>
                  <Link href={`/blog/${p.slug}`} className="block group">
                    <article className="card h-full overflow-hidden p-0">
                      <div className="aspect-[16/10] overflow-hidden bg-primary">
                        {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 editorial-filter-group"/>
                          : <div className="w-full h-full bg-secondary-light"/>}
                      </div>
                      <div className="p-6">
                        <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium uppercase tracking-wider inline-block mb-3">{p.category}</span>
                        <h3 className="text-lg font-display font-bold mb-3 group-hover:text-accent transition line-clamp-2">{p.title}</h3>
                        <p className="text-text-muted text-sm line-clamp-2">{p.excerpt}</p>
                      </div>
                    </article>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
