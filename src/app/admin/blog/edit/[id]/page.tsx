'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PostForm from '@/components/PostForm';
const KEY = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'vg-admin-2025';
export default function EditPost() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!id) return;
    fetch(`/api/blog/${id}`, { headers: { 'x-admin-key': KEY } })
      .then(r => r.json()).then(d => { if (d.post) setPost(d.post); else setErr('Not found'); })
      .catch(() => setErr('Failed to load'));
  }, [id]);
  if (err) return <p className="text-red-400 text-center py-16">{err}</p>;
  if (!post) return <div className="space-y-4 animate-pulse">{[1,2,3].map(i=><div key={i} className="h-16 bg-[#111] rounded-xl"/>)}</div>;
  return <PostForm init={post} editing />;
}
