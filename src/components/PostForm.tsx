'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false, loading: () => <div className="h-96 bg-[#111] border border-[#333] rounded-xl animate-pulse"/> });

const KEY = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'vg-admin-2025';
const CATS = ['Loyalty Programs','Gamification','Data Analytics','Leadership','Analysis','E-Learning','Digital Transformation','Sport Management','Business Development','General'];

function makeSlug(t: string) { return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-'); }

const INP = "w-full px-4 py-2.5 bg-[#111] border border-[#333] text-white rounded-xl focus:outline-none focus:border-[#c9f31d] transition text-sm placeholder:text-gray-600";
const LBL = "block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider";

export default function PostForm({ init, editing }: { init?: any; editing?: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState<'content'|'meta'|'seo'>('content');
  const [autoSlug, setAutoSlug] = useState(!editing);
  const [f, setF] = useState({
    title: init?.title || '', slug: init?.slug || '',
    author: init?.author || 'Vinicio Garzón Castrillón',
    date: init?.date || new Date().toISOString().split('T')[0],
    image: init?.image || '', category: init?.category || 'General',
    tags: (init?.tags || []).join(', '), excerpt: init?.excerpt || '',
    content: init?.content || '', status: init?.status || 'draft',
    scheduledAt: init?.scheduledAt || '', seoTitle: init?.seoTitle || '', seoDesc: init?.seoDescription || '',
  });

  useEffect(() => { if (autoSlug && f.title) setF(p => ({ ...p, slug: makeSlug(p.title) })); }, [f.title, autoSlug]);

  const set = (k: string) => (e: React.ChangeEvent<any>) => setF(p => ({ ...p, [k]: e.target.value }));
  const setContent = useCallback((html: string) => setF(p => ({ ...p, content: html })), []);

  const save = async (statusOverride?: string) => {
    if (!f.title.trim()) { setMsg('Title required'); return; }
    setSaving(true); setMsg('');
    try {
      const body = { ...f, tags: f.tags.split(',').map((t:string)=>t.trim()).filter(Boolean), status: statusOverride||f.status, seoDescription: f.seoDesc, ...(init?.id && { id: init.id }), ...(init?.createdAt && { createdAt: init.createdAt }) };
      const url = editing && init?.id ? `/api/blog/${init.id}` : '/api/blog';
      const res = await fetch(url, { method: editing?'PUT':'POST', headers: { 'Content-Type':'application/json','x-admin-key':KEY }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      setMsg('✓ Saved!');
      setTimeout(() => router.push('/admin'), 700);
    } catch { setMsg('Error saving'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{editing ? 'Edit Post' : 'New Post'}</h1>
          {f.slug && <p className="text-gray-500 text-xs mt-1">/blog/{f.slug}</p>}
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className={`text-sm ${msg.startsWith('✓')?'text-[#c9f31d]':'text-red-400'}`}>{msg}</span>}
          <button onClick={() => save('draft')} disabled={saving} className="px-4 py-2 border border-[#333] text-gray-300 rounded-xl text-sm hover:border-gray-500 transition disabled:opacity-40">Save Draft</button>
          <button onClick={() => save('published')} disabled={saving||!f.title||!f.content} className="px-5 py-2.5 bg-[#c9f31d] text-black font-bold rounded-xl text-sm hover:bg-[#b8e019] transition disabled:opacity-40">
            {saving ? 'Saving…' : editing ? 'Update & Publish' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-[#222]">
        {(['content','meta','seo'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab===t?'border-[#c9f31d] text-[#c9f31d]':'border-transparent text-gray-500 hover:text-gray-300'}`}>
            {t==='content'?'📝 Content':t==='meta'?'⚙️ Settings':'🔍 SEO'}
          </button>
        ))}
      </div>

      {tab === 'content' && (
        <div className="space-y-5">
          <div>
            <label className={LBL}>Title *</label>
            <input value={f.title} onChange={set('title')} placeholder="Post title…" className={`${INP} text-xl font-bold py-4`} />
          </div>
          <div>
            <label className={LBL}>Excerpt</label>
            <textarea value={f.excerpt} onChange={set('excerpt')} rows={3} placeholder="Short description shown on cards…" className={INP} />
          </div>
          <div>
            <label className={LBL}>Content *</label>
            <RichEditor content={f.content} onChange={setContent} />
          </div>
        </div>
      )}

      {tab === 'meta' && (
        <div className="space-y-5 max-w-2xl">
          <div>
            <label className={LBL}>URL Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm shrink-0">/blog/</span>
              <input value={f.slug} onChange={e => { setAutoSlug(false); set('slug')(e); }} className={INP} placeholder="post-url-slug" />
            </div>
          </div>
          <div>
            <label className={LBL}>Featured Image</label>
            <div className="flex gap-2 items-start">
              <input
                value={f.image}
                onChange={set('image')}
                placeholder="Paste URL or upload file →"
                className={INP}
              />
              <label className="shrink-0 px-4 py-2.5 bg-[#1a1a1a] border border-[#333] text-gray-300 rounded-xl text-sm cursor-pointer hover:border-[#c9f31d] hover:text-[#c9f31d] transition whitespace-nowrap">
                {uploading ? '…' : '📤 Upload'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    setMsg('');
                    try {
                      const fd = new FormData();
                      fd.append('file', file);
                      const res = await fetch('/api/blog/upload', {
                        method: 'POST',
                        headers: { 'x-admin-key': KEY },
                        body: fd,
                      });
                      const data = await res.json();
                      if (data.url) {
                        setF(p => ({ ...p, image: data.url }));
                        setMsg('✓ New image URL — save post to update');
                      } else {
                        setMsg('Upload failed: ' + (data.error || 'unknown'));
                      }
                    } catch {
                      setMsg('Upload failed');
                    } finally {
                      setUploading(false);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            </div>
            {f.image && <img src={f.image} alt="" className="mt-3 h-36 w-full object-cover rounded-xl opacity-70" />}
            <p className="text-xs text-gray-600 mt-2">JPG, PNG, WebP, GIF or SVG · max 5MB</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LBL}>Category</label>
              <select value={f.category} onChange={set('category')} className={INP}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
            </div>
            <div>
              <label className={LBL}>Status</label>
              <select value={f.status} onChange={set('status')} className={INP}>
                <option value="draft">Draft</option><option value="published">Published</option><option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>
          <div>
            <label className={LBL}>Tags (comma separated)</label>
            <input value={f.tags} onChange={set('tags')} placeholder="loyalty, strategy, latin america" className={INP} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={LBL}>Author</label><input value={f.author} onChange={set('author')} className={INP} /></div>
            <div><label className={LBL}>Publish Date</label><input type="date" value={f.date} onChange={set('date')} className={INP} /></div>
          </div>
          {f.status === 'scheduled' && (
            <div><label className={LBL}>Schedule Date & Time</label><input type="datetime-local" value={f.scheduledAt} onChange={set('scheduledAt')} className={INP} /></div>
          )}
        </div>
      )}

      {tab === 'seo' && (
        <div className="space-y-5 max-w-2xl">
          <div className="p-4 bg-[#111] border border-[#222] rounded-xl">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Google Preview</p>
            <p className="text-blue-400 text-base font-medium truncate">{f.seoTitle||f.title||'Title'}</p>
            <p className="text-green-500 text-xs mt-0.5">viniciogarzon.com/blog/{f.slug||'slug'}</p>
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{f.seoDesc||f.excerpt||'Description…'}</p>
          </div>
          <div>
            <label className={LBL}>SEO Title <span className="text-gray-600 normal-case">(max 60)</span></label>
            <input value={f.seoTitle} onChange={set('seoTitle')} maxLength={60} placeholder={f.title} className={INP} />
            <p className="text-right text-xs text-gray-600 mt-1">{f.seoTitle.length}/60</p>
          </div>
          <div>
            <label className={LBL}>Meta Description <span className="text-gray-600 normal-case">(max 160)</span></label>
            <textarea value={f.seoDesc} onChange={set('seoDesc')} maxLength={160} rows={3} placeholder={f.excerpt} className={INP} />
            <p className="text-right text-xs text-gray-600 mt-1">{f.seoDesc.length}/160</p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-[#222]">
        <button onClick={() => router.push('/admin')} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
        <button onClick={() => save('draft')} disabled={saving} className="px-5 py-2.5 border border-[#333] text-gray-300 rounded-xl text-sm hover:border-gray-500 transition">Save Draft</button>
        <button onClick={() => save('published')} disabled={saving||!f.title||!f.content} className="px-6 py-2.5 bg-[#c9f31d] text-black font-bold rounded-xl text-sm hover:bg-[#b8e019] transition disabled:opacity-40">
          {saving?'Saving…':editing?'Update & Publish':'Publish Post'}
        </button>
      </div>
    </div>
  );
}
