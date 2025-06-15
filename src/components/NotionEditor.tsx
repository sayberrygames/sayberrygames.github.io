import { useEffect, useState } from 'react';
import { BlockNoteEditor } from '@blocknote/core';
import { BlockNoteView, useBlockNote } from '@blocknote/react';
import '@blocknote/react/style.css';

interface NotionEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

const NotionEditor = ({ content, onChange, placeholder, height = 500 }: NotionEditorProps) => {
  const [initialContent, setInitialContent] = useState<any[]>([]);

  // Convert markdown to BlockNote format
  useEffect(() => {
    if (content) {
      // For now, we'll use the content as is
      // In a real app, you'd convert markdown to BlockNote blocks
      setInitialContent([{
        type: "paragraph",
        content: [{
          type: "text",
          text: content
        }]
      }]);
    }
  }, []);

  // Create the editor
  const editor: BlockNoteEditor = useBlockNote({
    initialContent: initialContent.length > 0 ? initialContent : undefined,
    onEditorContentChange: (editor) => {
      // Convert blocks to markdown
      const blocks = editor.topLevelBlocks;
      let markdown = '';
      
      blocks.forEach(block => {
        switch (block.type) {
          case 'heading':
            const level = block.props.level || 1;
            markdown += '#'.repeat(level) + ' ' + getTextFromBlock(block) + '\n\n';
            break;
          case 'bulletListItem':
            markdown += '- ' + getTextFromBlock(block) + '\n';
            break;
          case 'numberedListItem':
            markdown += '1. ' + getTextFromBlock(block) + '\n';
            break;
          case 'checkListItem':
            const checked = block.props.checked ? 'x' : ' ';
            markdown += `- [${checked}] ` + getTextFromBlock(block) + '\n';
            break;
          case 'paragraph':
          default:
            const text = getTextFromBlock(block);
            if (text) markdown += text + '\n\n';
            break;
        }
      });
      
      onChange(markdown.trim());
    }
  });

  // Helper function to extract text from a block
  const getTextFromBlock = (block: any): string => {
    if (!block.content) return '';
    
    return block.content.map((content: any) => {
      if (content.type === 'text') {
        let text = content.text || '';
        
        // Apply formatting
        if (content.styles?.bold) text = `**${text}**`;
        if (content.styles?.italic) text = `*${text}*`;
        if (content.styles?.code) text = `\`${text}\``;
        if (content.styles?.underline) text = `<u>${text}</u>`;
        if (content.styles?.strikethrough) text = `~~${text}~~`;
        
        return text;
      } else if (content.type === 'link') {
        return `[${content.content?.[0]?.text || ''}](${content.props?.url || ''})`;
      }
      return '';
    }).join('');
  };

  return (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden"
      style={{ height: `${height}px` }}
    >
      <BlockNoteView 
        editor={editor} 
        theme="dark"
        data-theming-css-variables-theme="dark"
      />
      <style>{`
        .bn-container {
          background-color: rgb(31 41 55);
          color: white;
          font-family: inherit;
        }
        
        .bn-editor {
          padding: 1rem;
          min-height: ${height - 50}px;
        }
        
        .bn-block-content {
          color: white;
        }
        
        .bn-inline-content {
          color: white;
        }
        
        /* Placeholder text */
        .bn-inline-content[data-is-empty-and-focused="true"]:before,
        .bn-inline-content[data-is-empty="true"]:before {
          content: "${placeholder || '내용을 입력하세요...'}";
          color: rgb(156 163 175);
        }
        
        /* Selection and focus */
        .bn-block-outer[data-is-dragging="true"] {
          opacity: 0.5;
        }
        
        /* Side menu */
        .bn-side-menu {
          background-color: rgb(31 41 55);
        }
        
        .bn-side-menu-button {
          color: rgb(156 163 175);
        }
        
        .bn-side-menu-button:hover {
          background-color: rgb(55 65 81);
          color: white;
        }
        
        /* Formatting toolbar */
        .bn-formatting-toolbar {
          background-color: rgb(31 41 55);
          border: 1px solid rgb(75 85 99);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);
        }
        
        .bn-formatting-toolbar-button {
          color: rgb(209 213 219);
        }
        
        .bn-formatting-toolbar-button:hover {
          background-color: rgb(55 65 81);
        }
        
        .bn-formatting-toolbar-button[data-selected="true"] {
          background-color: rgb(59 130 246);
          color: white;
        }
        
        /* Slash menu */
        .bn-slash-menu {
          background-color: rgb(31 41 55);
          border: 1px solid rgb(75 85 99);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);
        }
        
        .bn-slash-menu-item {
          color: rgb(209 213 219);
        }
        
        .bn-slash-menu-item:hover,
        .bn-slash-menu-item[data-selected="true"] {
          background-color: rgb(55 65 81);
        }
        
        /* Links */
        .bn-inline-content a {
          color: rgb(96 165 250);
          text-decoration: underline;
        }
        
        /* Code blocks */
        .bn-inline-content code {
          background-color: rgb(55 65 81);
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        
        /* Headings */
        [data-node-type="heading"] {
          font-weight: bold;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        
        [data-level="1"] {
          font-size: 2em;
        }
        
        [data-level="2"] {
          font-size: 1.5em;
        }
        
        [data-level="3"] {
          font-size: 1.25em;
        }
      `}</style>
    </div>
  );
};

export default NotionEditor;