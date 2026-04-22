'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { useCallback, useEffect } from 'react';

const B = ({ on, click, title, children }: { on?: boolean; click(): void; title: string; children: React.ReactNode }) => (
  <button type="button" onClick={click} title={title}
    className={`px-2 py-1.5 rounded text-sm font-medium transition ${on ? 'bg-[#c9f31d] text-black' : 'text-gray-300 hover:bg-gray-700'}`}>
    {children}
  </button>
);

export default function RichEditor({ content, onChange }: { content: string; onChange(html: string): void }) {
  const ed = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline, Image,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'rich-ed min-h-[400px] outline-none p-5 text-gray-200' },
      // Strip inline styles when pasting from external sources
      transformPastedHTML(html: string) {
        // Remove color, background-color, font-family inline styles
        return html
          .replace(/\sstyle="[^"]*"/gi, '')
          .replace(/\sstyle='[^']*'/gi, '');
      },
    },
  });

  useEffect(() => { if (ed && content !== ed.getHTML()) ed.commands.setContent(content, { emitUpdate: false }); }, [content]); // eslint-disable-line

  const link = useCallback(() => {
    const prev = ed?.getAttributes('link').href || '';
    const url = window.prompt('URL:', prev);
    if (url === null) return;
    if (!url) ed?.chain().focus().unsetLink().run();
    else ed?.chain().focus().setLink({ href: url }).run();
  }, [ed]);

  const img = useCallback(() => { const u = window.prompt('Image URL:'); if (u) ed?.chain().focus().setImage({ src: u }).run(); }, [ed]);

  if (!ed) return <div className="h-96 bg-[#111] border border-[#333] rounded-xl animate-pulse" />;

  return (
    <div className="border border-[#333] rounded-xl overflow-hidden bg-[#0d0d0d]">
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-[#222] bg-[#111]">
        {[
          [{ t: 'H2', tt: 'H2', fn: () => ed.chain().focus().toggleHeading({ level: 2 }).run(), on: ed.isActive('heading', { level: 2 }) },
           { t: 'H3', tt: 'H3', fn: () => ed.chain().focus().toggleHeading({ level: 3 }).run(), on: ed.isActive('heading', { level: 3 }) },
           { t: 'H4', tt: 'H4', fn: () => ed.chain().focus().toggleHeading({ level: 4 }).run(), on: ed.isActive('heading', { level: 4 }) }],
          [{ t: 'B', tt: 'Bold', fn: () => ed.chain().focus().toggleBold().run(), on: ed.isActive('bold') },
           { t: 'I', tt: 'Italic', fn: () => ed.chain().focus().toggleItalic().run(), on: ed.isActive('italic') },
           { t: 'U', tt: 'Underline', fn: () => ed.chain().focus().toggleUnderline().run(), on: ed.isActive('underline') },
           { t: 'S', tt: 'Strike', fn: () => ed.chain().focus().toggleStrike().run(), on: ed.isActive('strike') }],
          [{ t: '❝', tt: 'Blockquote', fn: () => ed.chain().focus().toggleBlockquote().run(), on: ed.isActive('blockquote') },
           { t: '•', tt: 'Bullet list', fn: () => ed.chain().focus().toggleBulletList().run(), on: ed.isActive('bulletList') },
           { t: '1.', tt: 'Ordered list', fn: () => ed.chain().focus().toggleOrderedList().run(), on: ed.isActive('orderedList') },
           { t: '—', tt: 'Divider', fn: () => ed.chain().focus().setHorizontalRule().run(), on: false }],
          [{ t: '🔗', tt: 'Link', fn: link, on: ed.isActive('link') },
           { t: '🖼', tt: 'Image', fn: img, on: false }],
        ].map((grp, gi) => (
          <span key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <span className="w-px h-5 bg-[#333] mx-1" />}
            {grp.map((item: any, ii) => <B key={ii} on={item.on} click={item.fn} title={item.tt}>{item.t}</B>)}
          </span>
        ))}
        <span className="ml-auto flex gap-0.5">
          <B click={() => ed.chain().focus().undo().run()} title="Undo">↩</B>
          <B click={() => ed.chain().focus().redo().run()} title="Redo">↪</B>
        </span>
      </div>
      <style>{`
        .rich-ed h2{font-size:1.6rem;font-weight:700;color:#fff;margin:1.8rem 0 .9rem;line-height:1.3}
        .rich-ed h3{font-size:1.25rem;font-weight:600;color:#fff;margin:1.4rem 0 .6rem}
        .rich-ed h4{font-size:1.05rem;font-weight:600;color:#e5e5e5;margin:1.1rem 0 .5rem}
        .rich-ed p{margin-bottom:1.1rem;color:#9ca3af;line-height:1.8}
        .rich-ed p:empty{min-height:1.5rem}
        .rich-ed blockquote{border-left:4px solid #c9f31d;padding:.8rem 1.2rem;margin:1.4rem 0;background:rgba(255,255,255,.03);border-radius:0 .5rem .5rem 0}
        .rich-ed blockquote p{color:#e5e5e5;font-style:italic;margin:0}
        .rich-ed ul{list-style:disc;padding-left:1.4rem;margin-bottom:1.1rem;color:#9ca3af}
        .rich-ed ol{list-style:decimal;padding-left:1.4rem;margin-bottom:1.1rem;color:#9ca3af}
        .rich-ed li{margin-bottom:.35rem}
        .rich-ed a{color:#c9f31d;text-decoration:underline}
        .rich-ed strong{color:#fff;font-weight:600}
        .rich-ed hr{border:none;border-top:1px solid #333;margin:1.8rem 0}
        .rich-ed img{max-width:100%;border-radius:.75rem;margin:1.2rem 0}
        .ProseMirror:focus{outline:none}
        /* Override inline colors from pasted content (Google Docs, web pages, etc.) */
        .rich-ed span[style*="color"],
        .rich-ed p[style*="color"],
        .rich-ed li[style*="color"] { color: inherit !important; }
        .rich-ed span[style*="background"],
        .rich-ed p[style*="background"] { background: transparent !important; }
        .rich-ed *[style*="font-family"] { font-family: inherit !important; }
      `}</style>
      <EditorContent editor={ed} />
    </div>
  );
}
