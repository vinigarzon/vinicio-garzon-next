'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Reveal from '@/components/Reveal';

const LIMIT = 3;

export default function HomeBlogSection() {
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch('/api/blog').then(r => r.json()).then(d => {
      const all = d.posts || [];
      setTotal(all.length);
      setPosts(all.slice(0, LIMIT));
    }).catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  return (
    <section id="blog" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <Reveal><p className="section-label">Writings</p></Reveal>
            <Reveal delay={100}><h2 className="max-w-2xl">Notes and <span className="text-accent">observations</span>.</h2></Reveal>
          </div>
          <Reveal delay={200}><Link href="/blog" className="btn-outline shrink-0">View All Articles</Link></Reveal>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <Reveal key={post.id} delay={idx * 100}>
              <Link href={`/blog/${post.slug}`} className="block group">
                <article className="card h-full overflow-hidden p-0">
                  <div className="aspect-[16/10] overflow-hidden bg-primary">
                    {post.image
                      ? <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 editorial-filter-group"/>
                      : <div className="w-full h-full bg-secondary-light flex items-center justify-center text-4xl opacity-20">✍</div>}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium uppercase tracking-wider">{post.category}</span>
                      {post.date && <span className="text-xs text-text-dim">{new Date(post.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>}
                    </div>
                    <h3 className="text-lg font-display font-bold mb-3 group-hover:text-accent transition line-clamp-2">{post.title}</h3>
                    <p className="text-text-muted text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                    <span className="text-accent text-sm font-medium flex items-center gap-1">
                      Read More <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </span>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>

        {total > LIMIT && (
          <div className="text-center mt-10">
            <Link href="/blog" className="btn-outline inline-flex items-center gap-2">View all {total} articles →</Link>
          </div>
        )}
      </div>
    </section>
  );
}
