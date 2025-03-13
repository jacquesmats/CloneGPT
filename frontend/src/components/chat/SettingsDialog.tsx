"use client"
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Slider,
  SelectChangeEvent
} from '@mui/material';
import { ChatSettings, Conversation } from './types';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (settings: ChatSettings) => Promise<void>;
  currentConversation: Conversation | null;
  initialSettings: ChatSettings;
}

const SettingsDialog = ({
  open,
  onClose,
  onSave,
  currentConversation,
  initialSettings
}: SettingsDialogProps) => {
  const [settings, setSettings] = useState<ChatSettings>(initialSettings);
  const [availableModels] = useState<string[]>([
    'gpt-4o',
    'gpt-4o-mini'
  ]);

  // Update settings when conversation changes
  useEffect(() => {
    if (currentConversation) {
      setSettings({
        model: currentConversation.model || initialSettings.model,
        temperature: currentConversation.temperature || initialSettings.temperature,
        contextLength: currentConversation.context_length || initialSettings.contextLength
      });
    }
  }, [currentConversation, initialSettings]);

  const handleSave = async () => {
    await onSave(settings);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      sx={{ '& .MuiPaper-root': { bgcolor: '#1E1E1E', color: 'white' } }}
    >
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
        
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: 'white' }}>Cancel</Button>
        <Button onClick={handleSave} sx={{ color: 'white' }}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;