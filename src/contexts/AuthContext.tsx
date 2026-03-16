import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService } from '../lib/api';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  session: { user: User; token: string } | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (userData: { firstName?: string; lastName?: string }) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ user: User; token: string } | null>(null);
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

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const response = await apiService.register({ email, password, firstName, lastName });
      
      if (response.success && response.data.user && response.data.token) {
        setUser(response.data.user);
        setSession({ user: response.data.user, token: response.data.token });
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data.user && response.data.token) {
        setUser(response.data.user);
        setSession({ user: response.data.user, token: response.data.token });
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    apiService.logout();
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (userData: { firstName?: string; lastName?: string }) => {
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
      return { error: error as Error };
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
