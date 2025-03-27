import React, { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messageService, Message } from "../../services/messageService";
import { useAuth } from "../../contexts/AuthContext";
import { Heart } from "lucide-react";
import { useSocket } from "../../App";

const MessageList: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const {
    data: messages,
    isLoading,
    error,
  } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: () => messageService.findAll(),
  });

  useEffect(() => {
    if (!socket) return;

    const handleLikeUpdate = (messageId: string) => {
      console.log("Message liked/unliked:", messageId);
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    };

    socket.on("messageUpdateLikes", handleLikeUpdate);

    return () => {
      socket.off("messageUpdateLikes", handleLikeUpdate);
    };
  }, [socket, queryClient]);

  const likeMutation = useMutation({
    mutationFn: (messageId: string) => messageService.likeMessage(messageId),
    onSuccess: (_, messageId) => {
      if (socket) {
        socket.emit("messageLiked", { messageId });
      }
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: (messageId: string) => messageService.unlikeMessage(messageId),
    onSuccess: (_, messageId) => {
      if (socket) {
        socket.emit("messageLiked", { messageId });
      }
    },
  });

  const handleLikeToggle = (message: Message) => {
    if (!user) return;

    const hasLiked = messageService.hasUserLiked(message, user.id);

    if (hasLiked) {
      unlikeMutation.mutate(message.id);
    } else {
      likeMutation.mutate(message.id);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return <div className="text-center">Loading messages...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Error loading messages. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages?.map((message) => {
        const isLiked = user && messageService.hasUserLiked(message, user.id);

        return (
          <div
            key={message.id}
            className="rounded-lg bg-white p-4 shadow-sm relative"
          >
            {/* Bouton like positionné à droite */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => handleLikeToggle(message)}
                disabled={!user}
                className={`flex items-center gap-1 ${
                  !user
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-red-500 transition-colors"
                }`}
              >
                <Heart
                  size={18}
                  className={`transition-all ${
                    isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                <span className="text-sm font-medium">
                  {message.likesCount || 0}
                </span>
              </button>
            </div>

            <div className="pr-12">
              <p className="text-gray-800">{message.text}</p>
              <div className="flex justify-between items-center text-sm text-gray-500/60 mt-4">
                <p>{message?.user?.email}</p>
                <p>{new Date(message.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
