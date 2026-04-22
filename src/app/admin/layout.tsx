'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const KEY = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'vg-admin-2025';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const path = usePathname();

  useEffect(() => { if (sessionStorage.getItem('vg-auth') === KEY) setOk(true); }, []);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === KEY) { sessionStorage.setItem('vg-auth', KEY); setOk(true); }
    else setErr('Incorrect password');
  };

  if (!ok) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="VG" className="h-12 mx-auto mb-4 opacity-90" />
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Blog Management</p>
        </div>
        <form onSubmit={login} className="space-y-4">
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Password"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#333] text-white rounded-xl focus:outline-none focus:border-[#c9f31d] transition" autoFocus />
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button type="submit" className="w-full py-3 bg-[#c9f31d] text-black font-bold rounded-xl hover:bg-[#b8e019] transition">Enter</button>
        </form>
        <p className="text-center mt-6"><Link href="/" className="text-gray-500 text-sm hover:text-gray-300">← Back to site</Link></p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-[#222] bg-[#111] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin"><img src="/images/logo.png" alt="VG" className="h-8 opacity-90" /></Link>
          <nav className="flex gap-4">
            {[{ href: '/admin', label: '📋 All Posts' }, { href: '/admin/blog/new', label: '+ New Post' }].map(n => (
              <Link key={n.href} href={n.href}
                className={`text-sm transition ${path === n.href ? 'text-[#c9f31d] font-medium' : 'text-gray-400 hover:text-white'}`}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/" target="_blank" className="text-sm text-gray-400 hover:text-white">View site ↗</Link>
          <button onClick={() => { sessionStorage.removeItem('vg-auth'); setOk(false); }} className="text-sm text-gray-500 hover:text-red-400">Sign out</button>
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
