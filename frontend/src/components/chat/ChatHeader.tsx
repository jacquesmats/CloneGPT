"use client"
import { Box, Typography, IconButton, AppBar, Toolbar } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { Conversation } from './types';

interface ChatHeaderProps {
  currentConversation: Conversation | null;
  onSettingsOpen: () => void;
  onMobileMenuToggle: () => void;
  isMobile: boolean;
}

const ChatHeader = ({
  currentConversation,
  onSettingsOpen,
  onMobileMenuToggle,
  isMobile
}: ChatHeaderProps) => {
  return (
    <>
      {/* Mobile AppBar */}
      <AppBar
        position="fixed"
        sx={{
          display: { xs: 'block', md: 'none' },
          bgcolor: '#1E1E1E',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMobileMenuToggle}
            sx={{ mr: 2 }}
          >
            <span>☰</span>
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {currentConversation?.title || "ChatGPT Clone"}
          </Typography>
          <IconButton color="inherit" onClick={onSettingsOpen}>
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Desktop Header */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
        }}
      >
        <Typography variant="h6">
          {currentConversation?.title || "New Chat"}
        </Typography>
        <IconButton onClick={onSettingsOpen} sx={{ color: 'white' }}>
          <SettingsIcon />
        </IconButton>
      </Box>
    </>
  );
};

export default ChatHeader;