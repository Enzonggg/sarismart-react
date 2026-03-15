import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Create demo user if no users exist
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.length === 0) {
      const demoUser = {
        id: "demo-user",
        name: "Demo User",
        email: "demo@example.com",
        password: "demo123",
      };
      localStorage.setItem("users", JSON.stringify([demoUser]));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const foundUser = users.find(
      (u: any) => u.email === email && u.password === password
    );

    if (foundUser) {
      const userWithoutPassword = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
      };
      setUser(userWithoutPassword);
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    // Get existing users
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      return false;
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // Note: In production, never store passwords in plain text!
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Auto login after signup
    const userWithoutPassword = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };
    setUser(userWithoutPassword);
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};