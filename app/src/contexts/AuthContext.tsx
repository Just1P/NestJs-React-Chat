import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService, User, AuthFormData } from "../services/authService";


interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (data: AuthFormData) => Promise<void>;
  signUp: (data: AuthFormData) => Promise<void>;
  signOut: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

 
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const token = authService.getToken();
      
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
          authService.removeToken();
          setError(error instanceof Error ? error : new Error("Erreur d'authentification"));
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);


  const signIn = useCallback(async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.signIn(data);
      setUser(response.user);
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Erreur de connexion"));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);


  const signUp = useCallback(async (data: AuthFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.signUp(data);
      setUser(response.user);
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Erreur d'inscription"));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);


  const signOut = useCallback(() => {
    authService.removeToken();
    setUser(null);
    setError(null);
  }, []);


  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        error, 
        signIn, 
        signUp, 
        signOut, 
        clearError 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};
