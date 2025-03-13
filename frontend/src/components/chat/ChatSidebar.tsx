"use client"
import { Box, Typography, IconButton, Drawer, Toolbar } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ConversationList from './ConversationList';
import { Conversation, ChatSettings } from './types';

interface ChatSidebarProps {
  drawerWidth: number;
  isMobile: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
  conversations: Conversation[];
  currentConversation: Conversation | null;
  editingConversationId: string | null;
  editConversationName: string;
  onLogout: () => void;
  onCreateConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onStartEditingName: (id: string, name: string) => void;
  onSaveEditingName: (id: string, name: string) => void;
  onChangeEditName: (name: string) => void;
}

const ChatSidebar = ({
  drawerWidth,
  isMobile,
  mobileOpen,
  onMobileClose,
  conversations,
  currentConversation,
  editingConversationId,
  editConversationName,
  onLogout,
  onCreateConversation,
  onSelectConversation,
  onDeleteConversation,
  onStartEditingName,
  onSaveEditingName,
  onChangeEditName
}: ChatSidebarProps) => {
  // Content to be rendered inside both drawers
  const drawerContent = (
    <>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            ChatGPT Clone
          </Typography>
          <IconButton onClick={onLogout} sx={{ color: 'white' }}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Box>

      <ConversationList
        conversations={conversations}
        currentConversation={currentConversation}
        editingConversationId={editingConversationId}
        editConversationName={editConversationName}
        onCreateConversation={onCreateConversation}
        onSelectConversation={onSelectConversation}
        onDeleteConversation={onDeleteConversation}
        onStartEditingName={onStartEditingName}
        onSaveEditingName={onSaveEditingName}
        onChangeEditName={onChangeEditName}
      />
    </>
  );

  return (
    <>
      {/* Desktop drawer (permanent) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#1E1E1E',
            color: 'white',
            borderRight: "1px solid #333"
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile drawer (temporary) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            bgcolor: '#1E1E1E',
            color: 'white'
          },
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        {drawerContent}
      </Drawer>
    </>
  );
};

export default ChatSidebar;