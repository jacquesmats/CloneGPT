"use client"
import { 
  Box,
  TextField,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  onSend: () => void;
  onStop: () => void;
  loading: boolean;
  disabled: boolean;
}

const ChatInput = ({
  input,
  setInput,
  onSend,
  onStop,
  loading,
  disabled
}: ChatInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 1,
        pb: 2,
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
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          sx={{
            bgcolor: "transparent",
            borderRadius: "24px",
            input: { color: "white", padding: "10px" },
            textarea: { color: "white", padding: "10px" },
            fieldset: { borderColor: "transparent" },
          }}
        />
        <IconButton
          onClick={loading ? onStop : onSend}
          disabled={disabled || (!loading && !input.trim())}
          sx={{
            ml: 1,
            mr: 1,
            bgcolor: "transparent",
            color: "white",
            alignSelf: 'center'
          }}
        >
          {loading ? <StopIcon /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatInput;