import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, setAuthToken, removeAuthToken, ApiError } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/platform';

interface User {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  seller?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  loginWithOTP: (email: string, otp: string, role?: 'customer' | 'seller') => Promise<void>;
  sendOTP: (email: string, role?: 'customer' | 'seller') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await authApi.getMe();
        setUser(response.user);
      } catch (error) {
        // Token invalid, remove it
        removeAuthToken();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    try {
      const response = await authApi.login(email, password, role);
      setAuthToken(response.token);
      setUser(response.user);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Login failed');
    }
  };

  const sendOTP = async (email: string, role?: 'customer' | 'seller') => {
    try {
      await authApi.sendOTP(email, role);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Failed to send OTP');
    }
  };

  const loginWithOTP = async (email: string, otp: string, role?: 'customer' | 'seller') => {
    try {
      const response = await authApi.verifyOTP(email, otp, role);
      setAuthToken(response.token);
      setUser(response.user);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('OTP verification failed');
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    navigate('/');
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithOTP,
        sendOTP,
        logout,
        isAuthenticated: !!user,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

