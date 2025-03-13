"use client"
import {
  Box,
  List,
  Typography,
  Button,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ConversationListItem from './ConversationListItem';
import { Conversation } from './types';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  editingConversationId: string | null;
  editConversationName: string;
  onCreateConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onStartEditingName: (id: string, name: string) => void;
  onSaveEditingName: (id: string, name: string) => void;
  onChangeEditName: (name: string) => void;
}

const ConversationList = ({
  conversations,
  currentConversation,
  editingConversationId,
  editConversationName,
  onCreateConversation,
  onSelectConversation,
  onDeleteConversation,
  onStartEditingName,
  onSaveEditingName,
  onChangeEditName
}: ConversationListProps) => {
  return (
    <Box sx={{ p: 2 }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreateConversation}
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
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            isSelected={currentConversation?.id === conversation.id}
            isEditing={editingConversationId === conversation.id}
            editName={editConversationName}
            onSelect={() => onSelectConversation(conversation.id)}
            onDelete={() => onDeleteConversation(conversation.id)}
            onEdit={() => onStartEditingName(conversation.id, conversation.title)}
            onSaveEdit={() => onSaveEditingName(conversation.id, editConversationName)}
            onChangeEditName={onChangeEditName}
          />
        ))}
        {conversations.length === 0 && (
          <Typography variant="body2" sx={{ p: 1, opacity: 0.5, textAlign: 'center' }}>
            No conversations yet
          </Typography>
        )}
      </List>
    </Box>
  );
};

export default ConversationList;