import { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../lib/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and validate with server
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await apiService.getCurrentUser();
          if (response.success && response.data.user) {
            setUser(response.data.user);
            setSession({ user: response.data.user, token });
          } else {
            // Token invalid, remove it
            apiService.logout();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          apiService.logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signUp = async (email, password, firstName, lastName) => {
    try {
      const response = await apiService.register({ email, password, firstName, lastName });
      
      if (response.success && response.data.user && response.data.token) {
        setUser(response.data.user);
        setSession({ user: response.data.user, token: response.data.token });
      }
      
      return { error: null };
    } catch (error) {
      return { error: error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data.user && response.data.token) {
        setUser(response.data.user);
        setSession({ user: response.data.user, token: response.data.token });
      }
      
      return { error: null };
    } catch (error) {
      return { error: error };
    }
  };

  const signOut = async () => {
    apiService.logout();
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (userData) => {
    try {
      const response = await apiService.updateProfile(userData);
      
      if (response.success && response.data.user) {
        setUser(response.data.user);
        if (session) {
          setSession({ ...session, user: response.data.user });
        }
      }
      
      return { error: null };
    } catch (error) {
      return { error: error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
