"use client"
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, Paper } from '@mui/material';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CopyButton';

// Custom components for rendering different parts of the markdown
const components = {
  // Code block rendering with syntax highlighting and copy button
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <CodeBlock 
        language={match[1]} 
        value={String(children).replace(/\n$/, '')}
      />
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  // Customize paragraph rendering
  p({ children }) {
    return <p style={{ margin: '0.5em 0' }}>{children}</p>;
  },
  // Customize link rendering
  a({ href, children }) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ color: '#90CAF9', textDecoration: 'none' }}
      >
        {children}
      </a>
    );
  },
  // Customize headings
  h1({ children }) {
    return <h1 style={{ borderBottom: '1px solid #333', paddingBottom: '0.3em' }}>{children}</h1>;
  },
  h2({ children }) {
    return <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '0.3em' }}>{children}</h2>;
  },
  // Style blockquotes
  blockquote({ children }) {
    return (
      <blockquote style={{ 
        borderLeft: '4px solid #536DFE', 
        paddingLeft: '1em', 
        margin: '1em 0',
        color: '#AAA' 
      }}>
        {children}
      </blockquote>
    );
  },
  // Style tables
  table({ children }) {
    return (
      <table style={{ 
        borderCollapse: 'collapse', 
        width: '100%', 
        margin: '1em 0'
      }}>
        {children}
      </table>
    );
  },
  // Style table cells
  td({ children }) {
    return (
      <td style={{ 
        border: '1px solid #333', 
        padding: '0.5em'
      }}>
        {children}
      </td>
    );
  },
  // Style table headers
  th({ children }) {
    return (
      <th style={{ 
        border: '1px solid #333', 
        padding: '0.5em',
        background: '#252525'
      }}>
        {children}
      </th>
    );
  }
};

const MarkdownMessage = ({ content, role }) => {
  // Different styling for user vs assistant messages
  if (role === "user") {
    // User messages remain as bubbles aligned to the right
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 2,
          mx: 2,
        }}
      >
        <Paper
          elevation={1}
          sx={{
            fontFamily: "'Nunito', sans-serif",
            maxWidth: "70%",
            p: "10px 16px",
            borderRadius: "18px",
            bgcolor: "#333333",
            color: "white",
            overflowX: 'auto',
            '& pre': {
              borderRadius: '4px',
              margin: '0.5em 0'
            },
            '& code': {
              fontFamily: 'monospace',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              padding: '0.2em 0.4em',
              borderRadius: '3px',
              fontSize: '0.9em'
            },
            '& img': {
              maxWidth: '100%'
            },
            '& ul, & ol': {
              paddingLeft: '1.5em',
              margin: '0.5em 0'
            }
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {content}
          </ReactMarkdown>
        </Paper>
      </Box>
    );
  } else {
    // Assistant messages span the full width
    return (
      <Box
        sx={{
          width: "100%",
          mb: 4,
          mt: 2,
          backgroundColor: "#121212",
        }}
      >
        <Box
          sx={{
            p: 3,
            color: "#ddd",
            overflowX: 'auto',
            maxWidth: "100%",
            '& pre': {
              borderRadius: '4px',
              margin: '1em 0',
              p: 2,
              backgroundColor: '#1E1E1E',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              maxWidth: '100%'
            },
            '& code': {
              fontFamily: 'monospace',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              padding: '0.2em 0.4em',
              borderRadius: '3px',
              fontSize: '0.9em',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            },
            '& img': {
              maxWidth: '100%'
            },
            '& ul, & ol': {
              paddingLeft: '1.5em',
              margin: '0.5em 0'
            },
            '& h1, & h2, & h3, & h4': {
              paddingBottom: '0.3em',
              marginTop: '1.5em',
            }
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {content}
          </ReactMarkdown>
        </Box>
      </Box>
    );
  }
};

export default MarkdownMessage;