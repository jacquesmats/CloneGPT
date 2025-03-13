"use client"
import React, { useRef, useEffect } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import MarkdownMessage from './MarkdownMessage';

const MessageList = ({ messages, loading }) => {
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group consecutive assistant messages
  const groupedMessages = messages.reduce((acc, message, index) => {
    if (message.role === 'user') {
      // Always add user messages individually
      acc.push({ ...message, isGrouped: false });
    } else {
      // For assistant messages, check if previous was also from assistant
      const prevMessage = index > 0 ? messages[index - 1] : null;
      const isGrouped = prevMessage && prevMessage.role === 'assistant';
      
      // If grouped, combine with previous assistant message
      if (isGrouped && acc.length > 0) {
        const lastIndex = acc.length - 1;
        acc[lastIndex].content += '\n\n' + message.content;
      } else {
        acc.push({ ...message, isGrouped: false });
      }
    }
    return acc;
  }, []);

  return (
    <Box 
      sx={{ 
        flex: 1, 
        overflowY: "auto", 
        bgcolor: "#121212",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {groupedMessages.length === 0 ? (
        <Box 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            p: 3
          }}
        >
          <Typography variant="body1" sx={{ color: '#777', textAlign: 'center' }}>
            Send a message to start the conversation
          </Typography>
        </Box>
      ) : (
        groupedMessages.map((message, index) => (
          <MarkdownMessage
            key={index}
            content={message.content}
            role={message.role}
          />
        ))
      )}
      
      {loading && (
        <Box sx={{ p: 3, width: '100%' }}>
          <Typography sx={{ color: '#999' }}>
            <em>Thinking...</em>
          </Typography>
        </Box>
      )}
      
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default MessageList;