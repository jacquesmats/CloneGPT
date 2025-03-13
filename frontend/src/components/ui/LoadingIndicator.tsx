"use client"
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingIndicatorProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingIndicator = ({ 
  message = "Loading...", 
  fullScreen = false 
}: LoadingIndicatorProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: fullScreen ? '100vh' : '100%',
        width: '100%',
        bgcolor: '#121212',
        p: 3
      }}
    >
      <CircularProgress sx={{ color: '#536DFE', mb: 2 }} />
      {message && (
        <Typography variant="body1" sx={{ color: '#999' }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingIndicator;