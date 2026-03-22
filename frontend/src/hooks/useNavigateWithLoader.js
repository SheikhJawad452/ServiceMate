import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function useNavigateWithLoader() {
  const navigate = useNavigate();
  const { navigateWithLoader } = useAuth();

  return useCallback(
    (to, options = {}) => {
      navigateWithLoader(navigate, to, options);
    },
    [navigate, navigateWithLoader],
  );
}
