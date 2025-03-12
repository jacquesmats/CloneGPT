"use client"
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Drawer,
  AppBar,
  Toolbar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  MenuItem
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import StopIcon from "@mui/icons-material/Stop";
import apiService from "@/services/apiService";

// Types
interface Message {
  id?: string;
  role: string;
  content: string;
  created_at?: string;
}

interface Conversation {
  id: string;
  title: string;
  model: string;
  temperature: number;
  context_length: number;
  prompt?: string;
  created_at?: string;
  updated_at?: string;
}

interface ChatSettings {
  model: string;
  temperature: number;
  contextLength: number;
}

// Main Chat Component
const Chat = () => {
  const router = useRouter();
  
  // State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{username: string} | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [availableModels] = useState<string[]>([
    'gpt-4o',
    'gpt-4o-mini'
  ]);
  const [settings, setSettings] = useState<ChatSettings>({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    contextLength: 4000
  });
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const drawerWidth = 280;

  // Add these new state variables near the other state declarations
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editConversationName, setEditConversationName] = useState("");

  // Update state declarations to include streaming state
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isTitleStreaming, setIsTitleStreaming] = useState<boolean>(false);

  // Check authentication on mount
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (token) {
      apiService.setAuthToken(token);
      setIsAuthenticated(true);
      setUser({ username: localStorage.getItem('username') || 'User' });
      loadConversations();
    } else {
      // Redirect to login page if not authenticated
      router.push('/login');
    }
  }, [router]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations
  const loadConversations = async () => {
    try {
      const data = await apiService.getConversations();
      setConversations(data);
      
      // If we have conversations but none selected, select the first one
      if (data.length > 0 && !currentConversation) {
        selectConversation(data[0].id);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  // Select a conversation
  const selectConversation = async (id: string) => {
    try {
      const conversation = await apiService.getConversation(id);
      setCurrentConversation(conversation);
      setMessages(conversation.messages || []);
      setSettings({
        model: conversation.model || 'gpt-4o-mini',
        temperature: conversation.temperature || 0.7,
        contextLength: conversation.context_length || 4000
      });
      setMobileDrawerOpen(false); // Close mobile drawer after selection
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  // Create a new conversation
  const createNewConversation = async () => {
    try {
      const newConversation = await apiService.createConversation(settings);
      setConversations([newConversation, ...conversations]);
      setCurrentConversation(newConversation);
      setMessages([]);
      setMobileDrawerOpen(false); // Close mobile drawer after creation
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  // Delete a conversation
  const deleteConversation = async (id: string) => {
    try {
      await apiService.deleteConversation(id);
      const updatedConversations = conversations.filter(c => c.id !== id);
      setConversations(updatedConversations);
      
      if (currentConversation?.id === id) {
        if (updatedConversations.length > 0) {
          selectConversation(updatedConversations[0].id);
        } else {
          setCurrentConversation(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  // Update conversation name
  const updateConversationName = async (id: string, newName: string) => {
    try {
      const updatedConversation = await apiService.updateConversation(id, { title: newName });
      setConversations(
        conversations.map(c => c.id === id ? { ...c, title: newName } : c)
      );
      if (currentConversation?.id === id) {
        setCurrentConversation(updatedConversation);
      }
    } catch (error) {
      console.error("Error updating conversation name:", error);
    }
  };

  // Update settings
  const updateSettings = async () => {
    if (currentConversation) {
      try {
        const updatedConversation = await apiService.updateConversation(
          currentConversation.id, 
          { 
            model: settings.model, 
            temperature: settings.temperature, 
            context_length: settings.contextLength 
          }
        );
        setCurrentConversation(updatedConversation);
        setSettingsOpen(false);
      } catch (error) {
        console.error("Error updating settings:", error);
      }
    }
  };

  // Simulated streaming version of sendMessage
  const sendMessage = async () => {
    if (!input.trim() || !currentConversation) return;
    
    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    
    // Create new AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      // First get the complete response
      const response = await apiService.addMessage(currentConversation.id, input, settings.model);
      const assistantMessage = response.assistant_message || { role: "assistant", content: "No response received" };
      
      // Then simulate streaming by adding the message with empty content
      setMessages(prev => [...prev, { ...assistantMessage, content: "" }]);
      setIsStreaming(true);
      
      // Simulate streaming by revealing one character at a time
      const fullContent = assistantMessage.content;
      let displayedContent = "";
      const charUpdateInterval = 10; // ms between character additions
      
      for (let i = 0; i < fullContent.length; i++) {
        if (controller.signal.aborted) break;
        
        await new Promise(resolve => setTimeout(resolve, charUpdateInterval));
        displayedContent += fullContent[i];
        
        // Update the last message with the current streaming content
        setMessages(prev => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1] = {
            ...assistantMessage,
            content: displayedContent
          };
          return updatedMessages;
        });
      }
      
      // If this was the first message, update the title with streaming effect
      if (messages.length === 0) {
        const newTitle = input.length > 30 ? input.substring(0, 30) + "..." : input;
        streamConversationRename(currentConversation.id, newTitle);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("Request cancelled");
      } else {
        console.error("Error:", error);
        setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Error processing request." }]);
      }
    } finally {
      setLoading(false);
      setIsStreaming(false);
      setAbortController(null);
    }
  };

  // Add a new function for streaming conversation rename
  const streamConversationRename = async (id: string, newName: string) => {
    setIsTitleStreaming(true);
    
    // Simulate streaming for the title
    let displayedTitle = "";
    const titleUpdateInterval = 50; // ms between character additions
    
    for (let i = 0; i < newName.length; i++) {
      await new Promise(resolve => setTimeout(resolve, titleUpdateInterval));
      displayedTitle += newName[i];
      
      // Update the conversation title in real-time
      setConversations(
        conversations.map(c => c.id === id ? { ...c, title: displayedTitle } : c)
      );
      
      if (currentConversation?.id === id) {
        setCurrentConversation(prev => prev ? { ...prev, title: displayedTitle } : null);
      }
    }
    
    // After streaming is complete, update the actual title in the backend
    try {
      const updatedConversation = await apiService.updateConversation(id, { title: newName });
      if (currentConversation?.id === id) {
        setCurrentConversation(updatedConversation);
      }
    } catch (error) {
      console.error("Error updating conversation name:", error);
    } finally {
      setIsTitleStreaming(false);
    }
  };

  // Stop message generation
  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setIsAuthenticated(false);
      setUser(null);
      setCurrentConversation(null);
      setMessages([]);
      router.push('/login');
    }
  };

  if (!mounted) return null; // Prevents hydration errors

  // If not authenticated, don't render the chat UI
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#121212" }}>
      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} sx={{ '& .MuiPaper-root': { bgcolor: '#1E1E1E', color: 'white' } }}>
        <DialogTitle>Chat Settings</DialogTitle>
        <DialogContent>
          <FormControl fullWidth variant="outlined" sx={{ mt: 2, mb: 3 }}>
            <InputLabel id="model-label" sx={{ color: 'gray' }}>Model</InputLabel>
            <Select
              labelId="model-label"
              value={settings.model}
              onChange={(e: SelectChangeEvent) => setSettings({ ...settings, model: e.target.value })}
              label="Model"
              sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'gray' } }}
            >
              {availableModels.map((model) => (
                <MenuItem key={model} value={model}>{model}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography gutterBottom>Temperature: {settings.temperature}</Typography>
          <Slider
            value={settings.temperature}
            min={0}
            max={1}
            step={0.1}
            onChange={(_, newValue) => setSettings({ ...settings, temperature: newValue as number })}
            valueLabelDisplay="auto"
            sx={{ mb: 3 }}
          />
          
          <Typography gutterBottom>Context Length: {settings.contextLength}</Typography>
          <Slider
            value={settings.contextLength}
            min={1000}
            max={16000}
            step={1000}
            onChange={(_, newValue) => setSettings({ ...settings, contextLength: newValue as number })}
            valueLabelDisplay="auto"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)} sx={{ color: 'white' }}>Cancel</Button>
          <Button onClick={updateSettings} sx={{ color: 'white' }}>Save</Button>
        </DialogActions>
      </Dialog>
  
      {/* Mobile App Bar (only visible on small screens) */}
      <AppBar position="fixed" sx={{ 
        display: { xs: 'block', md: 'none' }, 
        bgcolor: '#1E1E1E',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            sx={{ mr: 2 }}
          >
            {/* Menu icon */}
            <span>☰</span>
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {currentConversation?.title || "ChatGPT Clone"}
          </Typography>
          <IconButton color="inherit" onClick={() => setSettingsOpen(true)}>
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
  
      {/* Responsive Sidebar Drawer */}
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
        <Toolbar sx={{ display: { xs: 'block', md: 'none' } }} /> {/* Spacer for mobile AppBar */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              ChatGPT Clone
            </Typography>
            <IconButton onClick={handleLogout} sx={{ color: 'white' }}>
              <LogoutIcon />
            </IconButton>
          </Box>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={createNewConversation}
            fullWidth
            sx={{ mb: 2, bgcolor: '#333', '&:hover': { bgcolor: '#444' } }}
          >
            New Chat
          </Button>
          
          <Divider sx={{ bgcolor: '#333', mb: 2 }} />
          
          <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
            Your Conversations
          </Typography>
          
          <List sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            {conversations.map(conversation => (
              <ListItem 
                key={conversation.id}
                disablePadding
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {editingConversationId === conversation.id ? (
                      <IconButton 
                        edge="end" 
                        onClick={(e) => {
                          e.stopPropagation();
                          updateConversationName(conversation.id, editConversationName);
                          setEditingConversationId(null);
                        }} 
                        sx={{ color: 'white', p: 0.5 }}
                        size="small"
                      >
                        <SendIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <>
                        <IconButton 
                          edge="end" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingConversationId(conversation.id);
                            setEditConversationName(conversation.title);
                          }} 
                          sx={{ color: 'white', p: 0.5, mr: 0.5 }}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                          }} 
                          sx={{ color: 'white', p: 0.5 }}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                }
              >
                <ListItemButton
                  onClick={() => {
                    if (editingConversationId !== conversation.id) {
                      selectConversation(conversation.id);
                    }
                  }}
                  selected={currentConversation?.id === conversation.id}
                  sx={{ 
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: currentConversation?.id === conversation.id ? '#333' : 'transparent',
                    '&:hover': { bgcolor: '#333' },
                    pr: 7 // Add padding to prevent text overlap with buttons
                  }}
                >
                  {editingConversationId === conversation.id ? (
                    <TextField
                      value={editConversationName}
                      onChange={(e) => setEditConversationName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      size="small"
                      fullWidth
                      sx={{ 
                        input: { color: 'white' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'gray' },
                        }
                      }}
                    />
                  ) : (
                    <ListItemText 
                      primary={conversation.title} 
                      primaryTypographyProps={{ 
                        noWrap: true,
                        style: { maxWidth: '150px' }
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
            {conversations.length === 0 && (
              <Typography variant="body2" sx={{ p: 1, opacity: 0.5, textAlign: 'center' }}>
                No conversations yet
              </Typography>
            )}
          </List>
        </Box>
      </Drawer>
  
      {/* Mobile Drawer (temporary, only for small screens) */}
      <Drawer
        variant="temporary"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
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
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              ChatGPT Clone
            </Typography>
            <IconButton onClick={handleLogout} sx={{ color: 'white' }}>
              <LogoutIcon />
            </IconButton>
          </Box>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={createNewConversation}
            fullWidth
            sx={{ mb: 2, bgcolor: '#333', '&:hover': { bgcolor: '#444' } }}
          >
            New Chat
          </Button>
          
          <Divider sx={{ bgcolor: '#333', mb: 2 }} />
          
          <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
            Your Conversations
          </Typography>
          
          <List sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            {conversations.map(conversation => (
              <ListItem 
                key={conversation.id}
                disablePadding
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {editingConversationId === conversation.id ? (
                      <IconButton 
                        edge="end" 
                        onClick={(e) => {
                          e.stopPropagation();
                          updateConversationName(conversation.id, editConversationName);
                          setEditingConversationId(null);
                        }} 
                        sx={{ color: 'white', p: 0.5 }}
                        size="small"
                      >
                        <SendIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <>
                        <IconButton 
                          edge="end" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingConversationId(conversation.id);
                            setEditConversationName(conversation.title);
                          }} 
                          sx={{ color: 'white', p: 0.5, mr: 0.5 }}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                          }} 
                          sx={{ color: 'white', p: 0.5 }}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                }
              >
                <ListItemButton
                  onClick={() => {
                    if (editingConversationId !== conversation.id) {
                      selectConversation(conversation.id);
                    }
                  }}
                  selected={currentConversation?.id === conversation.id}
                  sx={{ 
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: currentConversation?.id === conversation.id ? '#333' : 'transparent',
                    '&:hover': { bgcolor: '#333' },
                    pr: 7 // Add padding to prevent text overlap with buttons
                  }}
                >
                  {editingConversationId === conversation.id ? (
                    <TextField
                      value={editConversationName}
                      onChange={(e) => setEditConversationName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      size="small"
                      fullWidth
                      sx={{ 
                        input: { color: 'white' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'gray' },
                        }
                      }}
                    />
                  ) : (
                    <ListItemText 
                      primary={conversation.title} 
                      primaryTypographyProps={{
                        noWrap: true,
                        style: { maxWidth: '150px' }
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
  
      {/* Chat Section */}
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
        {/* Chat Header (only visible on larger screens) */}
        <Box sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid #333'
        }}>
          <Typography variant="h6">
            {currentConversation?.title || "New Chat"}
          </Typography>
          <Box>
            <IconButton onClick={() => setSettingsOpen(true)} sx={{ color: 'white' }}>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>
        
        {/* Empty State */}
        {(!currentConversation || messages.length === 0) && (
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
              {currentConversation ? 
                "Ask me anything..." : 
                "Start a new conversation or select one from the sidebar"}
            </Typography>
            {!currentConversation && (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={createNewConversation}
                sx={{ bgcolor: '#333', '&:hover': { bgcolor: '#444' } }}
              >
                New Chat
              </Button>
            )}
          </Box>
        )}
  
        {/* Messages Area */}
        {currentConversation && messages.length > 0 && (
          <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    maxWidth: "70%",
                    p: 2,
                    borderRadius: "12px",
                    bgcolor: msg.role === "user" ? "#007AFF" : "#333",
                    color: msg.role === "user" ? "white" : "#ddd",
                  }}
                >
                  {msg.content}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
        )}
  
        {/* Input Section */}
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            p: 1, 
            pb: 2,
            borderTop: "1px solid #333",
            marginTop: "auto", // Push to bottom
          }}
        >
          <Box 
            sx={{ 
              display: "flex", 
              bgcolor: "#1E1E1E", 
              borderRadius: "24px", 
              width: { xs: '95%', sm: '85%', md: '70%' },
              position: 'relative'
            }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={4}
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={!currentConversation || loading}
              sx={{
                bgcolor: "transparent",
                borderRadius: "24px",
                input: { color: "white", padding: "10px" },
                textarea: { color: "white", padding: "10px" },
                fieldset: { borderColor: "transparent" },
              }}
            />
            <IconButton 
              onClick={loading ? stopGeneration : sendMessage} 
              disabled={!currentConversation || (!loading && !input.trim())}
              sx={{ 
                ml: 1, 
                mr: 1,
                bgcolor: "transparent", 
                color: "white",
                alignSelf: 'center'
              }}
            >
              {loading ? 
                <StopIcon /> : 
                <SendIcon />
              }
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;