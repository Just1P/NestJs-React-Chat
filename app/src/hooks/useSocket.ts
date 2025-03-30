import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { User } from '../services/authService';

interface UseSocketOptions {
  serverUrl: string;
  user: User | null;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}


export function useSocket({
  serverUrl,
  user,
  onConnect,
  onDisconnect,
  onError
}: UseSocketOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const registerUser = useCallback(() => {
    if (socket && user && user.id) {
      socket.emit('register', { userId: user.id, email: user.email });
    }
  }, [socket, user]);

  useEffect(() => {
    let socketInstance: Socket | null = null;

    try {
      socketInstance = io(serverUrl);

      socketInstance.on('connect', () => {
        console.log('Socket connecté au serveur');
        setSocket(socketInstance);
        setIsConnected(true);
        setError(null);
        
        if (onConnect) {
          onConnect();
        }
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket déconnecté du serveur');
        setIsConnected(false);
        
        if (onDisconnect) {
          onDisconnect();
        }
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Erreur de connexion socket:', err);
        setError(err);
        
        if (onError) {
          onError(err);
        }
      });
    } catch (err) {
      console.error('Erreur lors de la création du socket:', err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
      
      if (onError && err instanceof Error) {
        onError(err);
      }
    }

    return () => {
      if (socketInstance) {
        console.log('Déconnexion du socket');
        socketInstance.disconnect();
      }
    };
  }, [serverUrl, onConnect, onDisconnect, onError]);

  useEffect(() => {
    registerUser();
  }, [registerUser]);

  const emit = useCallback(<T>(eventName: string, data: T) => {
    if (socket && isConnected) {
      socket.emit(eventName, data);
      return true;
    }
    return false;
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    error,
    emit,
    registerUser
  };
} 