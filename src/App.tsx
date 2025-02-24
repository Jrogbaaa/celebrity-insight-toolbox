
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Analytics from "./pages/Analytics";
import Generation from "./pages/Generation";
import TermsOfService from "./pages/TermsOfService";
import TikTokCallback from "./pages/TikTokCallback";
import { Button } from "@/components/ui/button";

const Layout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-4">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center">
            <Link to="/">
              <img 
                src="/lovable-uploads/e7bef072-8d1a-4444-a41f-6dca6ff42c63.png" 
                alt="Look After You" 
                className="h-32 w-auto object-contain transition-all duration-300 hover:scale-105 cursor-pointer"
              />
            </Link>
          </div>
          <div className="flex gap-4">
            <Button 
              variant={location.pathname === "/analytics" ? "default" : "outline"}
              size="lg"
              className="shadow-md hover:shadow-lg transition-all duration-300"
              asChild
            >
              <Link to="/analytics" className="flex items-center gap-2">
                My Analytics Hub
              </Link>
            </Button>
            <Button 
              variant={location.pathname === "/generation" ? "default" : "outline"}
              size="lg"
              className="shadow-md hover:shadow-lg transition-all duration-300"
              asChild
            >
              <Link to="/generation" className="flex items-center gap-2">
                Creative Studio AI
              </Link>
            </Button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

const WelcomePage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
    <h1 className="text-4xl font-bold text-primary mb-6">Welcome to Your Social Media Command Center</h1>
    <p className="text-xl text-muted-foreground mb-12 text-center max-w-2xl">
      Analyze your social media performance, generate AI-powered content, and get personalized recommendations to grow your audience.
    </p>
    <div className="flex gap-6">
      <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-all">
        <Link to="/analytics">Explore Analytics</Link>
      </Button>
      <Button size="lg" variant="outline" asChild className="shadow hover:shadow-lg transition-all">
        <Link to="/generation">Create Content</Link>
      </Button>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><WelcomePage /></Layout>} />
            <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
            <Route path="/generation" element={<Layout><Generation /></Layout>} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/tiktok-callback" element={<TikTokCallback />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
