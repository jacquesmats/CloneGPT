import axios from "axios";

/**
 * Base URL for the backend API
 */
const API_BASE_URL = "http://localhost:8000/api";

/**
 * URL for conversation-related endpoints
 */
const API_CONVERSATIONS_URL = `${API_BASE_URL}/conversations/`;

/**
 * URL for authentication-related endpoints
 */
const API_AUTH_URL = `${API_BASE_URL}/auth/`;

/**
 * API service for handling all HTTP requests to the backend.
 *
 * This service provides methods for authentication, conversation management,
 * and message handling. It uses axios for HTTP requests and handles
 * authentication tokens.
 */
const apiService = {
  /**
   * Set the authentication token for all subsequent API requests.
   *
   * @param {string} token - The authentication token
   */
  setAuthToken: (token: string) => {
    axios.defaults.headers.common["Authorization"] = `Token ${token}`;
  },

  /**
   * Authenticate a user and get a token.
   *
   * @param {string} username - The user's username
   * @param {string} password - The user's password
   * @returns {Promise<any>} The response data containing user info and token
   */
  login: async (username: string, password: string) => {
    const response = await axios.post(`${API_AUTH_URL}login/`, {
      username,
      password,
    });
    return response.data;
  },

  /**
   * Register a new user account.
   *
   * @param {string} username - The desired username
   * @param {string} password - The desired password
   * @param {string} email - The user's email address
   * @returns {Promise<any>} The response data containing user info and token
   */
  register: async (username: string, password: string, email: string) => {
    const response = await axios.post(`${API_AUTH_URL}register/`, {
      username,
      password,
      email,
    });
    return response.data;
  },

  /**
   * Log out the current user by invalidating their token.
   *
   * @returns {Promise<any>} The response data
   */
  logout: async () => {
    return await axios.post(`${API_AUTH_URL}logout/`);
  },

  /**
   * Get all conversations for the authenticated user.
   *
   * @returns {Promise<any>} The response data containing the list of conversations
   */
  getConversations: async () => {
    const response = await axios.get(API_CONVERSATIONS_URL);
    return response.data;
  },

  /**
   * Get a specific conversation by ID.
   *
   * @param {string} id - The conversation ID
   * @returns {Promise<any>} The response data containing the conversation details
   */
  getConversation: async (id: string) => {
    const response = await axios.get(`${API_CONVERSATIONS_URL}${id}/`);
    return response.data;
  },

  /**
   * Create a new conversation with the specified settings.
   *
   * @param {Object} settings - The conversation settings
   * @param {string} settings.model - The AI model to use
   * @param {number} settings.temperature - The temperature setting for generation
   * @param {number} settings.contextLength - The context length for the conversation
   * @returns {Promise<any>} The response data containing the created conversation
   */
  createConversation: async (settings: {
    model: string;
    temperature: number;
    contextLength: number;
  }) => {
    const response = await axios.post(API_CONVERSATIONS_URL, {
      title: "New Conversation",
      model: settings.model,
      temperature: settings.temperature,
      context_length: settings.contextLength,
    });
    return response.data;
  },

  /**
   * Update an existing conversation.
   *
   * @param {string} id - The conversation ID
   * @param {any} data - The data to update
   * @returns {Promise<any>} The response data containing the updated conversation
   */
  updateConversation: async (id: string, data: any) => {
    const response = await axios.patch(`${API_CONVERSATIONS_URL}${id}/`, data);
    return response.data;
  },

  /**
   * Delete a conversation.
   *
   * @param {string} id - The conversation ID
   * @returns {Promise<any>} The response data
   */
  deleteConversation: async (id: string) => {
    return await axios.delete(`${API_CONVERSATIONS_URL}${id}/`);
  },

  /**
   * Add a new message to a conversation and get an AI response.
   *
   * @param {string} conversationId - The conversation ID
   * @param {string} message - The message content
   * @param {string} model - The AI model to use
   * @param {number} temperature - The temperature setting for generation
   * @returns {Promise<any>} The response data containing both user and AI messages
   */
  addMessage: async (
    conversationId: string,
    message: string,
    model: string,
    temperature: number
  ) => {
    const response = await axios.post(
      `${API_CONVERSATIONS_URL}${conversationId}/add_message/`,
      {
        role: "user",
        content: message,
        model: model,
        temperature: temperature,
      }
    );
    return response.data;
  },
};

export default apiService;
