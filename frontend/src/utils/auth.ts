import apiService from "@/services/apiService";

export const isAuthenticated = () => {
  if (typeof window === 'undefined') {
    return false; // We're on the server
  }
  
  const token = localStorage.getItem('token');
  return !!token;
};

export const login = (token: string, username: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
  apiService.setAuthToken(token);
};

export const logout = async () => {
  try {
    // Call logout API
    await apiService.logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear storage regardless of API success
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }
};

export const getUsername = () => {
  if (typeof window === 'undefined') {
    return null; // We're on the server
  }
  
  return localStorage.getItem('username');
};