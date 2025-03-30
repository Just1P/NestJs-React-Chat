import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthForm from "../components/AuthForm";
import { AuthFormData } from "../services/authService";

export default function SignUp() {
  const { signUp, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (data: AuthFormData) => {
    setFormError(null);
    clearError();
    
    try {
      await signUp(data);
      navigate("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'inscription";
      setFormError(errorMessage);
      console.error("Erreur d'inscription:", err);
    }
  };

  return (
    <AuthForm
      title="Créer un compte"
      submitButtonText="S'inscrire"
      onSubmit={handleSubmit}
      redirectText="Déjà inscrit ?"
      redirectLinkText="Se connecter"
      redirectTo="/signin"
      isLoading={isLoading}
      error={formError || (error ? error.message : null)}
    />
  );
}
