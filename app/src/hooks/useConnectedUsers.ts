import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

export interface ConnectedUser {
  userId: string;
  email: string;
  lastSeen: string;
  status: "online" | "offline";
}


export function useConnectedUsers(socket: Socket | null, maxOfflineUsers = 10) {
  const [onlineUsers, setOnlineUsers] = useState<ConnectedUser[]>([]);
  const [offlineUsers, setOfflineUsers] = useState<ConnectedUser[]>([]);
  const [allUsers, setAllUsers] = useState<ConnectedUser[]>([]);
  const [, setRefreshTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshTime(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleConnectedUsers = (users: ConnectedUser[]) => {

      setAllUsers(users);
      
      setOnlineUsers(users.filter(u => u.status === "online"));
      
      setOfflineUsers(users
        .filter(u => u.status === "offline")
        .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
        .slice(0, maxOfflineUsers)
      );
    };

    socket.on("connectedUsers", handleConnectedUsers);

    return () => {
      socket.off("connectedUsers", handleConnectedUsers);
    };
  }, [socket, maxOfflineUsers]);

  return {
    onlineUsers,
    offlineUsers,
    allUsers,
    totalOnline: onlineUsers.length,
    totalOffline: offlineUsers.length,
    totalUsers: allUsers.length
  };
} 