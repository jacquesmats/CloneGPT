import axios from "axios";

// API configuration
const API_BASE_URL = "http://localhost:8000/api";
const API_CONVERSATIONS_URL = `${API_BASE_URL}/conversations/`;
const API_AUTH_URL = `${API_BASE_URL}/auth/`;

const apiService = {
  // Set token for all requests
  setAuthToken: (token: string) => {
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  },

  // Auth
  login: async (username: string, password: string) => {
    const response = await axios.post(`${API_AUTH_URL}login/`, { username, password });
    return response.data;
  },

  register: async (username: string, password: string, email: string) => {
    const response = await axios.post(`${API_AUTH_URL}register/`, { username, password, email });
    return response.data;
  },

  logout: async () => {
    return await axios.post(`${API_AUTH_URL}logout/`);
  },

  // Conversations
  getConversations: async () => {
    const response = await axios.get(API_CONVERSATIONS_URL);
    return response.data;
  },

  getConversation: async (id: string) => {
    const response = await axios.get(`${API_CONVERSATIONS_URL}${id}/`);
    return response.data;
  },

  createConversation: async (settings: {
    model: string;
    temperature: number;
    contextLength: number;
  }) => {
    const response = await axios.post(API_CONVERSATIONS_URL, {
      title: "New Conversation",
      model: settings.model,
      temperature: settings.temperature,
      context_length: settings.contextLength
    });
    return response.data;
  },

  updateConversation: async (id: string, data: any) => {
    const response = await axios.patch(`${API_CONVERSATIONS_URL}${id}/`, data);
    return response.data;
  },

  deleteConversation: async (id: string) => {
    return await axios.delete(`${API_CONVERSATIONS_URL}${id}/`);
  },

  // Messages
  addMessage: async (conversationId: string, message: string, deployment: string) => {
    const response = await axios.post(`${API_CONVERSATIONS_URL}${conversationId}/add_message/`, {
      role: "user",
      content: message,
      deployment: deployment
    });
    return response.data;
  }
};

export default apiService;