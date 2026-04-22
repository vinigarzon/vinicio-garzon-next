import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { getPublishedPosts } from '@/lib/blog-store';

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return (
    <div className="w-full">
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-primary overflow-hidden">
        <div className="hero-glow bg-accent w-[500px] h-[500px] -top-20 right-0 opacity-[0.1]" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <Reveal><p className="section-label">Writings</p></Reveal>
          <Reveal delay={100}><h1 className="mb-6">Notes and <span className="text-accent">observations</span></h1></Reveal>
          <Reveal delay={200}><p className="text-xl text-text-muted max-w-3xl leading-relaxed">Personal writings on loyalty, business development, education, and organizational topics in Latin America.</p></Reveal>
        </div>
      </section>
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-7xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-24 text-text-muted"><p>No posts published yet.</p></div>
          ) : <>
            <Reveal>
              <Link href={`/blog/${posts[0].slug}`} className="block group mb-16">
                <article className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-secondary">
                    {posts[0].image ? <img src={posts[0].image} alt={posts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      : <div className="w-full h-full bg-secondary-light flex items-center justify-center text-5xl opacity-20">✍</div>}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium uppercase tracking-wider">{posts[0].category}</span>
                      <span className="text-xs text-text-dim">{new Date(posts[0].date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</span>
                      {posts[0].readTime && <span className="text-xs text-text-dim">· {posts[0].readTime}</span>}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 group-hover:text-accent transition leading-tight">{posts[0].title}</h2>
                    <p className="text-text-muted leading-relaxed mb-6 line-clamp-3">{posts[0].excerpt}</p>
                    <span className="text-accent font-medium flex items-center gap-2">Read More <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></span>
                  </div>
                </article>
              </Link>
            </Reveal>
            {posts.length > 1 && <>
              <div className="border-t border-border mb-16"/>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.slice(1).map((post, idx) => (
                  <Reveal key={post.id} delay={(idx%3)*80}>
                    <Link href={`/blog/${post.slug}`} className="block group">
                      <article className="card h-full overflow-hidden p-0">
                        <div className="aspect-[16/10] overflow-hidden bg-secondary">
                          {post.image ? <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 editorial-filter-group" />
                            : <div className="w-full h-full bg-secondary-light flex items-center justify-center text-4xl opacity-20">✍</div>}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium uppercase tracking-wider">{post.category}</span>
                            <span className="text-xs text-text-dim">{new Date(post.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
                          </div>
                          <h3 className="text-lg font-display font-bold mb-3 group-hover:text-accent transition line-clamp-2">{post.title}</h3>
                          <p className="text-text-muted text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                          <span className="text-accent text-sm font-medium flex items-center gap-1">Read More <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></span>
                        </div>
                      </article>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </>}
          </>}
        </div>
      </section>
    </div>
  );
}
