import { useState, useRef, useCallback } from 'react';
import apiService from '@/services/apiService';
import { Message, Conversation, ChatSettings } from '../types';

export const useMessages = (
  currentConversation: Conversation | null,
  streamConversationRename: (id: string, newName: string) => Promise<void>
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set messages from conversation
  const setMessagesFromConversation = useCallback((conversation: Conversation | null) => {
    if (conversation && conversation.messages) {
      setMessages(conversation.messages);
    } else {
      setMessages([]);
    }
  }, []);

  // Send a message and get response with simulated streaming
  const sendMessage = useCallback(async (settings: ChatSettings) => {
    if (!input.trim() || !currentConversation) return;
    
    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    
    // Create new AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      // First get the complete response
      const response = await apiService.addMessage(
        currentConversation.id, 
        input, 
        settings.model,
        settings.temperature
      );
      const assistantMessage = response.assistant_message || { role: "assistant", content: "No response received" };
      
      // Then simulate streaming by adding the message with empty content
      setMessages(prev => [...prev, { ...assistantMessage, content: "" }]);
      setIsStreaming(true);
      
      // Simulate streaming by revealing one character at a time
      const fullContent = assistantMessage.content;
      let displayedContent = "";
      const charUpdateInterval = 10; // ms between character additions
      
      for (let i = 0; i < fullContent.length; i++) {
        if (controller.signal.aborted) break;
        
        await new Promise(resolve => setTimeout(resolve, charUpdateInterval));
        displayedContent += fullContent[i];
        
        // Update the last message with the current streaming content
        setMessages(prev => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1] = {
            ...assistantMessage,
            content: displayedContent
          };
          return updatedMessages;
        });
      }
      
      // If this was the first message, update the title with streaming effect
      if (messages.length === 0 && currentConversation) {
        const newTitle = input.length > 30 ? input.substring(0, 30) + "..." : input;
        streamConversationRename(currentConversation.id, newTitle);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("Request cancelled");
      } else {
        console.error("Error:", error);
        setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Error processing request." }]);
      }
    } finally {
      setLoading(false);
      setIsStreaming(false);
      setAbortController(null);
    }
  }, [input, currentConversation, messages.length, streamConversationRename]);

  // Stop message generation
  const stopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setLoading(false);
    }
  }, [abortController]);

  return {
    messages,
    input,
    loading,
    isStreaming,
    messagesEndRef,
    setInput,
    setMessagesFromConversation,
    sendMessage,
    stopGeneration
  };
};

export default useMessages;