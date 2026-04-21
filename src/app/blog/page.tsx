'use client';

import Link from 'next/link';
import { useState } from 'react';
import blog from '@/data/blog.json';
import Reveal from '@/components/Reveal';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = Array.from(new Set(blog.posts.map(post => post.category)));
  const filteredPosts = selectedCategory
    ? blog.posts.filter(post => post.category === selectedCategory)
    : blog.posts;

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-primary overflow-hidden">
        <div className="hero-glow bg-accent w-[500px] h-[500px] -top-20 -right-20 opacity-[0.15]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <Reveal>
            <p className="section-label">Writings</p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mb-6">
              Notes and <span className="text-accent">observations</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-xl text-text-muted max-w-3xl leading-relaxed">
              Personal writings on loyalty, business development, education, and organizational topics in Latin America.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Filters + Posts */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex flex-wrap gap-3 mb-12">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-5 py-2 rounded-full transition text-sm font-medium ${
                  selectedCategory === null
                    ? 'bg-accent text-primary'
                    : 'bg-secondary border border-border text-text-muted hover:border-accent hover:text-accent'
                }`}
              >
                All Articles
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2 rounded-full transition text-sm font-medium ${
                    selectedCategory === category
                      ? 'bg-accent text-primary'
                      : 'bg-secondary border border-border text-text-muted hover:border-accent hover:text-accent'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, idx) => (
              <Reveal key={post.id} delay={(idx % 3) * 80}>
                <Link href={`/blog/${post.slug}`} className="block group">
                  <article className="card h-full overflow-hidden p-0">
                    <div className="aspect-[16/10] overflow-hidden bg-primary">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 editorial-filter"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium uppercase tracking-wider">
                          {post.category}
                        </span>
                        <span className="text-xs text-text-dim">
                          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-lg font-display font-bold mb-3 group-hover:text-accent transition line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-text-muted text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                      <span className="text-accent text-sm font-medium flex items-center gap-1">
                        Read More
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </article>
                </Link>
              </Reveal>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-text-muted text-lg">No posts found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
