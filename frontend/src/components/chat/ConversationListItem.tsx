"use client"
import {
  Box,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  TextField
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Conversation } from './types';

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  isEditing: boolean;
  editName: string;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSaveEdit: () => void;
  onChangeEditName: (name: string) => void;
}

const ConversationListItem = ({
  conversation,
  isSelected,
  isEditing,
  editName,
  onSelect,
  onDelete,
  onEdit,
  onSaveEdit,
  onChangeEditName
}: ConversationListItemProps) => {
  
  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSaveEdit();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // Cancel editing without saving
      onChangeEditName(conversation.title);
      onSaveEdit();
    }
  };
  
  return (
    <ListItem
      disablePadding
      secondaryAction={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isEditing ? (
            <IconButton
              edge="end"
              onClick={handleSaveEdit}
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
                  onEdit();
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
                  onDelete();
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
          if (!isEditing) {
            onSelect();
          }
        }}
        selected={isSelected}
        sx={{
          borderRadius: 1,
          mb: 1,
          bgcolor: isSelected ? '#333' : 'transparent',
          '&:hover': { bgcolor: '#333' },
          pr: 7 // Add padding to prevent text overlap with buttons
        }}
      >
        {isEditing ? (
          <TextField
            value={editName}
            onChange={(e) => onChangeEditName(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
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
  );
};

export default ConversationListItem;