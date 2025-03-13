"use client"
import React, { useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

interface CodeBlockProps {
  language?: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ position: 'relative', my: 2 }}>
      {/* Code block controls */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.6)', 
          borderTopRightRadius: '4px',
          zIndex: 1
        }}
      >
        {/* Language indicator */}
        {language && (
          <Box 
            sx={{ 
              color: '#ccc',
              px: 1.5,
              py: 0.5,
              fontSize: '0.75rem',
              fontFamily: 'monospace',
            }}
          >
            {language}
          </Box>
        )}
        
        {/* Copy button */}
        <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
          <IconButton 
            onClick={handleCopy}
            size="small"
            sx={{ 
              color: '#ccc',
              m: 0.5,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Code block */}
      <SyntaxHighlighter
        language={language || 'text'}
        style={atomDark}
        customStyle={{
          margin: 0,
          borderRadius: '4px',
          fontSize: '0.9rem',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          maxWidth: '100%'
        }}
        showLineNumbers={value.split('\n').length > 5}
      >
        {value}
      </SyntaxHighlighter>
    </Box>
  );
};

export default CodeBlock;