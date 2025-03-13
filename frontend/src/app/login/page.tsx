"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Box, 
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Container,
  Alert,
  CircularProgress
} from "@mui/material";
import apiService from "@/services/apiService";

const Login = () => {
  const router = useRouter();
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false); // Add this line

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const { username, password } = loginForm;
      const data = await apiService.login(username, password);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);
      apiService.setAuthToken(data.token);
      
      router.push('/chat');
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Return loading state until client-side code has executed
  if (!mounted) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: '#121212'
      }}>
        <CircularProgress sx={{ color: '#536DFE' }} />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            bgcolor: '#1E1E1E',
            color: 'white',
            borderRadius: 2
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
            ChatGPT Clone
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2, bgcolor: '#3A1515', color: 'white' }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              sx={{ 
                mb: 2, 
                input: { color: 'white' }, 
                '& label': { color: 'gray' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'gray' },
                  '&:hover fieldset': { borderColor: 'white' },
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              sx={{ 
                mb: 3, 
                input: { color: 'white' }, 
                '& label': { color: 'gray' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'gray' },
                  '&:hover fieldset': { borderColor: 'white' },
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 2, 
                mb: 2, 
                py: 1.5,
                bgcolor: '#333', 
                '&:hover': { bgcolor: '#444' } 
              }}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link 
                href="/register" 
                variant="body2"
                sx={{ color: '#90CAF9', textDecoration: 'none' }}
              >
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;