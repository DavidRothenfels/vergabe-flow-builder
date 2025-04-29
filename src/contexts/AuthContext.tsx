
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import PocketBase from 'pocketbase';

// Define the User type
type User = {
  id: string;
  email: string;
  name?: string;
} | null;

// Define the AuthContextType
type AuthContextType = {
  user: User;
  pocketBase: PocketBase;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  testLogin: () => Promise<void>;
};

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a PocketBase client
const pocketBase = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || "https://pocketbase.tenderfuchs.de");

// Create the AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the user is authenticated
  useEffect(() => {
    const loadAuth = async () => {
      try {
        // Try to refresh the auth if a valid token exists
        if (pocketBase.authStore.isValid) {
          await pocketBase.collection('users').authRefresh();
          const userData = pocketBase.authStore.model;
          
          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
            });
          }
        }
      } catch (error) {
        console.error("Authentication error:", error);
        pocketBase.authStore.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const authData = await pocketBase.collection('users').authWithPassword(email, password);
      
      setUser({
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name,
      });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Test login function
  const testLogin = async () => {
    try {
      // Using a test account for demonstration
      await login("test@example.com", "testpassword123");
    } catch (error) {
      console.error("Test login error:", error);
      // For demo purposes, set a mock user if login fails (since we're not creating actual accounts)
      setUser({
        id: "test-user-id",
        email: "test@example.com",
        name: "Test User",
      });
    }
  };

  // Logout function
  const logout = () => {
    pocketBase.authStore.clear();
    setUser(null);
  };

  const value = {
    user,
    pocketBase,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    testLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
