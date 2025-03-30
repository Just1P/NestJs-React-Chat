import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { UserRound, Clock } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const getInitials = (email: string) => {
  return email
    .split("@")[0]
    .split(".")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
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
    <div className="h-full p-1">
      <div className="flex items-center mb-2">
        <UserRound className="mr-2 text-primary" size={18} />
        <h3 className="text-sm font-semibold">Utilisateurs connectés ({users.length})</h3>
      </div>

      {users.length === 0 ? (
        <div className="flex items-center justify-center h-14 border rounded-md bg-muted/20">
          <p className="text-sm text-muted-foreground">Aucun utilisateur enregistré</p>
        </div>
      ) : (
        <ScrollArea className="h-[120px]">
          <div className="space-y-3">
            {onlineUsers.length > 0 && (
              <div>
                <div className="flex items-center text-xs font-medium text-green-600 mb-2">
                  <span className="flex h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                  En ligne ({onlineUsers.length})
                </div>

                <div className="grid grid-cols-2 gap-2 pb-2">
                  {onlineUsers.map((user) => (
                    <div
                      key={user.userId}
                      className="flex items-center gap-2 p-1.5 border rounded-lg bg-card shadow-sm"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://avatar.vercel.sh/${user.userId}`} />
                        <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium truncate max-w-24">
                        {user.email}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {offlineUsers.length > 0 && (
              <div>
                {onlineUsers.length > 0 && <Separator className="my-2" />}
                
                <div className="flex items-center text-xs font-medium text-muted-foreground mb-2">
                  <span className="flex h-2 w-2 rounded-full bg-muted mr-1.5"></span>
                  Hors ligne ({offlineUsers.length})
                </div>

                <div className="grid grid-cols-2 gap-2 pb-2">
                  {offlineUsers.map((user) => {
                    const timeAgo = getTimeAgo(user.lastSeen);

                    return (
                      <div
                        key={user.userId}
                        className="flex items-center gap-2 p-1.5 border rounded-lg bg-card/80 shadow-sm opacity-75"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={`https://avatar.vercel.sh/${user.userId}`} />
                          <AvatarFallback className="bg-muted text-[10px]">{getInitials(user.email)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-medium truncate max-w-24">
                            {user.email}
                          </span>
                          <div className="flex items-center">
                            <Clock size={10} className="text-muted-foreground mr-1" />
                            <span className="text-[10px] text-muted-foreground truncate">
                              {timeAgo}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default OnlineUsers;
