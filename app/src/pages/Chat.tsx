import { useAuth } from "@/contexts/AuthContext";
import MessageForm from "../components/chat/MessageForm";
import MessageList from "../components/chat/MessageList";
import UserInfo from "../components/chat/UserInfo";
import { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, UserRound, LogOut, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useConnectedUsers } from "@/hooks/useConnectedUsers";
import { getInitials, getTimeAgo } from "@/utils/formatters";

interface ChatProps {
  socket: Socket | null;
}

const Chat = ({ socket }: ChatProps) => {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showUsersList, setShowUsersList] = useState(false);
  
  const { onlineUsers, offlineUsers } = useConnectedUsers(socket);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: string) => {
      console.log("New message received:", message);
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    };

    socket.on("messageFromBack", handleNewMessage);

    return () => {
      socket.off("messageFromBack", handleNewMessage);
    };
  }, [socket, queryClient]);

  const handleLogout = () => {
    signOut();
    navigate("/signin");
  };

  return (
    <div className="h-screen w-full bg-[#191c26] text-gray-100 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3 relative">
          <div 
            className="flex -space-x-2 items-center cursor-pointer group"
            onMouseEnter={() => setShowUsersList(true)}
            onMouseLeave={() => setShowUsersList(false)}
          >
            {onlineUsers.length > 0 ? (
              <>
                {onlineUsers.slice(0, 3).map((connectedUser, index) => (
                  <Avatar 
                    key={connectedUser.userId}
                    className="h-8 w-8 ring-2 ring-[#191c26] transition-all duration-300"
                    style={{ zIndex: 10 - index }}
                  >
                    <AvatarImage src={`https://avatar.vercel.sh/${connectedUser.userId}`} />
                    <AvatarFallback className="bg-indigo-600 text-white text-xs">
                      {getInitials(connectedUser.email)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {onlineUsers.length > 3 && (
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center ring-2 ring-[#191c26] text-xs">
                    +{onlineUsers.length - 3}
                  </div>
                )}
              </>
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center ring-2 ring-[#191c26]">
                <UserRound size={16} />
              </div>
            )}
            
            {showUsersList && (
              <div className="absolute top-full left-0 mt-2 bg-gray-800 rounded-lg shadow-lg py-2 px-3 w-64 z-50 transform origin-top-left transition-all duration-200">
                <div className="mb-3">
                  <p className="text-xs font-medium text-green-400 mb-2 flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                    En ligne ({onlineUsers.length})
                  </p>
                  {onlineUsers.length > 0 ? (
                    <div className="space-y-1.5">
                      {onlineUsers.map(user => (
                        <div key={user.userId} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-700/50">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://avatar.vercel.sh/${user.userId}`} />
                            <AvatarFallback className="bg-indigo-600 text-white text-[10px]">
                              {getInitials(user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate flex-1">{user.email}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic px-2">Aucun utilisateur en ligne</p>
                  )}
                </div>
                
                {offlineUsers.length > 0 && (
                  <div className="h-px bg-gray-700 my-2"></div>
                )}
                
                {offlineUsers.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-2 flex items-center">
                      <span className="h-2 w-2 rounded-full bg-gray-500 mr-1.5"></span>
                      Hors ligne ({offlineUsers.length})
                    </p>
                    <div className="space-y-1.5">
                      {offlineUsers.map(user => (
                        <div key={user.userId} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-700/50">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://avatar.vercel.sh/${user.userId}`} />
                            <AvatarFallback className="bg-gray-600 text-white text-[10px]">
                              {getInitials(user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                            <div className="text-sm truncate">{user.email}</div>
                            <div className="flex items-center text-[10px] text-gray-400">
                              <Clock size={9} className="mr-0.5" />
                              <span className="truncate">{getTimeAgo(user.lastSeen)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="font-medium">Chat en temps réel</div>
        </div>
        
        {user && (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors py-1.5 px-3 rounded-full hover:bg-gray-800"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        )}
      </div>

  
      <div className="flex-1 overflow-hidden">
        <MessageList />
      </div>

    
      <div className="p-3 border-t border-gray-800">
        {user ? (
          <div className="flex items-end gap-2">
            <button className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center">
              <Plus size={18} />
            </button>
            <div className="flex-1">
              <MessageForm socket={socket} />
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-gray-800/50 text-center">
            <p className="text-gray-400">Connectez-vous pour envoyer des messages</p>
            <div className="mt-2">
              <UserInfo />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
