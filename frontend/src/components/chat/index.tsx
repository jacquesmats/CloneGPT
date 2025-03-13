"use client"
import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, useMediaQuery, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LoadingIndicator from '../ui/LoadingIndicator';
import ChatHeader from './ChatHeader';
import ChatSidebar from './ChatSidebar';
import ChatInput from './ChatInput';
import SettingsDialog from './SettingsDialog';
import MessageList from '../messages/MessageList';
import useAuth from './hooks/useAuth';
import useConversations from './hooks/useConversations';
import useMessages from './hooks/useMessages';
import { ChatSettings } from './types';

const Chat = () => {
  // Theme and responsive layout
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const drawerWidth = 280;

  // Default settings
  const [settings, setSettings] = useState<ChatSettings>({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    contextLength: 4000
  });

  // Custom hooks
  const { isAuthenticated, user, loading: authLoading, logout } = useAuth();
  
  const {
    conversations,
    currentConversation,
    editingConversationId,
    editConversationName,
    loadConversations,
    selectConversation,
    createConversation,
    deleteConversation,
    updateConversationName,
    streamConversationRename,
    updateConversationSettings,
    setEditingConversationId,
    setEditConversationName
  } = useConversations();
  
  const {
    messages,
    input,
    loading: messageLoading,
    isStreaming,
    messagesEndRef,
    setInput,
    setMessagesFromConversation,
    sendMessage,
    stopGeneration
  } = useMessages(currentConversation, streamConversationRename);

  // Initialize
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated, loadConversations]);

  // Update messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      setMessagesFromConversation(currentConversation);
      // Update settings based on current conversation
      setSettings({
        model: currentConversation.model || 'gpt-4o-mini',
        temperature: currentConversation.temperature || 0.7,
        contextLength: currentConversation.context_length || 4000
      });
    }
  }, [currentConversation, setMessagesFromConversation]);

  // Handle conversation selection
  const handleSelectConversation = useCallback(async (id: string) => {
    const conversation = await selectConversation(id);
    if (conversation) {
      setMobileDrawerOpen(false);
    }
  }, [selectConversation]);

  // Handle new conversation creation
  const handleCreateConversation = useCallback(async () => {
    await createConversation(settings);
    setMobileDrawerOpen(false);
  }, [createConversation, settings]);

  // Handle settings update
  const handleUpdateSettings = useCallback(async (newSettings: ChatSettings) => {
    setSettings(newSettings);
    if (currentConversation) {
      await updateConversationSettings(currentConversation.id, newSettings);
    }
  }, [currentConversation, updateConversationSettings]);

  // Handle send message
  const handleSendMessage = useCallback(() => {
    sendMessage(settings);
  }, [sendMessage, settings]);

  // Handle saving conversation name
  const handleSaveConversationName = useCallback(async () => {
    if (editingConversationId && editConversationName.trim()) {
      await updateConversationName(editingConversationId, editConversationName);
      // Reset editing state after saving
      setEditingConversationId(null);
    } else if (editingConversationId) {
      // If name is empty, cancel editing without saving
      setEditingConversationId(null);
    }
  }, [editingConversationId, editConversationName, updateConversationName, setEditingConversationId]);

  // If loading auth, show loading indicator
  if (authLoading) {
    return <LoadingIndicator fullScreen message="Loading chat..." />;
  }

  // If not authenticated, don't render the chat UI
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#121212" }}>
      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleUpdateSettings}
        currentConversation={currentConversation}
        initialSettings={settings}
      />

      {/* Sidebar */}
      <ChatSidebar
        drawerWidth={drawerWidth}
        isMobile={isMobile}
        mobileOpen={mobileDrawerOpen}
        onMobileClose={() => setMobileDrawerOpen(false)}
        conversations={conversations}
        currentConversation={currentConversation}
        editingConversationId={editingConversationId}
        editConversationName={editConversationName}
        onLogout={logout}
        onCreateConversation={handleCreateConversation}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={deleteConversation}
        onStartEditingName={(id, name) => {
          setEditingConversationId(id);
          setEditConversationName(name);
        }}
        onSaveEditingName={handleSaveConversationName}
        onChangeEditName={setEditConversationName}
      />

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#121212",
          color: "white",
          mt: { xs: 8, md: 0 } // Add margin top on mobile to account for AppBar
        }}
      >
        {/* Header */}
        <ChatHeader
          currentConversation={currentConversation}
          onSettingsOpen={() => setSettingsOpen(true)}
          onMobileMenuToggle={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          isMobile={isMobile}
        />

        {/* Message List or Empty State */}
        {currentConversation ? (
          <MessageList
            messages={messages}
            loading={messageLoading || isStreaming}
            messagesEndRef={messagesEndRef}
          />
        ) : (
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 3
          }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#555' }}>
              ChatGPT Clone
            </Typography>
            <Typography variant="body1" sx={{ color: '#777', maxWidth: '500px', textAlign: 'center', mb: 4 }}>
              Start a new conversation or select one from the sidebar
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateConversation}
              sx={{ bgcolor: '#333', '&:hover': { bgcolor: '#444' } }}
            >
              New Chat
            </Button>
          </Box>
        )}

        {/* Input */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSendMessage}
          onStop={stopGeneration}
          loading={messageLoading}
          disabled={!currentConversation}
        />
      </Box>
    </Box>
  );
};

export default Chat;