"use client"
import { useRouter } from "next/navigation";
import { 
  Box, 
  Typography, 
  Button, 
  Container
} from "@mui/material";

const LandingPage = () => {
  const router = useRouter();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #121212 0%, #1E1E1E 100%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Container maxWidth="md">
        <Box sx={{ 
          textAlign: 'center',
          py: 8
        }}>
          <Typography 
            variant="h2" 
            component="h1" 
            fontWeight="bold"
            sx={{ 
              mb: 4,
              background: 'linear-gradient(90deg, #90CAF9 0%, #536DFE 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            ChatGPT Clone
          </Typography>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              mb: 6, 
              color: '#CCCCCC',
              fontWeight: 300
            }}
          >
            Experience the power of conversational AI
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => router.push('/chat')}
            sx={{ 
              py: 1.5, 
              px: 4, 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              background: 'linear-gradient(90deg, #536DFE 0%, #90CAF9 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #3F51B5 0%, #536DFE 100%)',
              }
            }}
          >
            Get Started
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;