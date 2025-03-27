import { useAuth } from "@/contexts/AuthContext";
import MessageForm from "../components/chat/MessageForm";
import MessageList from "../components/chat/MessageList";
import UserInfo from "../components/chat/UserInfo";
import LogoutButton from "../components/LogoutButton";
import OnlineUsers from "../components/chat/OnlineUsers";
import { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface ChatProps {
  socket: Socket | null;
}

const Chat = ({ socket }: ChatProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  return (
    <div className="container mx-auto w-full h-screen">
      <div className="rounded-lg w-full h-full">
        <div className="h-5/6 relative">
          <div className="bg-white/95 h-auto min-h-28 absolute top-0 right-0 left-0 z-10 shadow-sm p-3 pb-4">
            <OnlineUsers socket={socket} />
          </div>
          <div className="overflow-y-scroll h-full pt-32">
            <MessageList />
          </div>
        </div>
        <div className="h-1/6 flex justify-center items-center">
          <div className="w-full flex flex-col gap-4">
            {user && (
              <div className="">
                <MessageForm socket={socket} />
              </div>
            )}
            <div className="flex justify-between">
              <UserInfo />
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
