"use client"
import { useRouter } from "next/navigation";
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper,
  Grid,
  Stack,
  useMediaQuery,
  useTheme
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import SpeedIcon from "@mui/icons-material/Speed";

const LandingPage = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #121212 0%, #1E1E1E 100%)',
      color: 'white',
    }}>
      {/* Hero Section */}
      <Box sx={{ 
        pt: { xs: 8, md: 12 }, 
        pb: { xs: 10, md: 16 },
        position: 'relative'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  fontWeight="bold"
                  sx={{ 
                    mb: 2,
                    background: 'linear-gradient(90deg, #90CAF9 0%, #536DFE 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0px 4px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  ChatGPT Clone
                </Typography>
                <Typography 
                  variant="h5" 
                  component="h2" 
                  sx={{ 
                    mb: 4, 
                    color: '#CCCCCC',
                    fontWeight: 300,
                    lineHeight: 1.5
                  }}
                >
                  Experience the power of conversational AI in your own custom interface.
                </Typography>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2}
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                >
                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={() => router.push('/login')}
                    sx={{ 
                      py: 1.5, 
                      px: 4, 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      background: 'linear-gradient(90deg, #536DFE 0%, #90CAF9 100%)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #3F51B5 0%, #536DFE 100%)',
                      }
                    }}
                  >
                    Log In
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    onClick={() => router.push('/register')}
                    sx={{ 
                      py: 1.5, 
                      px: 4, 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      borderColor: '#90CAF9',
                      color: '#90CAF9',
                      '&:hover': {
                        borderColor: '#FFFFFF',
                        color: '#FFFFFF',
                      }
                    }}
                  >
                    Register
                  </Button>
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper 
                elevation={24}
                sx={{ 
                  width: { xs: '90%', md: '100%' },
                  maxWidth: '500px',
                  height: { xs: '300px', md: '400px' },
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #333',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ 
                  borderBottom: '1px solid #333',
                  pb: 1,
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="h6" sx={{ color: '#CCCCCC' }}>
                    Chat Interface
                  </Typography>
                  <SmartToyOutlinedIcon sx={{ color: '#536DFE' }} />
                </Box>
                <Box sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  overflowY: 'auto'
                }}>
                  <Box sx={{ 
                    alignSelf: 'flex-start',
                    maxWidth: '80%',
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: '#333',
                    color: '#FFFFFF'
                  }}>
                    Hello! How can I assist you today?
                  </Box>
                  <Box sx={{ 
                    alignSelf: 'flex-end',
                    maxWidth: '80%',
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: '#536DFE',
                    color: '#FFFFFF'
                  }}>
                    Can you help me understand how this chat interface works?
                  </Box>
                  <Box sx={{ 
                    alignSelf: 'flex-start',
                    maxWidth: '80%',
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: '#333',
                    color: '#FFFFFF'
                  }}>
                    Certainly! This is a custom ChatGPT-like interface where you can have conversational interactions. You can ask questions, request information, or have general discussions. I'm here to help with various topics!
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ 
        py: { xs: 6, md: 10 },
        background: 'linear-gradient(0deg, #0A0A0A 0%, #121212 100%)',
      }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h4" 
            component="h2" 
            align="center"
            fontWeight="bold"
            sx={{ mb: 6 }}
          >
            Key Features
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ 
                p: 4, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: '#1A1A1A',
                borderRadius: 4,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                }
              }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 60, color: '#536DFE', mb: 2 }} />
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Natural Conversations
                </Typography>
                <Typography variant="body1" align="center" sx={{ color: '#AAAAAA' }}>
                  Engage in fluid, natural conversations with our advanced AI chat interface.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ 
                p: 4, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: '#1A1A1A',
                borderRadius: 4,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                }
              }}>
                <SmartToyOutlinedIcon sx={{ fontSize: 60, color: '#536DFE', mb: 2 }} />
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Multiple Models
                </Typography>
                <Typography variant="body1" align="center" sx={{ color: '#AAAAAA' }}>
                  Choose from various AI models to best suit your specific needs.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ 
                p: 4, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: '#1A1A1A',
                borderRadius: 4,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                }
              }}>
                <SpeedIcon sx={{ fontSize: 60, color: '#536DFE', mb: 2 }} />
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Fast Responses
                </Typography>
                <Typography variant="body1" align="center" sx={{ color: '#AAAAAA' }}>
                  Get quick, accurate responses to your questions in real-time.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        py: 3,
        bgcolor: '#0A0A0A',
        borderTop: '1px solid #333'
      }}>
        <Container>
          <Typography variant="body2" align="center" sx={{ color: '#777777' }}>
            © {new Date().getFullYear()} ChatGPT Clone. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;