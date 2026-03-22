import { useEffect, useState } from "react";
import { useLocation, useRoutes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import LoadingScreen from "@/components/common/LoadingScreen";
import { routesConfig } from "@/routes";

function AppRoutes() {
  const location = useLocation();
  const element = useRoutes(routesConfig, location);

  return element;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const readyTimer = window.setTimeout(() => setReady(true), 1200);
    const doneTimer = window.setTimeout(() => setLoading(false), 1550);

    return () => {
      window.clearTimeout(readyTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (loading) {
    return <LoadingScreen ready={ready} />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
