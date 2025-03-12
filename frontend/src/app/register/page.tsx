"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Box, 
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Container,
  Alert
} from "@mui/material";
import apiService from "@/services/apiService";

const Register = () => {
  const router = useRouter();
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const { username, password, email } = registerForm;
      const data = await apiService.register(username, password, email);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);
      apiService.setAuthToken(data.token);
      
      router.push('/chat');
    } catch (error) {
      console.error("Registration failed:", error);
      setError("Registration failed. Please try a different username or check your information.");
    } finally {
      setLoading(false);
    }
  };

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
            Create Account
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2, bgcolor: '#3A1515', color: 'white' }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={registerForm.username}
              onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
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
              autoComplete="new-password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
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
              {loading ? "Creating Account..." : "Register"}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link 
                href="/login" 
                variant="body2"
                sx={{ color: '#90CAF9', textDecoration: 'none' }}
              >
                {"Already have an account? Log In"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;