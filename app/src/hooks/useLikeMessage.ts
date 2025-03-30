import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Socket } from "socket.io-client";
import { Message, messageService } from "../services/messageService";


interface UseLikeMessageOptions {
  socket: Socket | null;
  userId?: string;
  onError?: (error: Error, messageId: string) => void;
}

export function useLikeMessage(options: UseLikeMessageOptions) {
  const { socket, userId, onError } = options;
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: (messageId: string) => messageService.likeMessage(messageId),
    onSuccess: (_, messageId) => {
      if (socket) {
        socket.emit("messageLiked", { messageId });
      }
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (error: Error, messageId) => {
      console.error("Erreur lors du like:", error);
      if (onError) onError(error, messageId);
    }
  });

  const unlikeMutation = useMutation({
    mutationFn: (messageId: string) => messageService.unlikeMessage(messageId),
    onSuccess: (_, messageId) => {
      if (socket) {
        socket.emit("messageLiked", { messageId });
      }
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (error: Error, messageId) => {
      console.error("Erreur lors du unlike:", error);
      if (onError) onError(error, messageId);
    }
  });


  const hasUserLiked = (message: Message): boolean => {
    if (!userId) return false;
    return messageService.hasUserLiked(message, userId);
  };

  const toggleLike = (message: Message) => {
    if (!userId) return;

    const hasLiked = hasUserLiked(message);

    if (hasLiked) {
      unlikeMutation.mutate(message.id);
    } else {
      likeMutation.mutate(message.id);
    }
  };

  return {
    toggleLike,
    hasUserLiked,
    likeMutation,
    unlikeMutation,
    isLoading: likeMutation.isPending || unlikeMutation.isPending
  };
} 