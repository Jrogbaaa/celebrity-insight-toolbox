import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import Analytics from "./pages/Analytics";
import Recommendations from "./pages/Recommendations";
import Generation from "./pages/Generation";
import InstagramCallback from "./pages/InstagramCallback";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: tokens, error } = await supabase
          .from('instagram_tokens')
          .select('*')
          .maybeSingle();
        
        if (error) {
          console.error('Error checking authentication:', error);
          setIsAuthenticated(false);
          navigate("/login", { state: { from: location.pathname } });
          return;
        }

        setIsAuthenticated(!!tokens);
        if (!tokens) {
          navigate("/login", { state: { from: location.pathname } });
        }
      } catch (error) {
        console.error('Error in checkAuth:', error);
        setIsAuthenticated(false);
        navigate("/login", { state: { from: location.pathname } });
      }
    };

    checkAuth();
  }, [navigate, location]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
};

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background pb-14">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/analytics" replace />} />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommendations"
                element={
                  <ProtectedRoute>
                    <Recommendations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/generation"
                element={
                  <ProtectedRoute>
                    <Generation />
                  </ProtectedRoute>
                }
              />
              <Route path="/instagram-callback" element={<InstagramCallback />} />
            </Routes>
            <Navigation />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;