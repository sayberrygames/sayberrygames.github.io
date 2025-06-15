import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

const MarkdownViewer = ({ content, className = '' }: MarkdownViewerProps) => {
  return (
    <div className={`markdown-body prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => <h1 className="text-4xl font-bold mb-6 mt-8 text-white">{children}</h1>,
          h2: ({ children }) => <h2 className="text-3xl font-bold mb-4 mt-6 text-white">{children}</h2>,
          h3: ({ children }) => <h3 className="text-2xl font-bold mb-3 mt-4 text-white">{children}</h3>,
          h4: ({ children }) => <h4 className="text-xl font-bold mb-2 mt-3 text-white">{children}</h4>,
          p: ({ children }) => <p className="mb-4 text-gray-300 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-4 text-gray-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-4 text-gray-300">{children}</ol>,
          li: ({ children }) => <li className="mb-2">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-600 pl-4 my-4 italic text-gray-400">
              {children}
            </blockquote>
          ),
          code: ({ inline, children, ...props }) => {
            return inline ? (
              <code className="bg-gray-800 px-1 py-0.5 rounded text-sm text-gray-300" {...props}>
                {children}
              </code>
            ) : (
              <code className="block bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <img src={src} alt={alt} className="max-w-full h-auto rounded-lg my-4" />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-700">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-800">{children}</thead>,
          tbody: ({ children }) => <tbody className="bg-gray-900 divide-y divide-gray-700">{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{children}</td>
          ),
          hr: () => <hr className="my-8 border-gray-700" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;