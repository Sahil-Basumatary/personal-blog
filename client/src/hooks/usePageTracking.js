import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initGA, trackPageView } from "../lib/analytics/gtag";

export function usePageTracking() {
  const location = useLocation();
  useEffect(() => {
    initGA();
  }, []);
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
}
