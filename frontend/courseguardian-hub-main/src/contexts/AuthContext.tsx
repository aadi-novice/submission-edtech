import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import Cookies from 'js-cookie';
import { User, AuthContextType } from '@/types/auth';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const initializeAuth = useCallback(async () => {
    const token = Cookies.get('access_token');
    if (token) {
      // Check if it's a demo token
      if (token === 'demo_token') {
        // Set demo user based on what was stored or default to admin
        const demoUser = {
          id: 1,
          email: 'admin@demo.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin' as const,
          createdAt: new Date().toISOString()
        };
        setUser(demoUser);
      } else {
        // Try to get real user data from API
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to get current user:', error);
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
        }
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Demo credentials for testing
    const demoCredentials = [
      {
        username: 'admin',
        password: 'admin123',
        user: {
          id: 1,
          email: 'admin@demo.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin' as const,
          createdAt: new Date().toISOString()
        }
      },
      {
        username: 'student',
        password: 'student123',
        user: {
          id: 2,
          email: 'student@demo.com',
          firstName: 'John',
          lastName: 'Student',
          role: 'student' as const,
          createdAt: new Date().toISOString()
        }
      }
    ];

    // Check for demo credentials first
    const demoUser = demoCredentials.find(
      cred => cred.username === username && cred.password === password
    );

    if (demoUser) {
      // Simulate demo login
      Cookies.set('access_token', 'demo_token', {
        expires: 1,
        secure: false, // Set to false for demo
        sameSite: 'lax'
      });
      
      Cookies.set('refresh_token', 'demo_refresh_token', {
        expires: 7,
        secure: false, // Set to false for demo
        sameSite: 'lax'
      });

      setUser(demoUser.user);
      toast.success(`Welcome ${demoUser.user.firstName}! (Demo Mode)`);
      return true;
    }

    // If not demo credentials, try real API (when backend is ready)
    try {
      // Django expects username, not email, for login
      const response = await authAPI.login(username, password);

      Cookies.set('access_token', response.access, {
        expires: 1,
        secure: import.meta.env.PROD,
        sameSite: 'strict'
      });

      Cookies.set('refresh_token', response.refresh, {
        expires: 7,
        secure: import.meta.env.PROD,
        sameSite: 'strict'
      });

      // Fetch user info after login
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      toast.success('Login successful!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail ||
                          error.response?.data?.message ||
                          error.message ||
                          'Invalid email or password. Try demo credentials: admin@demo.com/admin123 or student@demo.com/student123';
      toast.error(errorMessage);
      return false;
    }
  };

  // const register = async (userData: {
  //   email: string;
  //   password: string;
  //   firstName: string;
  //   lastName: string;
  //   role: 'admin' | 'student';
  // }): Promise<boolean> => {
  //   try {
  //     // Map frontend fields to Django backend fields
  //     const payload = {
  //       username: userData.email,
  //       email: userData.email,
  //       password: userData.password,
  //       first_name: userData.firstName,
  //       last_name: userData.lastName,
  //       role: userData.role,
  //     };
  //     await authAPI.register(payload);
  //     toast.success('Registration successful! Please login.');
  //     return true;
  //   } catch (error: any) {
  //     toast.error(error.response?.data?.message || 'Registration failed');
  //     return false;
  //   }
  // };

  

  const register = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<boolean> => {
  try {
    // Map frontend fields to Django backend fields
    const payload = {
      username: userData.email, // still needed because DRF User model uses username
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
    };
    await authAPI.register(payload);
    toast.success('Registration successful! Please login.');
    return true;
  } catch (error: any) {
    toast.error(
      error.response?.data?.message ||
      error.response?.data?.detail ||
      'Registration failed'
    );
    return false;
  }
};

  const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      await authAPI.forgotPassword(email);
      toast.success('Password reset email sent!');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    isAuthenticated: !!user && !loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
    );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};