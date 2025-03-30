import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";


export const getInitials = (email: string): string => {
  if (!email) return "??";
  
  return email
    .split("@")[0]
    .split(".")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};


export const getTimeAgo = (dateString: string): string => {
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

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}; 