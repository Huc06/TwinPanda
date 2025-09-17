"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useToast } from "@/hooks/use-toast";

export type UserRole = "user" | "shop" | "admin";

export interface UserProfile {
  address: string;
  role: UserRole;
  name?: string;
  email?: string;
  createdAt: Date;
  lastLogin: Date;
  isVerified: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { toast } = useToast();

  const isAuthenticated = !!user && isConnected;

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("pawnshop_user");
    if (savedUser && isConnected) {
      try {
        const userData = JSON.parse(savedUser);
        if (userData.address === address) {
          setUser({
            ...userData,
            createdAt: new Date(userData.createdAt),
            lastLogin: new Date(userData.lastLogin),
          });
        } else {
          localStorage.removeItem("pawnshop_user");
        }
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        localStorage.removeItem("pawnshop_user");
      }
    }
    setIsLoading(false);
  }, [address, isConnected]);

  // Auto logout when wallet disconnects
  useEffect(() => {
    if (!isConnected && user) {
      logout();
    }
  }, [isConnected, user]);

  const login = async () => {
    if (!address || !isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create a message to sign for authentication
      const message = `Welcome to PawnShop!\n\nSign this message to authenticate your account.\n\nAddress: ${address}\nTimestamp: ${Date.now()}`;

      // Sign the message
      await signMessageAsync({ message });

      // In a real app, you would verify the signature on your backend
      // For now, we'll create a user profile locally
      const newUser: UserProfile = {
        address,
        role: "user", // Default role, can be upgraded through admin panel
        createdAt: new Date(),
        lastLogin: new Date(),
        isVerified: true,
      };

      // Check if this is a shop owner (you can implement your own logic here)
      // For demo purposes, certain addresses could be pre-configured as shops
      const shopAddresses: string[] = [
        // Add shop owner addresses here
      ];

      if (shopAddresses.includes(address.toLowerCase())) {
        newUser.role = "shop";
      }

      setUser(newUser);
      localStorage.setItem("pawnshop_user", JSON.stringify(newUser));

      toast({
        title: "Authentication Successful",
        description: `Welcome to PawnShop! Role: ${newUser.role}`,
      });
    } catch (error: any) {
      console.error("Authentication failed:", error);
      toast({
        title: "Authentication Failed",
        description: error.message || "Failed to sign message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pawnshop_user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const updateProfile = (profileUpdates: Partial<UserProfile>) => {
    if (!user) return;

    const updatedUser = { ...user, ...profileUpdates };
    setUser(updatedUser);
    localStorage.setItem("pawnshop_user", JSON.stringify(updatedUser));
  };

  const hasRole = (roles: UserRole | UserRole[]) => {
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role) || user.role === "admin";
  };

  // Auto-authenticate when wallet connects (if not already authenticated)
  useEffect(() => {
    if (isConnected && address && !user && !isLoading) {
      // Small delay to ensure wallet is fully connected
      const timer = setTimeout(() => {
        login();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, address, user, isLoading]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
