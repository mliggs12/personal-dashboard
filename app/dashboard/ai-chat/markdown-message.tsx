"use client";

import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { CodeBlock } from './components/code-block';

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          // Customize code blocks with copy functionality
          code: ({ node, inline, children, ...props }) => {
            return !inline ? (
              <code {...props}>
                {children}
              </code>
            ) : (
              <code style={{ 
                backgroundColor: 'hsl(var(--muted))',
                padding: '0.125rem 0.375rem',
                borderRadius: '0.25rem',
                fontSize: '0.875rem'
              }} {...props}>
                {children}
              </code>
            );
          },
          // Style links
          a: ({ node, children, ...props }) => (
            <a 
              style={{
                color: 'hsl(var(--primary))',
                textDecoration: 'underline',
                textUnderlineOffset: '4px'
              }}
              target="_blank" 
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          // Style lists
          ul: ({ node, children, ...props }) => (
            <ul style={{ marginTop: '0.5rem', marginBottom: '0.5rem', marginLeft: '1rem', listStyleType: 'disc' }} {...props}>
              {children}
            </ul>
          ),
          ol: ({ node, children, ...props }) => (
            <ol style={{ marginTop: '0.5rem', marginBottom: '0.5rem', marginLeft: '1rem', listStyleType: 'decimal' }} {...props}>
              {children}
            </ol>
          ),
          // Style headings
          h1: ({ node, children, ...props }) => (
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem', marginBottom: '0.5rem' }} {...props}>{children}</h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.75rem', marginBottom: '0.5rem' }} {...props}>{children}</h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginTop: '0.5rem', marginBottom: '0.25rem' }} {...props}>{children}</h3>
          ),
          // Style blockquotes
          blockquote: ({ node, children, ...props }) => (
            <blockquote style={{ 
              borderLeft: '4px solid hsl(var(--primary) / 0.3)',
              paddingLeft: '1rem',
              fontStyle: 'italic',
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
              color: 'hsl(var(--muted-foreground))'
            }} {...props}>
              {children}
            </blockquote>
          ),
          // Style tables
          table: ({ node, children, ...props }) => (
            <div style={{ overflowX: 'auto', marginTop: '1rem', marginBottom: '1rem' }}>
              <table style={{ minWidth: '100%', borderCollapse: 'collapse' }} {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ node, children, ...props }) => (
            <th style={{ 
              padding: '0.5rem 0.75rem',
              textAlign: 'left',
              fontSize: '0.875rem',
              fontWeight: '600',
              backgroundColor: 'hsl(var(--muted))'
            }} {...props}>
              {children}
            </th>
          ),
          td: ({ node, children, ...props }) => (
            <td style={{ 
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
              borderTop: '1px solid hsl(var(--border))'
            }} {...props}>
              {children}
            </td>
          ),
          // Style paragraphs
          p: ({ node, children, ...props }) => (
            <p style={{ marginBottom: '0.5rem' }} {...props}>
              {children}
            </p>
          ),
          // Style pre (code block container) with copy button
          pre: ({ node, children, ...props }) => (
            <CodeBlock>
              {children}
            </CodeBlock>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
