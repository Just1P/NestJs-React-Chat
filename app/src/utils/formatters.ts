import { formatDistanceToNow, parseISO, format } from "date-fns";
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
  const validDate =
    date instanceof Date && !isNaN(date.getTime()) ? date : new Date();

  return format(validDate, "HH:mm", { locale: fr });
};

export const formatMessageTime = (dateInput: string | Date): string => {
  try {
    let date: Date;
    if (typeof dateInput === "string") {
      date = parseISO(dateInput);
    } else if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      date = new Date(dateInput);
    } else {
      return "--";
    }

    const correctedDate = new Date(date);
    correctedDate.setHours(date.getHours() + 2);

    return formatDistanceToNow(correctedDate, {
      addSuffix: true,
      locale: fr,
      includeSeconds: true,
    });
  } catch (error) {
    console.error("Erreur lors du formatage de l'heure du message:", error);
    return "--";
  }
};
