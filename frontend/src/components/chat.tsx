"use client"
import { useEffect, useState, useRef } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  IconButton,
  List,
  ListItem,
  ListItemText,
  Drawer,
  AppBar,
  Toolbar,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import StopIcon from "@mui/icons-material/Stop";
import axios from "axios";

// API configuration
const API_BASE_URL = "http://localhost:8000/api";
const API_CONVERSATIONS_URL = `${API_BASE_URL}/conversations/`;
const API_AUTH_URL = `${API_BASE_URL}/auth/`;

// Types
interface Message {
  id?: string;
  role: string;
  content: string;
  created_at?: string;
}

interface Conversation {
  id: string;
  name: string;
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

// API Service
const apiService = {
  // Set token for all requests
  setAuthToken: (token: string) => {
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  },

  // Auth
  login: async (username: string, password: string) => {
    const response = await axios.post(`${API_AUTH_URL}login/`, { username, password });
    return response.data;
  },

  register: async (username: string, password: string, email: string) => {
    const response = await axios.post(`${API_AUTH_URL}register/`, { username, password, email });
    return response.data;
  },

  logout: async () => {
    return await axios.post(`${API_AUTH_URL}logout/`);
  },

  // Conversations
  getConversations: async () => {
    const response = await axios.get(API_CONVERSATIONS_URL);
    return response.data;
  },

  getConversation: async (id: string) => {
    const response = await axios.get(`${API_CONVERSATIONS_URL}${id}/`);
    return response.data;
  },

  createConversation: async (settings: ChatSettings) => {
    const response = await axios.post(API_CONVERSATIONS_URL, {
      name: "New Conversation",
      model: settings.model,
      temperature: settings.temperature,
      context_length: settings.contextLength
    });
    return response.data;
  },

  updateConversation: async (id: string, data: Partial<Conversation>) => {
    const response = await axios.patch(`${API_CONVERSATIONS_URL}${id}/`, data);
    return response.data;
  },

  deleteConversation: async (id: string) => {
    return await axios.delete(`${API_CONVERSATIONS_URL}${id}/`);
  },

  // Messages
  addMessage: async (conversationId: string, message: string, deployment: string) => {
    const response = await axios.post(`${API_CONVERSATIONS_URL}${conversationId}/add_message/`, {
      role: "user",
      content: message,
      deployment: deployment
    });
    return response.data;
  }
};

// Main Chat Component
const Chat = () => {
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
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', email: '' });
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
      setLoginDialogOpen(true);
    }
  }, []);

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
        model: conversation.model,
        temperature: conversation.temperature,
        contextLength: conversation.context_length
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
      setConversations([...conversations, newConversation]);
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
      const updatedConversation = await apiService.updateConversation(id, { name: newName });
      setConversations(
        conversations.map(c => c.id === id ? { ...c, name: newName } : c)
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

  // Send a message
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
      const response = await apiService.addMessage(currentConversation.id, input, settings.model);
      const assistantMessage = response.assistant_message || { role: "assistant", content: "No response received" };
      setMessages(prev => [...prev, assistantMessage]);
      
      // If this was the first message in a new conversation, refresh conversations to get updated title
      if (messages.length === 0) {
        loadConversations();
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request cancelled");
      } else {
        console.error("Error:", error);
        setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Error processing request." }]);
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  // Stop message generation
  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = async () => {
    try {
      const { username, password } = loginForm;
      const data = await apiService.login(username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);
      apiService.setAuthToken(data.token);
      setIsAuthenticated(true);
      setUser({ username });
      setLoginDialogOpen(false);
      loadConversations();
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  // Handle register
  const handleRegister = async () => {
    try {
      const { username, password, email } = registerForm;
      const data = await apiService.register(username, password, email);
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);
      apiService.setAuthToken(data.token);
      setIsAuthenticated(true);
      setUser({ username });
      setRegisterDialogOpen(false);
      loadConversations();
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try a different username or check your information.");
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
      setLoginDialogOpen(true);
    }
  };

  if (!mounted) return null; // Prevents hydration errors

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#121212" }}>
      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onClose={() => {}} sx={{ '& .MuiPaper-root': { bgcolor: '#1E1E1E', color: 'white' } }}>
        <DialogTitle>Log In</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            variant="outlined"
            value={loginForm.username}
            onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
            sx={{ mb: 2, input: { color: 'white' }, '& label': { color: 'gray' } }}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            sx={{ mb: 2, input: { color: 'white' }, '& label': { color: 'gray' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setLoginDialogOpen(false);
              setRegisterDialogOpen(true);
            }} 
            sx={{ color: 'white' }}
          >
            Register Instead
          </Button>
          <Button onClick={handleLogin} sx={{ color: 'white' }}>Log In</Button>
        </DialogActions>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={registerDialogOpen} onClose={() => {}} sx={{ '& .MuiPaper-root': { bgcolor: '#1E1E1E', color: 'white' } }}>
        <DialogTitle>Register</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            variant="outlined"
            value={registerForm.username}
            onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
            sx={{ mb: 2, input: { color: 'white' }, '& label': { color: 'gray' } }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={registerForm.email}
            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
            sx={{ mb: 2, input: { color: 'white' }, '& label': { color: 'gray' } }}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={registerForm.password}
            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
            sx={{ mb: 2, input: { color: 'white' }, '& label': { color: 'gray' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setRegisterDialogOpen(false);
              setLoginDialogOpen(true);
            }} 
            sx={{ color: 'white' }}
          >
            Log In Instead
          </Button>
          <Button onClick={handleRegister} sx={{ color: 'white' }}>Register</Button>
        </DialogActions>
      </Dialog>

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
            {currentConversation?.name || "ChatGPT Clone"}
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
                button 
                selected={currentConversation?.id === conversation.id}
                onClick={() => selectConversation(conversation.id)}
                sx={{ 
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: currentConversation?.id === conversation.id ? '#333' : 'transparent',
                  '&:hover': { bgcolor: '#333' },
                }}
                secondaryAction={
                  <IconButton edge="end" onClick={() => deleteConversation(conversation.id)} sx={{ color: 'white' }}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={conversation.title} 
                  primaryTypographyProps={{ 
                    noWrap: true,
                    style: { maxWidth: '150px' }
                  }}
                />
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
          
          <List>
            {conversations.map(conversation => (
              <ListItem 
                key={conversation.id}
                button 
                selected={currentConversation?.id === conversation.id}
                onClick={() => selectConversation(conversation.id)}
                sx={{ 
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: currentConversation?.id === conversation.id ? '#333' : 'transparent',
                  '&:hover': { bgcolor: '#333' },
                }}
                secondaryAction={
                  <IconButton edge="end" onClick={() => deleteConversation(conversation.id)} sx={{ color: 'white' }}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={conversation.title} 
                  primaryTypographyProps={{
                    noWrap: true,
                    style: { maxWidth: '150px' }
                  }}
                />
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
            {currentConversation?.name || "New Chat"}
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
              {isAuthenticated ? 
                currentConversation ? 
                  "Ask me anything..." : 
                  "Start a new conversation or select one from the sidebar" : 
                "Please log in to start chatting"}
            </Typography>
            {isAuthenticated && !currentConversation && (
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
              disabled={!isAuthenticated || !currentConversation || loading}
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
              disabled={!isAuthenticated || !currentConversation || (!loading && !input.trim())}
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