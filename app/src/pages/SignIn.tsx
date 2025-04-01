import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthForm from "../components/AuthForm";
import { AuthFormData } from "../services/authService";

export default function SignIn() {
  const { signIn, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (data: AuthFormData) => {
    setFormError(null);
    clearError();

    try {
      await signIn(data);
      navigate("/");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la connexion";
      setFormError(errorMessage);
      console.error("Erreur de connexion:", err);
    }
  };

  return (
    <AuthForm
      title="Connexion à votre compte"
      submitButtonText="Se connecter"
      onSubmit={handleSubmit}
      redirectText="Pas encore de compte ?"
      redirectLinkText="S'inscrire"
      redirectTo="/signup"
      isLoading={isLoading}
      error={formError || (error ? error.message : null)}
    />
  );
}
