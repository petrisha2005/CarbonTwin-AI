import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOnboardingStatus, getPostLoginRedirect } from "../services/onboardingService";
import { LandingPage } from "../pages/LandingPage";

export function SmartRoot() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      getOnboardingStatus()
        .then((status) => navigate(getPostLoginRedirect(status), { replace: true }))
        .catch(() => navigate("/dashboard", { replace: true }));
    }
  }, [loading, navigate, user]);

  if (loading) return <div className="grid min-h-screen place-items-center text-neon-green">Syncing CarbonTwin...</div>;
  if (user) return <div className="grid min-h-screen place-items-center text-neon-green">Opening your CarbonTwin...</div>;
  return <LandingPage />;
}
