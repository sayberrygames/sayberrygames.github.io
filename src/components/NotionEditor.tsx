import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import './NotionEditor.css';

interface NotionEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

const NotionEditor = ({ content, onChange, placeholder, height = 500 }: NotionEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Write something...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      // Convert to markdown-like format
      const html = editor.getHTML();
      let markdown = html;
      
      // Basic HTML to Markdown conversion
      markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n');
      markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n');
      markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n');
      markdown = markdown.replace(/<p>(.*?)<\/p>/g, '$1\n\n');
      markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
      markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
      markdown = markdown.replace(/<ul>/g, '');
      markdown = markdown.replace(/<\/ul>/g, '\n');
      markdown = markdown.replace(/<li>(.*?)<\/li>/g, '- $1\n');
      markdown = markdown.replace(/<ol>/g, '');
      markdown = markdown.replace(/<\/ol>/g, '\n');
      markdown = markdown.replace(/<li>(.*?)<\/li>/g, '1. $1\n');
      markdown = markdown.replace(/<br\s*\/?>/g, '\n');
      markdown = markdown.replace(/<code>(.*?)<\/code>/g, '`$1`');
      
      onChange(markdown.trim());
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden" style={{ height: `${height}px` }}>
      <div className="border-b border-gray-700 p-2 flex gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded hover:bg-gray-700 ${editor.isActive('bold') ? 'bg-gray-700' : ''}`}
          type="button"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded hover:bg-gray-700 ${editor.isActive('italic') ? 'bg-gray-700' : ''}`}
          type="button"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`px-3 py-1 rounded hover:bg-gray-700 ${editor.isActive('code') ? 'bg-gray-700' : ''}`}
          type="button"
        >
          <code>&lt;/&gt;</code>
        </button>
        <div className="w-px bg-gray-700" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1 rounded hover:bg-gray-700 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-700' : ''}`}
          type="button"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 rounded hover:bg-gray-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-700' : ''}`}
          type="button"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 rounded hover:bg-gray-700 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-700' : ''}`}
          type="button"
        >
          H3
        </button>
        <div className="w-px bg-gray-700" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded hover:bg-gray-700 ${editor.isActive('bulletList') ? 'bg-gray-700' : ''}`}
          type="button"
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded hover:bg-gray-700 ${editor.isActive('orderedList') ? 'bg-gray-700' : ''}`}
          type="button"
        >
          1. List
        </button>
      </div>
      <div className="overflow-y-auto" style={{ height: `${height - 50}px`, minHeight: `${height - 50}px` }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default NotionEditor;