import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/services/apiService';
import { User } from '../types';

export const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        apiService.setAuthToken(token);
        setIsAuthenticated(true);
        setUser({ username: localStorage.getItem('username') || 'User' });
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setIsAuthenticated(false);
      setUser(null);
      router.push('/login');
    }
  };

  return {
    isAuthenticated,
    user,
    loading,
    logout
  };
};

export default useAuth;