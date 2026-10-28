import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { AuthUser, UserRole } from '@sbyte/shared-types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrPhone: string, pass: string) => Promise<void>;
  register: (payload: { fullName: string; phone: string; email?: string; password: string }) => Promise<void>;
  loginDemoCustomer: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const storedToken = await api.getStoredToken();
      const storedUser = await api.getStoredUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (e) {
      console.warn('Session restoration failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (emailOrPhone: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(emailOrPhone, pass);
      setUser(res.user);
      setToken(res.tokens.accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: { fullName: string; phone: string; email?: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      setUser(res.user);
      setToken(res.tokens.accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemoCustomer = async () => {
    setIsLoading(true);
    try {
      // Try live server login with seeded customer
      const res = await api.login('+919876543210', 'Password@123');
      setUser(res.user);
      setToken(res.tokens.accessToken);
    } catch {
      // Local fallback customer session
      const fallbackUser: AuthUser = {
        id: 'cust-demo-1',
        fullName: 'Karthik Raja',
        email: 'karthik@sbyte.in',
        phone: '+919876543210',
        role: UserRole.CUSTOMER,
      };
      const mockToken = 'mock-demo-jwt-token';
      await api.saveSession(mockToken, 'mock-refresh-token', fallbackUser);
      setUser(fallbackUser);
      setToken(mockToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } finally {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profile = await api.getProfile();
      if (profile) setUser(profile);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        loginDemoCustomer,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
