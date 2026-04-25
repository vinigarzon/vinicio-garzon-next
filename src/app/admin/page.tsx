'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const KEY = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'vg-admin-2025';
const ST: Record<string, string> = {
  published: 'bg-green-900/40 text-green-400 border-green-800',
  draft: 'bg-gray-800 text-gray-400 border-gray-700',
  scheduled: 'bg-blue-900/40 text-blue-400 border-blue-800',
};

export default function AdminDashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [del, setDel] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/blog?all=true', { headers: { 'x-admin-key': KEY } });
    const d = await r.json();
    setPosts(d.posts || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    setDel(id);
    await fetch(`/api/blog/${id}`, { method: 'DELETE', headers: { 'x-admin-key': KEY } });
    await load();
    setDel(null);
  };

  const toggle = async (p: any) => {
    const status = p.status === 'published' ? 'draft' : 'published';
    await fetch(`/api/blog/${p.id}`, { method: 'PUT', headers: { 'x-admin-key': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    load();
  };

  const seed = async () => {
    const r = await fetch('/api/blog/seed', { method: 'POST', headers: { 'x-admin-key': KEY } });
    const d = await r.json();
    if (d.seeded) { alert(`Migrated: ${d.seeded.length} posts`); load(); }
    else alert('Error: ' + d.error);
  };

  const sanitize = async () => {
    const r = await fetch('/api/blog/sanitize', { method: 'POST', headers: { 'x-admin-key': KEY } });
    const d = await r.json();
    if (d.results) {
      const cleaned = d.results.filter((x: any) => x.cleaned).map((x: any) => x.slug);
      alert(cleaned.length > 0 ? `Fixed styling in: ${cleaned.join(', ')}` : 'All posts already clean!');
      load();
    } else alert('Error: ' + d.error);
  };

  const fixImages = async () => {
    if (!confirm('This will rewrite all old WordPress image URLs in posts to local paths. Continue?')) return;
    const r = await fetch('/api/blog/fix-images', { method: 'POST', headers: { 'x-admin-key': KEY } });
    const d = await r.json();
    if (d.success) {
      const fixed = d.results.filter((x: any) => !x.skipped).map((x: any) => x.slug);
      alert(d.totalFixed > 0
        ? `✓ Fixed ${d.totalFixed} posts:\n${fixed.join('\n')}\n\nRefresh the blog pages to see changes.`
        : 'All posts already have correct image URLs!');
      load();
    } else alert('Error: ' + d.error);
  };

  const diagnoseImages = async () => {
    const r = await fetch('/api/blog/fix-images', { method: 'GET', headers: { 'x-admin-key': KEY } });
    const d = await r.json();
    if (d.diagnosis) {
      let report = `📊 Diagnosis (${d.totalPosts} posts):\n\n`;
      d.diagnosis.forEach((p: any) => {
        report += `━━━━━━━━━━━━━━━━━━━━\n`;
        report += `📄 ${p.slug}\n`;
        report += `image: ${p.imageIsBroken ? '❌ BROKEN' : '✅ OK'}\n`;
        report += `  → ${p.image || '(empty)'}\n`;
        if (p.externalUrlsInContent.length > 0) {
          report += `Content has ${p.externalUrlsInContent.length} external URLs:\n`;
          p.externalUrlsInContent.forEach((u: string) => {
            report += `  • ${u.substring(0, 80)}${u.length > 80 ? '...' : ''}\n`;
          });
        }
        report += `\n`;
      });
      // Show in a new window since alert truncates
      const w = window.open('', '_blank', 'width=900,height=700');
      if (w) {
        w.document.write(`<pre style="font-family: monospace; font-size: 12px; background: #111; color: #c9f31d; padding: 20px; white-space: pre-wrap;">${report}</pre>`);
      } else {
        console.log(report);
        alert('Check console for full diagnosis (popup was blocked)');
      }
    } else alert('Error: ' + d.error);
  };

  const cnt = { all: posts.length, published: posts.filter(p => p.status === 'published').length, draft: posts.filter(p => p.status === 'draft').length, scheduled: posts.filter(p => p.status === 'scheduled').length };
  const vis = posts.filter(p => (filter === 'all' || p.status === filter) && (!q || p.title.toLowerCase().includes(q.toLowerCase())));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-gray-400 text-sm mt-1">{posts.length} total</p>
        </div>
        <Link href="/admin/blog/new" className="px-5 py-2.5 bg-[#c9f31d] text-black font-bold rounded-xl hover:bg-[#b8e019] transition">+ New Post</Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'published', 'draft', 'scheduled'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition ${filter === f ? 'bg-[#c9f31d] text-black font-bold' : 'bg-[#1a1a1a] text-gray-400 border border-[#333] hover:text-white'}`}>
              {f} <span className="opacity-60">({cnt[f]})</span>
            </button>
          ))}
        </div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
          className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-[#333] text-white rounded-xl focus:outline-none focus:border-[#c9f31d] text-sm" />
      </div>

      {loading
        ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-[#111] rounded-xl animate-pulse"/>)}</div>
        : vis.length === 0
          ? <div className="text-center py-20 border border-dashed border-[#333] rounded-2xl">
              <p className="text-gray-400 mb-4">No posts found.</p>
              <Link href="/admin/blog/new" className="text-[#c9f31d] hover:underline">Create first post →</Link>
            </div>
          : <div className="space-y-3">
              {vis.map(p => (
                <div key={p.id} className="bg-[#111] border border-[#222] rounded-xl p-4 flex items-center gap-4 hover:border-[#333] transition">
                  <span className={`text-xs px-2 py-1 rounded border capitalize shrink-0 ${ST[p.status] || ST.draft}`}>{p.status}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{p.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.category} · {p.date} · /blog/{p.slug}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <button onClick={() => toggle(p)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition ${p.status === 'published' ? 'border-gray-700 text-gray-400 hover:text-orange-400 hover:border-orange-700' : 'border-green-800 text-green-400 hover:bg-green-900/30'}`}>
                      {p.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <Link href={`/admin/blog/edit/${p.id}`} className="text-xs px-3 py-1.5 rounded-lg border border-[#333] text-gray-300 hover:border-[#c9f31d] hover:text-[#c9f31d] transition">Edit</Link>
                    {p.status === 'published' && <Link href={`/blog/${p.slug}`} target="_blank" className="text-xs px-3 py-1.5 rounded-lg border border-[#333] text-gray-400 hover:text-white transition">View ↗</Link>}
                    <button onClick={() => remove(p.id, p.title)} disabled={del === p.id}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[#333] text-gray-500 hover:text-red-400 hover:border-red-800 transition disabled:opacity-40">
                      {del === p.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
      }

      {posts.length === 0 && !loading && (
        <div className="mt-8 p-5 bg-yellow-900/20 border border-yellow-800/50 rounded-xl text-center">
          <p className="text-yellow-300 text-sm mb-3">Migrate your existing 5 posts from static JSON to the database?</p>
          <button onClick={seed} className="px-5 py-2 bg-yellow-500 text-black font-bold rounded-lg text-sm hover:bg-yellow-400 transition">
            Migrate Static Posts
          </button>
        </div>
      )}

      {/* Fix pasted content styling — always visible */}
      {posts.length > 0 && (
        <div className="mt-8 p-4 bg-[#111] border border-[#222] rounded-xl flex items-center justify-between">
          <div>
            <p className="text-gray-300 text-sm font-medium">Fix black text from pasted content</p>
            <p className="text-gray-500 text-xs mt-0.5">Run this after pasting text from ChatGPT, Google Docs, or Word</p>
          </div>
          <button onClick={sanitize}
            className="px-4 py-2 bg-[#1a1a1a] border border-[#444] text-gray-300 rounded-lg text-sm hover:border-[#c9f31d] hover:text-[#c9f31d] transition shrink-0">
            🧹 Fix Styling
          </button>
        </div>
      )}

      {/* Fix broken image URLs from old WordPress site */}
      {posts.length > 0 && (
        <div className="mt-4 p-4 bg-[#111] border border-[#222] rounded-xl flex items-center justify-between">
          <div>
            <p className="text-gray-300 text-sm font-medium">Fix broken image URLs</p>
            <p className="text-gray-500 text-xs mt-0.5">Rewrites old viniciogarzon.com/wp-content URLs in posts to local paths</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={diagnoseImages}
              className="px-4 py-2 bg-[#1a1a1a] border border-[#444] text-gray-300 rounded-lg text-sm hover:border-[#c9f31d] hover:text-[#c9f31d] transition">
              🔍 Diagnose
            </button>
            <button onClick={fixImages}
              className="px-4 py-2 bg-[#1a1a1a] border border-[#444] text-gray-300 rounded-lg text-sm hover:border-[#c9f31d] hover:text-[#c9f31d] transition">
              🖼 Fix Images
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
