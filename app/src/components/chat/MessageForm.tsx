import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  messageService,
  CreateMessageDto,
} from "../../services/messageService";
import { SendHorizontal } from "lucide-react";
import { Socket } from "socket.io-client";
import { cn } from "@/lib/utils";

interface MessageFormProps {
  socket: Socket | null;
}

const MessageForm: React.FC<MessageFormProps> = ({ socket }) => {
  const { register, handleSubmit, reset, watch } = useForm<CreateMessageDto>();
  const queryClient = useQueryClient();
  const messageText = watch("text", "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allowToSend = messageText.trim() !== "";

  const mutation = useMutation({
    mutationFn: (data: CreateMessageDto) => messageService.create(data),
    onSuccess: () => {
      setErrorMessage(null);

      queryClient.invalidateQueries({ queryKey: ["messages"] });

      if (socket) {
        socket.emit("message", "new message created");
      }

      reset();
    },
    onError: (error: Error) => {
      console.error("Erreur lors de l'envoi du message:", error);
      setErrorMessage("Erreur lors de l'envoi. Veuillez réessayer.");
    },
  });

  const onSubmit = (data: CreateMessageDto) => {
    if (!allowToSend) return;

    try {
      mutation.mutate(data);
    } catch (error) {
      console.error("Exception non gérée lors de l'envoi:", error);
      setErrorMessage("Une erreur inattendue s'est produite.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative">
      <div className="relative flex w-full items-center">
        <input
          {...register("text", { required: true })}
          type="text"
          placeholder="Type a message here..."
          className="w-full rounded-full bg-gray-800 border-none text-gray-200 py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
          autoComplete="off"
          aria-invalid={!!errorMessage}
          disabled={mutation.isPending}
        />

        <button
          type="submit"
          disabled={mutation.isPending || !allowToSend}
          className={cn(
            "absolute right-1.5 h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center transition-all duration-200 text-white",
            allowToSend
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-1",
            mutation.isPending && "opacity-70"
          )}
        >
          {mutation.isPending ? (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <SendHorizontal className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      {errorMessage && (
        <p className="mt-2 text-xs text-red-400 pl-2">{errorMessage}</p>
      )}
    </form>
  );
};

export default MessageForm;
