import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Chat from "./pages/Chat";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import "./App.css";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const queryClient = new QueryClient();

type UserStatus = "online" | "offline";

interface ConnectedUser {
  userId: string;
  email: string;
  lastSeen: string;
  status: UserStatus;
}

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Connected to server");
      setSocket(socket);

      if (user && user.id) {
        socket.emit("register", { userId: user.id, email: user.email });
      }
    });

    socket.on("messageFromBack", (message: string) => {
      console.log("Message from server: ", message);
    });

    socket.on("connectedUsers", (users: ConnectedUser[]) => {
      console.log("Connected users: ", users);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (socket && user && user.id) {
      socket.emit("register", { userId: user.id, email: user.email });
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

function AppContent() {
  const { socket } = useSocket();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chat socket={socket} />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
