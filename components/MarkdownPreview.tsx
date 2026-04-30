'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="prose prose-sm max-w-none
      prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
      prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base
      prose-p:text-gray-600 prose-p:leading-7
      prose-a:text-gray-900 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-gray-900
      prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-gray-900 prose-code:text-xs prose-code:font-mono
      prose-pre:rounded-xl prose-pre:border prose-pre:border-gray-200 prose-pre:bg-gray-50
      prose-blockquote:border-l-violet-500 prose-blockquote:text-gray-500
      prose-li:text-gray-600
      prose-hr:border-gray-200
      prose-img:rounded-lg prose-img:inline-block prose-img:my-1
      [&_img]:max-h-8"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
