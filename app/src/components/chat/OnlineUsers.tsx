import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { UserRound, Clock } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

type UserStatus = "online" | "offline";

interface ConnectedUser {
  userId: string;
  email: string;
  lastSeen: string;
  status: UserStatus;
}

interface OnlineUsersProps {
  socket: Socket | null;
}

const getTimeAgo = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: fr,
      includeSeconds: true,
    });
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", error);
    return "Date inconnue";
  }
};

const OnlineUsers: React.FC<OnlineUsersProps> = ({ socket }) => {
  const [users, setUsers] = useState<ConnectedUser[]>([]);
  const [, setRefreshTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshTime(new Date());
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleConnectedUsers = (users: ConnectedUser[]) => {
      console.log("Received users:", users);
      const sortedUsers = [...users].sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === "online" ? -1 : 1;
        }
        return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
      });

      setUsers(sortedUsers);
    };

    socket.on("connectedUsers", handleConnectedUsers);

    return () => {
      socket.off("connectedUsers", handleConnectedUsers);
    };
  }, [socket]);

  const onlineUsers = users.filter((user) => user.status === "online");
  const offlineUsers = users.filter((user) => user.status === "offline");

  return (
    <div className="h-full">
      <div className="flex items-center mb-2">
        <UserRound className="mr-2" size={18} />
        <h3 className="text-sm font-semibold">Utilisateurs ({users.length})</h3>
      </div>

      {users.length === 0 ? (
        <p className="text-gray-500 text-xs">Aucun utilisateur enregistré</p>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="text-xs font-semibold text-green-600 mb-1">
              En ligne ({onlineUsers.length})
            </div>

            {onlineUsers.length > 0 ? (
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
                {onlineUsers.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center bg-white border border-green-100 rounded-lg px-3 py-1.5 shadow-sm"
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs font-medium text-gray-800 truncate max-w-36">
                      {user.email}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-xs ml-1">
                Aucun utilisateur en ligne
              </p>
            )}
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500 mb-1">
              Hors ligne ({offlineUsers.length})
            </div>

            {offlineUsers.length > 0 ? (
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
                {offlineUsers.map((user) => {
                  const timeAgo = getTimeAgo(user.lastSeen);

                  return (
                    <div
                      key={user.userId}
                      className="flex items-center bg-white border border-gray-100 rounded-lg px-3 py-1.5 shadow-sm opacity-75"
                    >
                      <div className="h-2.5 w-2.5 rounded-full bg-gray-300 mr-2"></div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-600 truncate max-w-36">
                          {user.email}
                        </span>
                        <div className="flex items-center">
                          <Clock size={10} className="text-gray-400 mr-1" />
                          <span className="text-[10px] text-gray-500">
                            {timeAgo}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-xs ml-1">
                Aucun utilisateur hors ligne
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineUsers;
