import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { messageService, Message } from "../../services/messageService";
import { useAuth } from "../../contexts/AuthContext";
import { Heart } from "lucide-react";
import { useSocket } from "../../App";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLikeMessage } from "@/hooks/useLikeMessage";
import { getInitials, formatMessageTime } from "@/utils/formatters";

const MessageList: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { socket } = useSocket();

  const likeManager = useLikeMessage({
    socket,
    userId: user?.id,
    onError: (error) => {
      console.error("Erreur lors de la gestion des likes:", error);
    },
  });

  const {
    data: messages,
    isLoading,
    error,
    refetch,
  } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: () => messageService.findAll(),
  });

  const previousMessagesCountRef = useRef<number>(0);

  useEffect(() => {
    if (!socket) return;

    const handleLikeUpdate = (messageId: string) => {
      console.log("Message liked/unliked:", messageId);
      refetch();
    };

    socket.on("messageUpdateLikes", handleLikeUpdate);

    return () => {
      socket.off("messageUpdateLikes", handleLikeUpdate);
    };
  }, [socket, refetch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!messages) return;

    if (
      previousMessagesCountRef.current === 0 ||
      messages.length > previousMessagesCountRef.current
    ) {
      scrollToBottom();
    }

    previousMessagesCountRef.current = messages.length;
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#191c26]">
        <div className="text-center">
          <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-400">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-[#191c26]">
        <div className="text-center text-red-400">
          <p>Erreur lors du chargement des messages.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 border-gray-700 text-gray-300 hover:bg-gray-800"
            onClick={() => refetch()}
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full px-3">
      <div className="space-y-3 pb-4 pt-2 w-full">
        {messages?.map((message) => {
          const isLiked = user && likeManager.hasUserLiked(message);
          const isCurrentUser = user && user.id === message.user?.id;

          const messageTime = formatMessageTime(message.createdAt);

          return (
            <div
              key={message.id}
              className={cn(
                "flex w-full mb-1",
                isCurrentUser ? "justify-end" : "justify-start"
              )}
            >
              {!isCurrentUser && (
                <Avatar className="h-8 w-8 shrink-0 mt-1 mr-2">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${message.user?.id}`}
                  />
                  <AvatarFallback className="bg-blue-700 text-white text-xs">
                    {getInitials(message.user?.email || "User")}
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  "max-w-[80%]",
                  isCurrentUser ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "flex flex-col",
                    isCurrentUser ? "items-end" : "items-start"
                  )}
                >
                  {!isCurrentUser && (
                    <span className="text-[11px] text-gray-400 mb-1 ml-1">
                      {message.user?.email?.split("@")[0]}
                    </span>
                  )}

                  <div
                    className={cn(
                      "px-3 py-2 mb-1 rounded-2xl text-sm break-words leading-relaxed cursor-pointer min-w-[80px]",
                      isCurrentUser
                        ? "bg-blue-600 text-white rounded-br-none hover:bg-blue-700"
                        : "bg-gray-800 text-gray-100 rounded-bl-none hover:bg-gray-700"
                    )}
                    onDoubleClick={() =>
                      user && likeManager.toggleLike(message)
                    }
                    title="Double-cliquez pour aimer ce message"
                  >
                    {message.text}
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-2 w-full",
                      isCurrentUser ? "justify-end" : "justify-start"
                    )}
                  >
                    {isCurrentUser ? (
                      <>
                        <button
                          onClick={() => likeManager.toggleLike(message)}
                          disabled={!user || likeManager.isLoading}
                          className="flex items-center hover:opacity-100 transition-opacity group"
                          title={isLiked ? "Je n'aime plus" : "J'aime"}
                        >
                          <Heart
                            size={13}
                            className={cn(
                              "mr-0.5 transition-all duration-200 group-hover:scale-110",
                              isLiked
                                ? "fill-red-500 text-red-500"
                                : "text-gray-500 group-hover:text-red-400"
                            )}
                          />
                          {!!message.likesCount && (
                            <span
                              className={cn(
                                "text-[10px] transition-colors",
                                isLiked ? "text-red-400" : "text-gray-500"
                              )}
                            >
                              {message.likesCount}
                            </span>
                          )}
                        </button>
                        <span className="text-[11px] text-gray-500">
                          {messageTime}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] text-gray-500">
                          {messageTime}
                        </span>
                        <button
                          onClick={() => likeManager.toggleLike(message)}
                          disabled={!user || likeManager.isLoading}
                          className="flex items-center hover:opacity-100 transition-opacity group"
                          title={isLiked ? "Je n'aime plus" : "J'aime"}
                        >
                          <Heart
                            size={13}
                            className={cn(
                              "mr-0.5 transition-all duration-200 group-hover:scale-110",
                              isLiked
                                ? "fill-red-500 text-red-500"
                                : "text-gray-500 group-hover:text-red-400"
                            )}
                          />
                          {!!message.likesCount && (
                            <span
                              className={cn(
                                "text-[10px] transition-colors",
                                isLiked ? "text-red-400" : "text-gray-500"
                              )}
                            >
                              {message.likesCount}
                            </span>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isCurrentUser && (
                <Avatar className="h-8 w-8 shrink-0 mt-1 ml-2">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${message.user?.id}`}
                  />
                  <AvatarFallback className="bg-indigo-600 text-white text-xs">
                    {getInitials(message.user?.email || "User")}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default MessageList;
