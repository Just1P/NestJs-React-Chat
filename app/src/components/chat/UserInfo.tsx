import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { LogIn } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserInfo: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Button
        onClick={() => navigate("/signin")}
        variant="outline"
        className="gap-2 w-full text-foreground cursor-pointer"
      >
        <LogIn className="h-4 w-4" />
        <span>Se connecter</span>
      </Button>
    );
  }

  const getInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(".")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar className="h-10 w-10 border-2 border-background">
          <AvatarImage src={`https://avatar.vercel.sh/${user.id}`} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(user.email)}
          </AvatarFallback>
        </Avatar>
        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
      </div>
      <div className="flex flex-col">
        <span className="font-medium text-sm">{user.email}</span>
        <span className="text-xs text-muted-foreground">En ligne</span>
      </div>
    </div>
  );
};

export default UserInfo;
