import { useState, useCallback } from 'react';
import apiService from '@/services/apiService';
import { Conversation, ChatSettings } from '../types';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editConversationName, setEditConversationName] = useState("");
  const [isTitleStreaming, setIsTitleStreaming] = useState<boolean>(false);
  
  // Load conversations
  const loadConversations = useCallback(async () => {
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
  }, [currentConversation]);

  // Select a conversation
  const selectConversation = useCallback(async (id: string) => {
    try {
      const conversation = await apiService.getConversation(id);
      setCurrentConversation(conversation);
      return conversation;
    } catch (error) {
      console.error("Error loading conversation:", error);
      return null;
    }
  }, []);

  // Create a new conversation
  const createConversation = useCallback(async (settings: ChatSettings) => {
    try {
      const newConversation = await apiService.createConversation(settings);
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      return newConversation;
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (id: string) => {
    try {
      await apiService.deleteConversation(id);
      const updatedConversations = conversations.filter(c => c.id !== id);
      setConversations(updatedConversations);
      
      if (currentConversation?.id === id) {
        if (updatedConversations.length > 0) {
          selectConversation(updatedConversations[0].id);
        } else {
          setCurrentConversation(null);
        }
      }
      return true;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      return false;
    }
  }, [conversations, currentConversation, selectConversation]);

  // Update conversation name
  const updateConversationName = useCallback(async (id: string, newName: string) => {
    try {
      const updatedConversation = await apiService.updateConversation(id, { title: newName });
      setConversations(
        conversations.map(c => c.id === id ? { ...c, title: newName } : c)
      );
      if (currentConversation?.id === id) {
        setCurrentConversation(updatedConversation);
      }
      return true;
    } catch (error) {
      console.error("Error updating conversation name:", error);
      return false;
    }
  }, [conversations, currentConversation]);

  // Stream conversation rename with typing effect
  const streamConversationRename = useCallback(async (id: string, newName: string) => {
    // Temporarily disabled streaming effect
    try {
      // Just update the name directly without streaming
      const updatedConversation = await apiService.updateConversation(id, { title: newName });
      
      // Update the conversations list
      setConversations(
        prev => prev.map(c => c.id === id ? updatedConversation : c)
      );
      
      // Update current conversation if it's the one being renamed
      if (currentConversation?.id === id) {
        setCurrentConversation(updatedConversation);
      }
    } catch (error) {
      console.error("Error updating conversation name:", error);
    }
  }, [currentConversation]);

  // Update conversation settings
  const updateConversationSettings = useCallback(async (id: string, settings: ChatSettings) => {
    try {
      const updatedConversation = await apiService.updateConversation(
        id, 
        { 
          model: settings.model, 
          temperature: settings.temperature, 
          context_length: settings.contextLength 
        }
      );
      setCurrentConversation(updatedConversation);
      return true;
    } catch (error) {
      console.error("Error updating settings:", error);
      return false;
    }
  }, []);

  return {
    conversations,
    currentConversation,
    editingConversationId,
    editConversationName,
    isTitleStreaming,
    setEditingConversationId,
    setEditConversationName,
    loadConversations,
    selectConversation,
    createConversation,
    deleteConversation,
    updateConversationName,
    streamConversationRename,
    updateConversationSettings
  };
};

export default useConversations;